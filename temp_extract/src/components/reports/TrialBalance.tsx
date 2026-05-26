import React from 'react';
import { Voucher, Account, OpeningBalance } from '../../types/accounting';
import { format } from 'date-fns';

interface TrialBalanceProps {
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

export const TrialBalance: React.FC<TrialBalanceProps> = ({ vouchers, accounts, openingBalances, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateTrialBalance = () => {
    const trialBalance: Record<string, any> = {};

    // Filter accounts if accountCode is provided
    const filteredAccounts = filters.accountCode 
      ? accounts.filter(acc => acc.code.startsWith(filters.accountCode))
      : accounts;

    // Initialize with filtered accounts
    filteredAccounts.forEach(acc => {
      trialBalance[acc.code] = {
        code: acc.code,
        name: acc.name,
        openingDebit: 0,
        openingCredit: 0,
        periodDebit: 0,
        periodCredit: 0,
        closingDebit: 0,
        closingCredit: 0
      };
    });

    // Add opening balances from DB
    openingBalances.forEach(ob => {
      accounts.forEach(acc => {
        if (ob.accountCode.startsWith(acc.code) && trialBalance[acc.code]) {
          trialBalance[acc.code].openingDebit += ob.debit || 0;
          trialBalance[acc.code].openingCredit += ob.credit || 0;
        }
      });
    });

    // Calculate period movements
    vouchers.forEach(v => {
      const isInRange = v.date >= filters.startDate && v.date <= filters.endDate;
      const isBeforeRange = v.date < filters.startDate;

      v.items?.forEach(item => {
        const amount = item.amount || 0;
        
        accounts.forEach(acc => {
          if (trialBalance[acc.code]) {
            if (isBeforeRange) {
              if (item.debitAccount?.startsWith(acc.code)) {
                trialBalance[acc.code].openingDebit += amount;
              }
              if (item.creditAccount?.startsWith(acc.code)) {
                trialBalance[acc.code].openingCredit += amount;
              }
            } else if (isInRange) {
              if (item.debitAccount?.startsWith(acc.code)) {
                trialBalance[acc.code].periodDebit += amount;
              }
              if (item.creditAccount?.startsWith(acc.code)) {
                trialBalance[acc.code].periodCredit += amount;
              }
            }
          }
        });
      });
    });

    // Calculate closing balances
    Object.values(trialBalance).forEach((item: any) => {
      const net = (item.openingDebit - item.openingCredit) + (item.periodDebit - item.periodCredit);
      if (net > 0) {
        item.closingDebit = net;
        item.closingCredit = 0;
      } else if (net < 0) {
        item.closingDebit = 0;
        item.closingCredit = Math.abs(net);
      } else {
        item.closingDebit = 0;
        item.closingCredit = 0;
      }
    });

    return Object.values(trialBalance)
      .filter((item: any) => 
        item.openingDebit !== 0 || 
        item.openingCredit !== 0 || 
        item.periodDebit !== 0 || 
        item.periodCredit !== 0 || 
        item.closingDebit !== 0 || 
        item.closingCredit !== 0
      )
      .sort((a: any, b: any) => a.code.localeCompare(b.code));
  };

  const data = calculateTrialBalance();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Bảng Cân đối Số phát sinh</h2>
        <p className="text-slate-500 mt-2">Năm {workingYear}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#1877F2] text-white text-xs uppercase">
              <th rowSpan={2} className="px-4 py-3 border border-white/20">Mã TK</th>
              <th rowSpan={2} className="px-4 py-3 border border-white/20">Tên tài khoản</th>
              <th colSpan={2} className="px-4 py-2 text-center border border-white/20">Số dư đầu kỳ</th>
              <th colSpan={2} className="px-4 py-2 text-center border border-white/20">Số phát sinh trong kỳ</th>
              <th colSpan={2} className="px-4 py-2 text-center border border-white/20">Số dư cuối kỳ</th>
            </tr>
            <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
              <th className="px-4 py-2 text-right border border-white/20">Nợ</th>
              <th className="px-4 py-2 text-right border border-white/20">Có</th>
              <th className="px-4 py-2 text-right border border-white/20">Nợ</th>
              <th className="px-4 py-2 text-right border border-white/20">Có</th>
              <th className="px-4 py-2 text-right border border-white/20">Nợ</th>
              <th className="px-4 py-2 text-right border border-white/20">Có</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item: any) => (
              <tr key={item.code} className="hover:bg-slate-50/50 transition-colors text-sm">
                <td className="px-4 py-3 font-mono font-bold text-slate-900 border border-slate-100">{item.code}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-100">{item.name}</td>
                <td className="px-4 py-3 text-right text-slate-500 border border-slate-100">{formatCurrency(item.openingDebit)}</td>
                <td className="px-4 py-3 text-right text-slate-500 border border-slate-100">{formatCurrency(item.openingCredit)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(item.periodDebit)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(item.periodCredit)}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600 border border-slate-100">{formatCurrency(item.closingDebit)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600 border border-slate-100">{formatCurrency(item.closingCredit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold">
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center border border-slate-200 uppercase">Tổng cộng</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.openingDebit, 0))}</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.openingCredit, 0))}</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.periodDebit, 0))}</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.periodCredit, 0))}</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.closingDebit, 0))}</td>
              <td className="px-4 py-4 text-right border border-slate-200">{formatCurrency(data.reduce((sum, i) => sum + i.closingCredit, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
