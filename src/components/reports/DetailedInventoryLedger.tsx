import React, { useState } from 'react';
import { Voucher, Product } from '../../types/accounting';
import { format } from 'date-fns';
import { safeFormat } from '../../utils/dateUtils';

interface DetailedInventoryLedgerProps {
  vouchers: Voucher[];
  products: Product[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    productId: string;
  };
}

export const DetailedInventoryLedger: React.FC<DetailedInventoryLedgerProps> = ({ vouchers, products, workingYear, filters }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    filters.productId ? products.find(p => p.id === filters.productId) || products[0] || null : products[0] || null
  );

  // Update selected product if filter changes
  React.useEffect(() => {
    if (filters.productId) {
      const p = products.find(prod => prod.id === filters.productId);
      if (p) setSelectedProduct(p);
    }
  }, [filters.productId, products]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getLedgerData = () => {
    if (!selectedProduct) return [];
    const data: any[] = [];
    let runningQty = 0;
    let runningValue = 0;

    const sortedVouchers = [...vouchers].sort((a, b) => a.date.localeCompare(b.date));

    sortedVouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.itemCode === selectedProduct.code) {
          const isInventoryAccount = (acc?: string) => 
            acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

          const isImport = isInventoryAccount(item.debitAccount);
          const isExport = isInventoryAccount(item.creditAccount);

          if (isImport) {
            runningQty += item.quantityActual || 0;
            runningValue += item.amount || 0;
            data.push({
              date: v.date,
              number: v.number,
              description: v.description,
              importQty: item.quantityActual || 0,
              importValue: item.amount || 0,
              exportQty: 0,
              exportValue: 0,
              closingQty: runningQty,
              closingValue: runningValue,
              reciprocalAccount: item.creditAccount
            });
          } else if (isExport) {
            runningQty -= item.quantityActual || 0;
            runningValue -= item.amount || 0;
            data.push({
              date: v.date,
              number: v.number,
              description: v.description,
              importQty: 0,
              importValue: 0,
              exportQty: item.quantityActual || 0,
              exportValue: item.amount || 0,
              closingQty: runningQty,
              closingValue: runningValue,
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
        <label className="text-sm font-medium text-slate-700">Chọn vật tư, hàng hóa:</label>
        <select 
          className="flex-1 max-w-md px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedProduct?.code || ''}
          onChange={(e) => setSelectedProduct(products.find(p => p.code === e.target.value) || null)}
        >
          {products.map(p => (
            <option key={p.code} value={p.code}>{p.code} - {p.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center">
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Sổ Chi Tiết Vật Tư, Hàng Hóa</h2>
          <p className="text-slate-500 mt-2">Vật tư: {selectedProduct?.name} ({selectedProduct?.code})</p>
          <p className="text-slate-500">Năm {workingYear}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
                <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Ngày CT</th>
                <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Số hiệu</th>
                <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">Diễn giải</th>
                <th rowSpan={2} className="px-2 py-3 border border-white/20 text-center">TK đối ứng</th>
                <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Nhập</th>
                <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Xuất</th>
                <th colSpan={2} className="px-2 py-2 border border-white/20 text-center">Tồn</th>
              </tr>
              <tr className="bg-[#1877F2] text-white text-[10px] uppercase">
                <th className="px-2 py-2 border border-white/20 text-right">SL</th>
                <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
                <th className="px-2 py-2 border border-white/20 text-right">SL</th>
                <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
                <th className="px-2 py-2 border border-white/20 text-right">SL</th>
                <th className="px-2 py-2 border border-white/20 text-right">Giá trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="bg-slate-50 font-bold text-xs">
                <td colSpan={8} className="px-2 py-3 text-right border border-slate-100 uppercase">Số dư đầu kỳ</td>
                <td className="px-2 py-3 text-right border border-slate-100">0</td>
                <td className="px-2 py-3 text-right border border-slate-100">{formatCurrency(0)}</td>
              </tr>
              {ledgerData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-xs">
                  <td className="px-2 py-3 text-slate-500 border border-slate-100">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                  <td className="px-2 py-3 font-bold text-slate-900 border border-slate-100">{row.number}</td>
                  <td className="px-2 py-3 text-slate-700 border border-slate-100">{row.description}</td>
                  <td className="px-2 py-3 font-mono text-slate-500 border border-slate-100 text-center">{row.reciprocalAccount}</td>
                  <td className="px-2 py-3 text-right font-bold text-blue-600 border border-slate-100">{row.importQty}</td>
                  <td className="px-2 py-3 text-right font-bold text-blue-600 border border-slate-100">{formatCurrency(row.importValue)}</td>
                  <td className="px-2 py-3 text-right font-bold text-red-600 border border-slate-100">{row.exportQty}</td>
                  <td className="px-2 py-3 text-right font-bold text-red-600 border border-slate-100">{formatCurrency(row.exportValue)}</td>
                  <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{row.closingQty}</td>
                  <td className="px-2 py-3 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(row.closingValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
