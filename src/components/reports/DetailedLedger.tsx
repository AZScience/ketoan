import React, { useState, useEffect } from 'react';
import { Voucher, Account, OpeningBalance } from '../../types/accounting';
import { safeFormat } from '../../utils/dateUtils';
import { Search, ChevronDown, FileText, Printer, Download } from 'lucide-react';

interface DetailedLedgerProps {
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

export const DetailedLedger: React.FC<DetailedLedgerProps> = ({ 
  vouchers, 
  accounts, 
  openingBalances, 
  workingYear, 
  filters 
}) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    filters.accountCode ? accounts.find(a => a.code === filters.accountCode) || null : null
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

    // 1. Opening balance
    openingBalances.forEach(ob => {
      if (ob.accountCode === selectedAccount.code) {
        runningBalance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

    // 2. Transactions before startDate
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

    // 3. Transactions within range
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
            reciprocalAccount: item.creditAccount,
            debit: item.amount,
            credit: 0,
            balance: runningBalance
          });
        } else if (item.creditAccount?.startsWith(selectedAccount.code)) {
          runningBalance -= item.amount;
          ledger.push({
            date: v.date,
            number: v.number,
            description: v.description,
            reciprocalAccount: item.debitAccount,
            debit: 0,
            credit: item.amount,
            balance: runningBalance
          });
        }
      });
    });

    return { ledger, opening: openingAtStart };
  };

  const { ledger: ledgerData, opening: openingBalance } = getLedgerData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center no-print">
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
          <div className="p-8 border-b border-slate-100 text-center relative">
            <div className="absolute top-8 right-8 text-right text-[10px] text-slate-400 uppercase">
              <p className="font-bold">Mẫu số S08-BCTCNN</p>
              <p>(Ban hành kèm theo Thông tư số 99/2018/TT-BTC)</p>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Chi Tiết Tài Khoản</h2>
            <p className="text-blue-600 font-bold mt-1">Tài khoản: {selectedAccount.code} - {selectedAccount.name}</p>
            <p className="text-slate-500 mt-2">Từ ngày {safeFormat(filters.startDate, 'dd/MM/yyyy')} đến ngày {safeFormat(filters.endDate, 'dd/MM/yyyy')}</p>
            <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#1877F2] text-white text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3 border border-white/20 text-center" rowSpan={2}>Ngày, tháng ghi sổ</th>
                  <th className="px-4 py-3 border border-white/20 text-center" colSpan={2}>Chứng từ</th>
                  <th className="px-4 py-3 border border-white/20 text-center" rowSpan={2}>Diễn giải</th>
                  <th className="px-4 py-3 border border-white/20 text-center" rowSpan={2}>TK đối ứng</th>
                  <th className="px-4 py-3 border border-white/20 text-center" colSpan={2}>Số phát sinh</th>
                  <th className="px-4 py-3 border border-white/20 text-center" rowSpan={2}>Số dư</th>
                </tr>
                <tr className="bg-[#1877F2] text-white text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3 border border-white/20 text-center">Số hiệu</th>
                  <th className="px-4 py-3 border border-white/20 text-center">Ngày, tháng</th>
                  <th className="px-4 py-3 border border-white/20 text-center">Nợ</th>
                  <th className="px-4 py-3 border border-white/20 text-center">Có</th>
                </tr>
                <tr className="bg-slate-50 text-[9px] text-center italic text-slate-500">
                  <td className="border border-slate-200 py-1">A</td>
                  <td className="border border-slate-200 py-1">B</td>
                  <td className="border border-slate-200 py-1">C</td>
                  <td className="border border-slate-200 py-1">D</td>
                  <td className="border border-slate-200 py-1">E</td>
                  <td className="border border-slate-200 py-1">1</td>
                  <td className="border border-slate-200 py-1">2</td>
                  <td className="border border-slate-200 py-1">3</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="bg-slate-50 font-bold text-sm">
                  <td colSpan={7} className="px-4 py-3 text-right border border-slate-100 uppercase text-xs">Số dư đầu kỳ</td>
                  <td className="px-4 py-3 text-right border border-slate-100">{formatCurrency(openingBalance)}</td>
                </tr>
                {ledgerData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 py-4 text-slate-500 border border-slate-100 text-center">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-4 font-bold text-slate-900 border border-slate-100 text-center">{row.number}</td>
                    <td className="px-4 py-4 text-slate-500 border border-slate-100 text-center">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-4 text-slate-700 border border-slate-100">{row.description}</td>
                    <td className="px-4 py-4 font-mono text-slate-500 border border-slate-100 text-center">{row.reciprocalAccount}</td>
                    <td className="px-4 py-4 text-right font-bold text-blue-600 border border-slate-100">
                      {row.debit > 0 ? formatCurrency(row.debit) : ''}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-red-600 border border-slate-100">
                      {row.credit > 0 ? formatCurrency(row.credit) : ''}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-right border border-slate-200 uppercase text-xs">Tổng phát sinh</td>
                  <td className="px-4 py-4 text-right border border-slate-200 text-blue-600">
                    {formatCurrency(ledgerData.reduce((sum, r) => sum + r.debit, 0))}
                  </td>
                  <td className="px-4 py-4 text-right border border-slate-200 text-red-600">
                    {formatCurrency(ledgerData.reduce((sum, r) => sum + r.credit, 0))}
                  </td>
                  <td className="px-4 py-4 text-right border border-slate-200">
                    {formatCurrency(ledgerData[ledgerData.length - 1]?.balance || openingBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-bold text-slate-900 uppercase text-xs">Người lập biểu</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-900">............................</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase text-xs">Kế toán trưởng</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-900">............................</p>
            </div>
            <div>
              <p className="italic text-[10px] text-slate-400 mb-1">Ngày .... tháng .... năm ....</p>
              <p className="font-bold text-slate-900 uppercase text-xs">Người đại diện theo pháp luật</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên, đóng dấu)</p>
              <div className="h-20"></div>
              <p className="font-bold text-slate-900">............................</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa chọn tài khoản</h3>
          <p className="text-slate-500">Vui lòng chọn một tài khoản từ danh sách trên để xem sổ chi tiết.</p>
        </div>
      )}
    </div>
  );
};
