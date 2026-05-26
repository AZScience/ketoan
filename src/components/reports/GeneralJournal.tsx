import React from 'react';
import { Voucher } from '../../types/accounting';
import { format } from 'date-fns';

interface GeneralJournalProps {
  vouchers: Voucher[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const GeneralJournal: React.FC<GeneralJournalProps> = ({ vouchers, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Sort vouchers by date and number
  const sortedVouchers = [...vouchers].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.number.localeCompare(b.number);
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Nhật ký chung</h2>
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
              <th className="px-4 py-3 border border-white/20">TK Nợ</th>
              <th className="px-4 py-3 border border-white/20">TK Có</th>
              <th className="px-4 py-3 text-right border border-white/20">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedVouchers.map((v) => (
              <React.Fragment key={v.id}>
                {v.items?.map((item, idx) => (
                  <tr key={`${v.id}-${idx}`} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 py-3 text-slate-500 border border-slate-100">
                      {idx === 0 ? format(new Date(v.date), 'dd/MM/yyyy') : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-500 border border-slate-100">
                      {idx === 0 ? format(new Date(v.date), 'dd/MM/yyyy') : ''}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 border border-slate-100">
                      {idx === 0 ? v.number : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-100">
                      {idx === 0 ? v.description : item.note || ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-600 border border-slate-100">{item.debitAccount}</td>
                    <td className="px-4 py-3 font-mono text-red-600 border border-slate-100">{item.creditAccount}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 border border-slate-100">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold">
            <tr>
              <td colSpan={6} className="px-4 py-4 text-right border border-slate-200 uppercase">Tổng cộng</td>
              <td className="px-4 py-4 text-right border border-slate-200">
                {formatCurrency(vouchers.reduce((sum, v) => sum + (v.totalAmount || 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
