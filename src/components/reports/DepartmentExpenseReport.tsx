import React from 'react';
import { Voucher, Department } from '../../types/accounting';
import { safeFormat } from '../../utils/dateUtils';
import { BarChart3, TrendingDown, Building2 } from 'lucide-react';

interface DepartmentExpenseReportProps {
  vouchers: Voucher[];
  departments: Department[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const DepartmentExpenseReport: React.FC<DepartmentExpenseReportProps> = ({ 
  vouchers, 
  departments, 
  workingYear, 
  filters 
}) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateDepartmentExpenses = () => {
    return departments.map(dept => {
      let total = 0;
      const deptVouchers = vouchers.filter(v => 
        v.departmentId === dept.id && 
        v.date >= filters.startDate && 
        v.date <= filters.endDate
      );

      deptVouchers.forEach(v => {
        v.items?.forEach(item => {
          // Expense accounts start with 6 or 8
          if (item.debitAccount?.startsWith('6') || item.debitAccount?.startsWith('8')) {
            total += item.amount;
          }
        });
      });

      return {
        ...dept,
        total
      };
    }).sort((a, b) => b.total - a.total);
  };

  const deptData = calculateDepartmentExpenses();
  const grandTotal = deptData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center relative">
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Báo Cáo Chi Phí Theo Bộ Phận</h2>
          <p className="text-slate-500 mt-2">Từ ngày {safeFormat(filters.startDate, 'dd/MM/yyyy')} đến ngày {safeFormat(filters.endDate, 'dd/MM/yyyy')}</p>
          <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center">
                <TrendingDown size={18} />
              </div>
              <span className="text-rose-700 font-bold text-sm">Tổng chi phí</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal)}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <span className="text-blue-700 font-bold text-sm">Số bộ phận phát sinh</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{deptData.filter(d => d.total > 0).length} / {departments.length}</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <span className="text-amber-700 font-bold text-sm">Chi phí bình quân</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(departments.length > 0 ? grandTotal / departments.length : 0)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-8 py-4">Mã bộ phận</th>
                <th className="px-8 py-4">Tên bộ phận</th>
                <th className="px-8 py-4 text-right">Tổng chi phí</th>
                <th className="px-8 py-4 text-right">Tỷ trọng (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {deptData.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                      {dept.code}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-900">{dept.name}</td>
                  <td className="px-8 py-4 text-right font-mono font-bold text-rose-600">
                    {formatCurrency(dept.total)}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500" 
                          style={{ width: `${grandTotal > 0 ? (dept.total / grandTotal) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {grandTotal > 0 ? ((dept.total / grandTotal) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={2} className="px-8 py-4 text-right uppercase text-xs text-slate-500">Tổng cộng</td>
                <td className="px-8 py-4 text-right text-rose-600">
                  {formatCurrency(grandTotal)}
                </td>
                <td className="px-8 py-4 text-right text-slate-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
