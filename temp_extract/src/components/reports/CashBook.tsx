import React from 'react';
import { Voucher, OpeningBalance } from '../../types/accounting';
import { format } from 'date-fns';

interface CashBookProps {
  vouchers: Voucher[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const CashBook: React.FC<CashBookProps> = ({ vouchers, openingBalances, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getCashData = () => {
    const data: any[] = [];
    
    // Calculate initial balance from opening balances
    let initialBalance = 0;
    openingBalances.forEach(ob => {
      if (ob.accountCode.startsWith('111')) {
        initialBalance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

    let runningBalance = initialBalance;

    // Sort vouchers by date
    const sortedVouchers = [...vouchers]
      .filter(v => v.date >= filters.startDate && v.date <= filters.endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    sortedVouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.debitAccount?.startsWith('111')) {
          runningBalance += item.amount;
          data.push({
            date: v.date,
            number: v.number,
            description: v.description,
            receipt: item.amount,
            payment: 0,
            balance: runningBalance,
            reciprocalAccount: item.creditAccount
          });
        } else if (item.creditAccount?.startsWith('111')) {
          runningBalance -= item.amount;
          data.push({
            date: v.date,
            number: v.number,
            description: v.description,
            receipt: 0,
            payment: item.amount,
            balance: runningBalance,
            reciprocalAccount: item.debitAccount
          });
        }
      });
    });

    return { data, initialBalance };
  };

  const { data: cashData, initialBalance } = getCashData();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Quỹ Tiền Mặt</h2>
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
              <th className="px-4 py-3 border border-white/20">TK đối ứng</th>
              <th className="px-4 py-3 text-right border border-white/20">Thu</th>
              <th className="px-4 py-3 text-right border border-white/20">Chi</th>
              <th className="px-4 py-3 text-right border border-white/20">Tồn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="bg-slate-50 font-bold text-sm">
              <td colSpan={7} className="px-4 py-3 text-right border border-slate-100 uppercase">Số dư đầu kỳ</td>
              <td className="px-4 py-3 text-right border border-slate-100">{formatCurrency(initialBalance)}</td>
            </tr>
            {cashData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                <td className="px-4 py-3 text-slate-500 border border-slate-100">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3 text-slate-500 border border-slate-100">{format(new Date(row.date), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3 font-bold text-slate-900 border border-slate-100">{row.number}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-100">{row.description}</td>
                <td className="px-4 py-3 font-mono text-slate-500 border border-slate-100">{row.reciprocalAccount}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600 border border-slate-100">
                  {row.receipt > 0 ? formatCurrency(row.receipt) : ''}
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600 border border-slate-100">
                  {row.payment > 0 ? formatCurrency(row.payment) : ''}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold">
            <tr>
              <td colSpan={5} className="px-4 py-4 text-right border border-slate-200 uppercase">Tổng phát sinh</td>
              <td className="px-4 py-4 text-right border border-slate-200">
                {formatCurrency(cashData.reduce((sum, r) => sum + r.receipt, 0))}
              </td>
              <td className="px-4 py-4 text-right border border-slate-200">
                {formatCurrency(cashData.reduce((sum, r) => sum + r.payment, 0))}
              </td>
              <td className="px-4 py-4 text-right border border-slate-200">
                {formatCurrency(cashData[cashData.length - 1]?.balance || 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
