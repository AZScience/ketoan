import React from 'react';
import { Voucher, Project } from '../../types/accounting';
import { safeFormat } from '../../utils/dateUtils';
import { BarChart3, TrendingUp, Briefcase } from 'lucide-react';

interface ProjectRevenueReportProps {
  vouchers: Voucher[];
  projects: Project[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const ProjectRevenueReport: React.FC<ProjectRevenueReportProps> = ({ 
  vouchers, 
  projects, 
  workingYear, 
  filters 
}) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateProjectRevenue = () => {
    return projects.map(proj => {
      let revenue = 0;
      let expense = 0;
      const projVouchers = vouchers.filter(v => 
        v.projectId === proj.id && 
        v.date >= filters.startDate && 
        v.date <= filters.endDate
      );

      projVouchers.forEach(v => {
        v.items?.forEach(item => {
          // Revenue accounts start with 5 or 7
          if (item.creditAccount?.startsWith('5') || item.creditAccount?.startsWith('7')) {
            revenue += item.amount;
          }
          // Expense accounts start with 6 or 8
          if (item.debitAccount?.startsWith('6') || item.debitAccount?.startsWith('8')) {
            expense += item.amount;
          }
        });
      });

      return {
        ...proj,
        revenue,
        expense,
        profit: revenue - expense
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  const projectData = calculateProjectRevenue();
  const totalRevenue = projectData.reduce((sum, p) => sum + p.revenue, 0);
  const totalExpense = projectData.reduce((sum, p) => sum + p.expense, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center relative">
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Báo Cáo Hiệu Quả Theo Dự Án</h2>
          <p className="text-slate-500 mt-2">Từ ngày {safeFormat(filters.startDate, 'dd/MM/yyyy')} đến ngày {safeFormat(filters.endDate, 'dd/MM/yyyy')}</p>
          <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-emerald-700 font-bold text-sm">Tổng doanh thu</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <span className="text-blue-700 font-bold text-sm">Số dự án phát sinh</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{projectData.filter(p => p.revenue > 0 || p.expense > 0).length} / {projects.length}</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <span className="text-amber-700 font-bold text-sm">Lợi nhuận gộp</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue - totalExpense)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-8 py-4">Mã dự án</th>
                <th className="px-8 py-4">Tên dự án</th>
                <th className="px-8 py-4 text-right">Doanh thu</th>
                <th className="px-8 py-4 text-right">Chi phí</th>
                <th className="px-8 py-4 text-right">Lợi nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projectData.map((proj, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                      {proj.code}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-900">{proj.name}</td>
                  <td className="px-8 py-4 text-right font-mono font-bold text-emerald-600">
                    {formatCurrency(proj.revenue)}
                  </td>
                  <td className="px-8 py-4 text-right font-mono font-bold text-rose-600">
                    {formatCurrency(proj.expense)}
                  </td>
                  <td className={`px-8 py-4 text-right font-mono font-bold ${proj.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(proj.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold">
              <tr>
                <td colSpan={2} className="px-8 py-4 text-right uppercase text-xs text-slate-500">Tổng cộng</td>
                <td className="px-8 py-4 text-right text-emerald-600">{formatCurrency(totalRevenue)}</td>
                <td className="px-8 py-4 text-right text-rose-600">{formatCurrency(totalExpense)}</td>
                <td className="px-8 py-4 text-right text-blue-600">{formatCurrency(totalRevenue - totalExpense)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
