import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface OvertimePreviewProps {
  voucher: any;
  companySettings?: any;
}

export const OvertimePreview: React.FC<OvertimePreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totals = rows.reduce((acc: any, row: any) => ({
    totalAmount: acc.totalAmount + (Number(row.totalAmount) || 0),
    actualPayment: acc.actualPayment + (Number(row.actualPayment) || 0),
  }), { totalAmount: 0, actualPayment: 0 });

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-tight border border-slate-200 shadow-inner overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:overflow-visible">
      <div className="min-w-[1200px] print:min-w-0 print:w-full">
        <VoucherHeader 
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 06 - LĐTL"
          templateSource="Thông tư số 200/2014/TT-BTC"
          templateDate="Ngày 22/12/2014 của Bộ Tài chính"
        />

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">BẢNG THANH TOÁN TIỀN LÀM THÊM GIỜ</h2>
          <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="mt-1 font-bold">Số: {number || '............'}</p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[9px]">
          <thead>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th rowSpan={2} className="border border-black p-1 w-8">STT</th>
              <th rowSpan={2} className="border border-black p-1 w-48">Họ và tên</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Ngạch bậc</th>
              <th colSpan={3} className="border border-black p-1">Hệ số</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Lương tháng</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Mức lương</th>
              <th colSpan={2} className="border border-black p-1">Làm thêm ngày thường</th>
              <th colSpan={2} className="border border-black p-1">Làm thêm T7, CN</th>
              <th colSpan={2} className="border border-black p-1">Làm thêm Lễ, Tết</th>
              <th colSpan={2} className="border border-black p-1">Làm thêm đêm</th>
              <th rowSpan={2} className="border border-black p-1 w-28">Tổng cộng tiền</th>
              <th rowSpan={2} className="border border-black p-1 w-20">Số ngày nghỉ bù</th>
              <th rowSpan={2} className="border border-black p-1 w-28">Thực thanh toán</th>
            </tr>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th className="border border-black p-1 w-16">Lương</th>
              <th className="border border-black p-1 w-16">Phụ cấp</th>
              <th className="border border-black p-1 w-16">Cộng</th>
              <th className="border border-black p-1 w-12">Giờ</th>
              <th className="border border-black p-1 w-20">Tiền</th>
              <th className="border border-black p-1 w-12">Giờ</th>
              <th className="border border-black p-1 w-20">Tiền</th>
              <th className="border border-black p-1 w-12">Giờ</th>
              <th className="border border-black p-1 w-20">Tiền</th>
              <th className="border border-black p-1 w-12">Giờ</th>
              <th className="border border-black p-1 w-20">Tiền</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{row.stt || i + 1}</td>
                <td className="border border-black p-1 font-bold">{row.fullName}</td>
                <td className="border border-black p-1">{row.rank}</td>
                <td className="border border-black p-1 text-center">{row.salaryCoefficient}</td>
                <td className="border border-black p-1 text-center">{row.allowanceCoefficient}</td>
                <td className="border border-black p-1 text-center font-bold">{row.totalCoefficient}</td>
                <td className="border border-black p-1 text-right">{Number(row.monthlySalary || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.salaryRate || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.overtimeWorkday?.hours}</td>
                <td className="border border-black p-1 text-right">{Number(row.overtimeWorkday?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.overtimeWeekend?.hours}</td>
                <td className="border border-black p-1 text-right">{Number(row.overtimeWeekend?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.overtimeHoliday?.hours}</td>
                <td className="border border-black p-1 text-right">{Number(row.overtimeHoliday?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.overtimeNight?.hours}</td>
                <td className="border border-black p-1 text-right">{Number(row.overtimeNight?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.totalAmount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.compulsoryLeaveDays}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.actualPayment || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 print:bg-transparent h-10">
              <td className="border border-black p-1 text-center" colSpan={16}>Tổng cộng</td>
              <td className="border border-black p-1 text-right">{totals.totalAmount.toLocaleString()}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 text-right">{totals.actualPayment.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <VoucherSignatures 
          roles={[
            { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
            { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
            { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)' },
            { title: 'Người duyệt', subtitle: '(Ký, họ tên)', isDate: true },
          ]}
          date={date}
        />
      </div>
    </div>
  );
};
