import React, { useState } from 'react';
import { Voucher, Partner } from '../../types/accounting';
import { format } from 'date-fns';
import { safeFormat } from '../../utils/dateUtils';

interface DetailedPartnerLedgerProps {
  vouchers: Voucher[];
  partners: Partner[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    partnerId: string;
  };
}

export const DetailedPartnerLedger: React.FC<DetailedPartnerLedgerProps> = ({ vouchers, partners, workingYear, filters }) => {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(
    filters.partnerId ? partners.find(p => p.id === filters.partnerId) || partners[0] || null : partners[0] || null
  );

  // Update selected partner if filter changes
  React.useEffect(() => {
    if (filters.partnerId) {
      const p = partners.find(part => part.id === filters.partnerId);
      if (p) setSelectedPartner(p);
    }
  }, [filters.partnerId, partners]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getLedgerData = () => {
    if (!selectedPartner) return [];
    const data: any[] = [];
    let runningBalance = 0;

    const sortedVouchers = [...vouchers].sort((a, b) => a.date.localeCompare(b.date));

    sortedVouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.partnerCode === selectedPartner.code) {
          const isDebit = item.debitAccount?.startsWith('131') || item.debitAccount?.startsWith('331');
          const isCredit = item.creditAccount?.startsWith('131') || item.creditAccount?.startsWith('331');

          if (isDebit) {
            runningBalance += item.amount || 0;
            data.push({
              date: v.date,
              number: v.number,
              description: v.description,
              debit: item.amount || 0,
              credit: 0,
              balance: runningBalance,
              reciprocalAccount: item.creditAccount
            });
          } else if (isCredit) {
            runningBalance -= item.amount || 0;
            data.push({
              date: v.date,
              number: v.number,
              description: v.description,
              debit: 0,
              credit: item.amount || 0,
              balance: runningBalance,
              reciprocalAccount: item.debitAccount
            });
          }
        }
      });
    });

    return data;
  };

  const ledgerData = getLedgerData();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Chọn đối tác:</label>
        <select 
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedPartner?.code || ''}
          onChange={(e) => setSelectedPartner(partners.find(p => p.code === e.target.value) || null)}
        >
          {partners.map(p => (
            <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center">
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Chi Tiết Công Nợ</h2>
          <p className="text-slate-500 mt-2">Đối tác: {selectedPartner?.name} ({selectedPartner?.code})</p>
          <p className="text-slate-500">Năm {workingYear}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#1877F2] text-white text-xs uppercase">
                <th className="px-4 py-3 border border-white/20">Ngày CT</th>
                <th className="px-4 py-3 border border-white/20">Số hiệu</th>
                <th className="px-4 py-3 border border-white/20">Diễn giải</th>
                <th className="px-4 py-3 border border-white/20">TK đối ứng</th>
                <th className="px-4 py-3 text-right border border-white/20">Nợ</th>
                <th className="px-4 py-3 text-right border border-white/20">Có</th>
                <th className="px-4 py-3 text-right border border-white/20">Dư</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="bg-slate-50 font-bold text-sm">
                <td colSpan={6} className="px-4 py-3 text-right border border-slate-100 uppercase">Số dư đầu kỳ</td>
                <td className="px-4 py-3 text-right border border-slate-100">{formatCurrency(0)}</td>
              </tr>
              {ledgerData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-4 py-3 text-slate-500 border border-slate-100">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
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
          </table>
        </div>
      </div>
    </div>
  );
};
