import React, { useState } from 'react';
import { Voucher, Account, OpeningBalance } from '../../types/accounting';
import { format } from 'date-fns';
import { safeFormat } from '../../utils/dateUtils';
import { ChevronDown, Search } from 'lucide-react';

interface GeneralLedgerProps {
  vouchers: Voucher[];
  accounts: Account[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    accountCode: string;
  };
}

export const GeneralLedger: React.FC<GeneralLedgerProps> = ({ vouchers, accounts, openingBalances, workingYear, filters }) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    filters.accountCode ? accounts.find(a => a.code === filters.accountCode) || null : null
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Update selected account if filter changes
  React.useEffect(() => {
    if (filters.accountCode) {
      const acc = accounts.find(a => a.code === filters.accountCode);
      if (acc) setSelectedAccount(acc);
    }
  }, [filters.accountCode, accounts]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const filteredAccounts = accounts.filter(acc => 
    acc.code.includes(searchTerm) || acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLedgerData = () => {
    if (!selectedAccount) return { ledger: [], opening: 0 };

    let runningBalance = 0;

    // 1. Add opening balance from DB for the year
    openingBalances.forEach(ob => {
      if (ob.accountCode === selectedAccount.code) {
        runningBalance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

    // 2. Add transactions before startDate
    vouchers.forEach(v => {
      if (v.date < filters.startDate) {
        v.items?.forEach(item => {
          if (item.debitAccount?.startsWith(selectedAccount.code)) {
            runningBalance += item.amount;
          } else if (item.creditAccount?.startsWith(selectedAccount.code)) {
            runningBalance -= item.amount;
          }
        });
      }
    });

    const openingAtStart = runningBalance;
    const ledger: any[] = [];

    // 3. Add transactions within range
    const sortedVouchers = [...vouchers]
      .filter(v => v.date >= filters.startDate && v.date <= filters.endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    sortedVouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.debitAccount?.startsWith(selectedAccount.code)) {
          runningBalance += item.amount;
          ledger.push({
            date: v.date,
            number: v.number,
            description: v.description,
            debit: item.amount,
            credit: 0,
            balance: runningBalance,
            reciprocalAccount: item.creditAccount
          });
        } else if (item.creditAccount?.startsWith(selectedAccount.code)) {
          runningBalance -= item.amount;
          ledger.push({
            date: v.date,
            number: v.number,
            description: v.description,
            debit: 0,
            credit: item.amount,
            balance: runningBalance,
            reciprocalAccount: item.debitAccount
          });
        }
      });
    });

    return { ledger, opening: openingAtStart };
  };

  const { ledger: ledgerData, opening: openingBalance } = getLedgerData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 w-full relative">
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            value={selectedAccount?.code || ''}
            onChange={(e) => setSelectedAccount(accounts.find(a => a.code === e.target.value) || null)}
          >
            <option value="">-- Chọn tài khoản --</option>
            {filteredAccounts.map(acc => (
              <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {selectedAccount ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 text-center">
            <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Cái Tài Khoản</h2>
            <p className="text-blue-600 font-bold mt-1">{selectedAccount.code} - {selectedAccount.name}</p>
            <p className="text-slate-500 mt-2">Năm {workingYear}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#1877F2] text-white text-xs uppercase">
                  <th className="px-4 py-3 border border-white/20">Ngày HT</th>
                  <th className="px-4 py-3 border border-white/20">Ngày CT</th>
                  <th className="px-4 py-3 border border-white/20">Số hiệu</th>
                  <th className="px-4 py-3 border border-white/20">Diễn giải</th>
                  <th className="px-4 py-3 border border-white/20">Mã đối ứng</th>
                  <th className="px-4 py-3 text-right border border-white/20">Nợ</th>
                  <th className="px-4 py-3 text-right border border-white/20">Có</th>
                  <th className="px-4 py-3 text-right border border-white/20">Số dư</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="bg-slate-50 font-bold text-sm">
                  <td colSpan={7} className="px-4 py-3 text-right border border-slate-100 uppercase">Số dư đầu kỳ</td>
                  <td className="px-4 py-3 text-right border border-slate-100">{formatCurrency(openingBalance)}</td>
                </tr>
                {ledgerData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-6 py-4 text-slate-500 border border-slate-100">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 text-slate-500 border border-slate-100">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 border border-slate-100">{row.number}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-100">{row.description}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 border border-slate-100">{row.reciprocalAccount}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 border border-slate-100">
                      {row.debit > 0 ? formatCurrency(row.debit) : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 border border-slate-100">
                      {row.credit > 0 ? formatCurrency(row.credit) : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-right border border-slate-200 uppercase">Tổng phát sinh</td>
                  <td className="px-4 py-4 text-right border border-slate-200">
                    {formatCurrency(ledgerData.reduce((sum, r) => sum + r.debit, 0))}
                  </td>
                  <td className="px-4 py-4 text-right border border-slate-200">
                    {formatCurrency(ledgerData.reduce((sum, r) => sum + r.credit, 0))}
                  </td>
                  <td className="px-4 py-4 text-right border border-slate-200">
                    {formatCurrency(ledgerData[ledgerData.length - 1]?.balance || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa chọn tài khoản</h3>
          <p className="text-slate-500">Vui lòng chọn một tài khoản từ danh sách trên để xem sổ cái.</p>
        </div>
      )}
    </div>
  );
};
