import React from 'react';
import { Voucher, Partner } from '../../types/accounting';
import { safeFormat } from '../../utils/dateUtils';
import { TrendingUp, TrendingDown, Calculator, Receipt } from 'lucide-react';

interface VATReportProps {
  vouchers: Voucher[];
  partners: Partner[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const VATReport: React.FC<VATReportProps> = ({ vouchers, partners, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getPartnerName = (v: Voucher, itemPartnerCode?: string) => {
    // 1. Try to find by partnerCode from item
    if (itemPartnerCode) {
      const partner = partners.find(p => p.code === itemPartnerCode);
      if (partner) return partner.name;
    }

    // 2. Try common metadata fields
    if (v.metadata) {
      const name = v.metadata.payer || v.metadata.receiver || v.metadata.sellerName || v.metadata.customerName;
      if (name) return name;
    }

    return '';
  };

  const getVATData = () => {
    const vatIn: any[] = [];
    const vatOut: any[] = [];

    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          // VAT Input (133)
          if (item.debitAccount?.startsWith('133')) {
            // Find the base amount (usually the other side of the transaction in the same item or voucher)
            // For simplicity, we look for items in the same voucher that are not 133
            const taxableAmount = v.items?.find(i => i.debitAccount?.startsWith('15') || i.debitAccount?.startsWith('6'))?.amount || 0;
            vatIn.push({
              date: v.date,
              number: v.number,
              description: v.description,
              taxableAmount: taxableAmount,
              taxRate: item.vatRate || 10,
              amount: item.amount,
              partner: getPartnerName(v, item.partnerCode)
            });
          }
          // VAT Output (3331)
          if (item.creditAccount?.startsWith('3331')) {
            const taxableAmount = v.items?.find(i => i.creditAccount?.startsWith('511') || i.creditAccount?.startsWith('711'))?.amount || 0;
            vatOut.push({
              date: v.date,
              number: v.number,
              description: v.description,
              taxableAmount: taxableAmount,
              taxRate: item.vatRate || 10,
              amount: item.amount,
              partner: getPartnerName(v, item.partnerCode)
            });
          }
        });
      }
    });

    return { vatIn, vatOut };
  };

  const { vatIn, vatOut } = getVATData();
  const totalVatIn = vatIn.reduce((sum, r) => sum + r.amount, 0);
  const totalVatOut = vatOut.reduce((sum, r) => sum + r.amount, 0);
  const netVat = totalVatOut - totalVatIn;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng VAT Đầu Vào</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalVatIn)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng VAT Đầu Ra</p>
            <p className="text-xl font-bold text-rose-600">{formatCurrency(totalVatOut)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${netVat >= 0 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {netVat >= 0 ? 'Thuế GTGT Phải Nộp' : 'Thuế GTGT Còn Được Khấu Trừ'}
            </p>
            <p className={`text-xl font-bold ${netVat >= 0 ? 'text-amber-600' : 'text-blue-600'}`}>
              {formatCurrency(Math.abs(netVat))}
            </p>
          </div>
        </div>
      </div>

      {/* VAT Input Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase flex items-center gap-2">
              <Receipt className="text-emerald-600" size={24} />
              Bảng kê Thuế GTGT Đầu Vào
            </h2>
            <p className="text-slate-500 mt-1">Từ {safeFormat(filters.startDate, 'dd/MM/yyyy')} đến {safeFormat(filters.endDate, 'dd/MM/yyyy')}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100">Ngày CT</th>
                <th className="px-6 py-4 border-b border-slate-100">Số hiệu</th>
                <th className="px-6 py-4 border-b border-slate-100">Đối tác</th>
                <th className="px-6 py-4 border-b border-slate-100">Diễn giải</th>
                <th className="px-6 py-4 text-right border-b border-slate-100">Doanh số mua</th>
                <th className="px-6 py-4 text-center border-b border-slate-100">Thuế suất</th>
                <th className="px-6 py-4 text-right border-b border-slate-100">Tiền thuế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vatIn.length > 0 ? vatIn.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-6 py-4 text-slate-500">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{row.number}</td>
                  <td className="px-6 py-4 text-slate-600">{row.partner || '-'}</td>
                  <td className="px-6 py-4 text-slate-700">{row.description}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.taxableAmount)}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{row.taxRate}%</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(row.amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">Không có dữ liệu thuế đầu vào trong kỳ</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right border-t border-slate-200 uppercase text-xs">Tổng cộng</td>
                <td className="px-6 py-4 text-right border-t border-slate-200 text-slate-600">
                  {formatCurrency(vatIn.reduce((sum, r) => sum + r.taxableAmount, 0))}
                </td>
                <td className="px-6 py-4 border-t border-slate-200"></td>
                <td className="px-6 py-4 text-right border-t border-slate-200 text-emerald-600">
                  {formatCurrency(totalVatIn)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* VAT Output Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase flex items-center gap-2">
              <Receipt className="text-rose-600" size={24} />
              Bảng kê Thuế GTGT Đầu Ra
            </h2>
            <p className="text-slate-500 mt-1">Từ {safeFormat(filters.startDate, 'dd/MM/yyyy')} đến {safeFormat(filters.endDate, 'dd/MM/yyyy')}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100">Ngày CT</th>
                <th className="px-6 py-4 border-b border-slate-100">Số hiệu</th>
                <th className="px-6 py-4 border-b border-slate-100">Đối tác</th>
                <th className="px-6 py-4 border-b border-slate-100">Diễn giải</th>
                <th className="px-6 py-4 text-right border-b border-slate-100">Doanh số bán</th>
                <th className="px-6 py-4 text-center border-b border-slate-100">Thuế suất</th>
                <th className="px-6 py-4 text-right border-b border-slate-100">Tiền thuế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vatOut.length > 0 ? vatOut.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-6 py-4 text-slate-500">{safeFormat(row.date, 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{row.number}</td>
                  <td className="px-6 py-4 text-slate-600">{row.partner || '-'}</td>
                  <td className="px-6 py-4 text-slate-700">{row.description}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{formatCurrency(row.taxableAmount)}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{row.taxRate}%</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-600">{formatCurrency(row.amount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">Không có dữ liệu thuế đầu ra trong kỳ</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right border-t border-slate-200 uppercase text-xs">Tổng cộng</td>
                <td className="px-6 py-4 text-right border-t border-slate-200 text-slate-600">
                  {formatCurrency(vatOut.reduce((sum, r) => sum + r.taxableAmount, 0))}
                </td>
                <td className="px-6 py-4 border-t border-slate-200"></td>
                <td className="px-6 py-4 text-right border-t border-slate-200 text-rose-600">
                  {formatCurrency(totalVatOut)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
