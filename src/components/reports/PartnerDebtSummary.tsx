import React from 'react';
import { Voucher, Partner } from '../../types/accounting';

interface PartnerDebtSummaryProps {
  vouchers: Voucher[];
  partners: Partner[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    partnerId: string;
  };
}

export const PartnerDebtSummary: React.FC<PartnerDebtSummaryProps> = ({ vouchers, partners, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateSummary = () => {
    const filteredPartners = filters.partnerId 
      ? partners.filter(p => p.id === filters.partnerId)
      : partners;

    return filteredPartners.map(partner => {
      let openingDebit = 0;
      let openingCredit = 0;
      let debitMovement = 0;
      let creditMovement = 0;

      vouchers.forEach(v => {
        const isBeforeRange = v.date < filters.startDate;
        const isInRange = v.date >= filters.startDate && v.date <= filters.endDate;

        v.items?.forEach(item => {
          if (item.partnerCode === partner.code) {
            const isDebtAccount = (acc?: string) => 
              acc?.startsWith('131') || acc?.startsWith('331');

            if (isBeforeRange) {
              if (isDebtAccount(item.debitAccount)) {
                openingDebit += item.amount || 0;
              } else if (isDebtAccount(item.creditAccount)) {
                openingDebit -= item.amount || 0;
              }
            } else if (isInRange) {
              if (isDebtAccount(item.debitAccount)) {
                debitMovement += item.amount || 0;
              } else if (isDebtAccount(item.creditAccount)) {
                creditMovement += item.amount || 0;
              }
            }
          }
        });
      });

      // Adjust opening balances to be positive on one side
      if (openingDebit < 0) {
        openingCredit = Math.abs(openingDebit);
        openingDebit = 0;
      }

      const totalDebit = openingDebit + debitMovement;
      const totalCredit = openingCredit + creditMovement;

      return {
        ...partner,
        openingDebit,
        openingCredit,
        debitMovement,
        creditMovement,
        closingDebit: Math.max(0, totalDebit - totalCredit),
        closingCredit: Math.max(0, totalCredit - totalDebit)
      };
    });
  };

  const summaryData = calculateSummary();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Bảng Tổng Hợp Chi Tiết Công Nợ</h2>
        <p className="text-slate-500 mt-2">Năm {workingYear}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
              <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Mã đối tác</th>
              <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Tên đối tác</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Dư đầu kỳ</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Phát sinh trong kỳ</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Dư cuối kỳ</th>
            </tr>
            <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
              <th className="px-2 py-2 border border-white/20 text-right">Nợ</th>
              <th className="px-2 py-2 border border-white/20 text-right">Có</th>
              <th className="px-2 py-2 border border-white/20 text-right">Nợ</th>
              <th className="px-2 py-2 border border-white/20 text-right">Có</th>
              <th className="px-2 py-2 border border-white/20 text-right">Nợ</th>
              <th className="px-2 py-2 border border-white/20 text-right">Có</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {summaryData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs">
                <td className="px-2 py-3 font-bold text-slate-900 border border-slate-100">{row.code}</td>
                <td className="px-2 py-3 text-slate-700 border border-slate-100">{row.name}</td>
                <td className="px-2 py-3 text-right text-slate-500 border border-slate-100">{formatCurrency(row.openingDebit)}</td>
                <td className="px-2 py-3 text-right text-slate-500 border border-slate-100">{formatCurrency(row.openingCredit)}</td>
                <td className="px-2 py-3 text-right font-bold text-blue-600 border border-slate-100">{formatCurrency(row.debitMovement)}</td>
                <td className="px-2 py-3 text-right font-bold text-red-600 border border-slate-100">{formatCurrency(row.creditMovement)}</td>
                <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.closingDebit)}</td>
                <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.closingCredit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-xs">
            <tr>
              <td colSpan={2} className="px-2 py-4 text-right border border-slate-200 uppercase">Tổng cộng</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.openingDebit, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.openingCredit, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.debitMovement, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.creditMovement, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.closingDebit, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.closingCredit, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
