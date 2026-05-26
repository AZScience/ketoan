import React from 'react';
import { Voucher } from '../../types/accounting';
import { format } from 'date-fns';

interface PayrollReportProps {
  vouchers: Voucher[];
  workingYear: number;
  filters: any;
}

export const PayrollReport: React.FC<PayrollReportProps> = ({ vouchers, workingYear, filters }) => {
  const payrollVouchers = vouchers.filter(v => 
    v.type === 'Payroll' || v.type === 'Bonus' || v.type === 'Overtime'
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const totalPayroll = payrollVouchers.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 text-center relative">
        <div className="absolute top-8 right-8 text-right text-xs text-slate-400">
          <p className="font-bold">Mẫu số S02a-DN</p>
          <p>(Ban hành theo Thông tư số 200/2014/TT-BTC)</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 uppercase">
          BÁO CÁO TỔNG HỢP TIỀN LƯƠNG VÀ CÁC KHOẢN TRÍCH THEO LƯƠNG
        </h2>
        <p className="text-slate-500 mt-2">Kỳ báo cáo: {filters.startDate} - {filters.endDate}</p>
        <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-[#1877F2] text-white text-xs uppercase font-bold">
              <th className="px-6 py-4 border border-white/20">Ngày CT</th>
              <th className="px-6 py-4 border border-white/20">Số hiệu</th>
              <th className="px-6 py-4 border border-white/20">Diễn giải</th>
              <th className="px-6 py-4 border border-white/20">Loại</th>
              <th className="px-6 py-4 text-right border border-white/20">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrollVouchers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">Không có dữ liệu tiền lương trong kỳ.</td>
              </tr>
            ) : (
              <>
                {payrollVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500 border border-slate-100">{format(new Date(v.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 border border-slate-100">{v.number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 border border-slate-100">{v.description}</td>
                    <td className="px-6 py-4 text-sm border border-slate-100">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        v.type === 'Payroll' ? 'bg-blue-100 text-blue-700' :
                        v.type === 'Bonus' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {v.type === 'Payroll' ? 'Lương' : v.type === 'Bonus' ? 'Thưởng' : 'Làm thêm'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(v.totalAmount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-6 py-4 text-right text-slate-900 border border-slate-200 uppercase">Tổng cộng</td>
                  <td className="px-6 py-4 text-right text-blue-600 border border-slate-200">{formatCurrency(totalPayroll)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
