import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { safeFormat } from '../../utils/dateUtils';
import { Voucher, Partner, OpeningBalance } from '../../types/accounting';
import { Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgingReportProps {
  vouchers: Voucher[];
  partners: Partner[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: any;
  type: 'receivable' | 'payable';
}

export const AgingReport: React.FC<AgingReportProps> = ({ vouchers, partners, openingBalances, workingYear, filters, type }) => {
  const accountCode = type === 'receivable' ? '131' : '331';
  
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const calculateAging = () => {
    const today = new Date();
    
    // Filter partners based on report type and selected filter
    const filteredPartners = partners.filter(p => {
      const matchesType = type === 'receivable' 
        ? (p.type === 'Customer' || p.type === 'Both')
        : (p.type === 'Supplier' || p.type === 'Both');
      const matchesFilter = !filters.partnerId || p.id === filters.partnerId;
      return matchesType && matchesFilter;
    });

    const agingData = filteredPartners.map(partner => {
      let totalBalance = 0;
      let totalPayments = 0;
      const debts: { amount: number; date: Date; number: string; id: string }[] = [];
      
      // Initial balance - we treat it as the oldest debt if it's positive
      openingBalances.forEach(ob => {
        if (ob.accountCode.startsWith(accountCode)) {
          let amount = 0;
          if (type === 'receivable') {
            amount = (ob.debit || 0) - (ob.credit || 0);
          } else {
            amount = (ob.credit || 0) - (ob.debit || 0);
          }
          
          if (amount > 0) {
            // Treat opening balance as very old debt (start of the year)
            debts.push({ amount, date: new Date(workingYear, 0, 1), number: 'DƯ ĐẦU KỲ', id: 'opening' });
          } else if (amount < 0) {
            totalPayments += Math.abs(amount);
          }
        }
      });

      vouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.partnerCode !== partner.code) return;

          const isDebit = item.debitAccount?.startsWith(accountCode);
          const isCredit = item.creditAccount?.startsWith(accountCode);
          
          if (isDebit || isCredit) {
            const amount = item.amount || 0;
            const voucherDate = new Date(v.date);

            if (type === 'receivable') {
              if (isDebit) debts.push({ amount, date: voucherDate, number: v.number, id: v.id! });
              if (isCredit) totalPayments += amount;
            } else {
              if (isCredit) debts.push({ amount, date: voucherDate, number: v.number, id: v.id! });
              if (isDebit) totalPayments += amount;
            }
          }
        });
      });

      // Sort debts by date (oldest first) for FIFO
      debts.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Apply payments to oldest debts first (FIFO)
      let remainingPayments = totalPayments;
      const outstandingDebts = debts.map(debt => {
        const applied = Math.min(debt.amount, remainingPayments);
        remainingPayments -= applied;
        return { ...debt, remainingAmount: debt.amount - applied };
      }).filter(d => d.remainingAmount > 0);

      const buckets = {
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        'over-90': 0,
      };

      outstandingDebts.forEach(debt => {
        const daysOld = differenceInDays(today, debt.date);
        if (daysOld <= 0) buckets.current += debt.remainingAmount;
        else if (daysOld <= 30) buckets['1-30'] += debt.remainingAmount;
        else if (daysOld <= 60) buckets['31-60'] += debt.remainingAmount;
        else if (daysOld <= 90) buckets['61-90'] += debt.remainingAmount;
        else buckets['over-90'] += debt.remainingAmount;
        totalBalance += debt.remainingAmount;
      });

      // If there are still remaining payments, it means we have a negative balance (overpayment)
      if (remainingPayments > 0) {
        totalBalance -= remainingPayments;
        buckets.current -= remainingPayments; // Show overpayment in current bucket
      }

      return {
        partnerName: partner.name,
        partnerCode: partner.code,
        totalBalance,
        outstandingDebts,
        ...buckets
      };
    }).filter(p => p.totalBalance !== 0);

    return agingData;
  };

  const agingData = calculateAging();
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleShowDetails = (data: any) => {
    setSelectedPartner(data);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">
          BÁO CÁO PHÂN TÍCH TUỔI NỢ {type === 'receivable' ? 'PHẢI THU' : 'PHẢI TRẢ'}
        </h2>
        <p className="text-slate-500 mt-2">Ngày báo cáo: {safeFormat(new Date(), 'dd/MM/yyyy')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <th className="px-6 py-4 border border-slate-200">Đối tác</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Tổng nợ</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Chưa đến hạn</th>
              <th className="px-6 py-4 border border-slate-200 text-right">1 - 30 ngày</th>
              <th className="px-6 py-4 border border-slate-200 text-right">31 - 60 ngày</th>
              <th className="px-6 py-4 border border-slate-200 text-right">61 - 90 ngày</th>
              <th className="px-6 py-4 border border-slate-200 text-right">Trên 90 ngày</th>
              <th className="px-6 py-4 border border-slate-200 text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agingData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400 italic">Không có dữ liệu công nợ.</td>
              </tr>
            ) : (
              <>
                {agingData.map((data, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 border border-slate-100">
                      {data.partnerName}
                      <p className="text-[10px] text-slate-400 font-normal">{data.partnerCode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-blue-600 border border-slate-100">{formatCurrency(data.totalBalance)}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-600 border border-slate-100">{formatCurrency(data.current)}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-600 border border-slate-100">{formatCurrency(data['1-30'])}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-600 border border-slate-100">{formatCurrency(data['31-60'])}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-600 border border-slate-100">{formatCurrency(data['61-90'])}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-500 font-bold border border-slate-100">{formatCurrency(data['over-90'])}</td>
                    <td className="px-6 py-4 text-center border border-slate-100">
                      <button 
                        onClick={() => handleShowDetails(data)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-6 py-4 text-sm text-slate-900 border border-slate-100 uppercase">Tổng cộng</td>
                  <td className="px-6 py-4 text-sm text-right text-blue-700 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d.totalBalance, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d.current, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d['1-30'], 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d['31-60'], 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d['61-90'], 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 border border-slate-100">
                    {formatCurrency(agingData.reduce((sum, d) => sum + d['over-90'], 0))}
                  </td>
                  <td className="border border-slate-100"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Chi tiết nợ quá hạn</h2>
                  <p className="text-slate-500 text-sm">{selectedPartner.partnerName} ({selectedPartner.partnerCode})</p>
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-4 py-3 border-b border-slate-100">Ngày</th>
                      <th className="px-4 py-3 border-b border-slate-100">Số hiệu</th>
                      <th className="px-4 py-3 border-b border-slate-100 text-right">Số tiền gốc</th>
                      <th className="px-4 py-3 border-b border-slate-100 text-right">Còn nợ</th>
                      <th className="px-4 py-3 border-b border-slate-100 text-right">Số ngày quá hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPartner.outstandingDebts.map((debt: any, idx: number) => {
                      const daysOld = differenceInDays(new Date(), debt.date);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-600">{safeFormat(debt.date, 'dd/MM/yyyy')}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900">{debt.number}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(debt.amount)}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">{formatCurrency(debt.remainingAmount)}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                              daysOld > 90 ? 'bg-red-50 text-red-600' :
                              daysOld > 60 ? 'bg-orange-50 text-orange-600' :
                              daysOld > 30 ? 'bg-amber-50 text-amber-600' :
                              daysOld > 0 ? 'bg-blue-50 text-blue-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              {daysOld <= 0 ? 'Chưa đến hạn' : `${daysOld} ngày`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  Tổng cộng: <span className="font-bold text-slate-900">{selectedPartner.outstandingDebts.length} khoản nợ</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(selectedPartner.totalBalance)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
