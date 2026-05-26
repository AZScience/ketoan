import React from 'react';
import { Voucher, Product } from '../../types/accounting';

interface InventorySummaryProps {
  vouchers: Voucher[];
  products: Product[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    productId: string;
  };
}

export const InventorySummary: React.FC<InventorySummaryProps> = ({ vouchers, products, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateSummary = () => {
    const filteredProducts = filters.productId 
      ? products.filter(p => p.id === filters.productId)
      : products;

    return filteredProducts.map(product => {
      let openingQty = product.openingQty || 0;
      let openingValue = product.openingValue || 0;
      let importQty = 0;
      let importValue = 0;
      let exportQty = 0;
      let exportValue = 0;

      vouchers.forEach(v => {
        const isBeforeRange = v.date < filters.startDate;
        const isInRange = v.date >= filters.startDate && v.date <= filters.endDate;

        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            const isInventoryAccount = (acc?: string) => 
              acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

            if (isBeforeRange) {
              if (isInventoryAccount(item.debitAccount)) {
                openingQty += item.quantityActual || 0;
                openingValue += item.amount || 0;
              } else if (isInventoryAccount(item.creditAccount)) {
                openingQty -= item.quantityActual || 0;
                openingValue -= item.amount || 0;
              }
            } else if (isInRange) {
              if (isInventoryAccount(item.debitAccount)) {
                importQty += item.quantityActual || 0;
                importValue += item.amount || 0;
              } else if (isInventoryAccount(item.creditAccount)) {
                exportQty += item.quantityActual || 0;
                exportValue += item.amount || 0;
              }
            }
          }
        });
      });

      return {
        ...product,
        openingQty,
        openingValue,
        importQty,
        importValue,
        exportQty,
        exportValue,
        closingQty: openingQty + importQty - exportQty,
        closingValue: openingValue + importValue - exportValue
      };
    });
  };

  const summaryData = calculateSummary();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center relative">
        <div className="absolute top-8 right-8 text-right text-xs text-slate-400 no-print">
          <p className="font-bold">Mẫu số S10-DN</p>
          <p>(Ban hành theo Thông tư số 200/2014/TT-BTC)</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Báo cáo Tổng hợp Nhập - Xuất - Tồn</h2>
        <p className="text-slate-500 mt-2">Từ ngày {filters.startDate} đến ngày {filters.endDate}</p>
        <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
              <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Mã hàng</th>
              <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Tên hàng</th>
              <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">ĐVT</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Tồn đầu kỳ</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Nhập trong kỳ</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Xuất trong kỳ</th>
              <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Tồn cuối kỳ</th>
            </tr>
            <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
              <th className="px-2 py-2 border border-white/20 text-right">SL</th>
              <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
              <th className="px-2 py-2 border border-white/20 text-right">SL</th>
              <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
              <th className="px-2 py-2 border border-white/20 text-right">SL</th>
              <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
              <th className="px-2 py-2 border border-white/20 text-right">SL</th>
              <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {summaryData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs">
                <td className="px-2 py-3 font-bold text-slate-900 border border-slate-100">{row.code}</td>
                <td className="px-2 py-3 text-slate-700 border border-slate-100">{row.name}</td>
                <td className="px-2 py-3 text-slate-500 border border-slate-100 text-center">{row.unit}</td>
                <td className="px-2 py-3 text-right text-slate-500 border border-slate-100">{row.openingQty}</td>
                <td className="px-2 py-3 text-right text-slate-500 border border-slate-100">{formatCurrency(row.openingValue)}</td>
                <td className="px-2 py-3 text-right font-bold text-blue-600 border border-slate-100">{row.importQty}</td>
                <td className="px-2 py-3 text-right font-bold text-blue-600 border border-slate-100">{formatCurrency(row.importValue)}</td>
                <td className="px-2 py-3 text-right font-bold text-red-600 border border-slate-100">{row.exportQty}</td>
                <td className="px-2 py-3 text-right font-bold text-red-600 border border-slate-100">{formatCurrency(row.exportValue)}</td>
                <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{row.closingQty}</td>
                <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.closingValue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold text-xs">
            <tr>
              <td colSpan={3} className="px-2 py-4 text-right border border-slate-200 uppercase">Tổng cộng</td>
              <td className="px-2 py-4 text-right border border-slate-200">{summaryData.reduce((sum, r) => sum + r.openingQty, 0)}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.openingValue, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{summaryData.reduce((sum, r) => sum + r.importQty, 0)}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.importValue, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{summaryData.reduce((sum, r) => sum + r.exportQty, 0)}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.exportValue, 0))}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{summaryData.reduce((sum, r) => sum + r.closingQty, 0)}</td>
              <td className="px-2 py-4 text-right border border-slate-200">{formatCurrency(summaryData.reduce((sum, r) => sum + r.closingValue, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
