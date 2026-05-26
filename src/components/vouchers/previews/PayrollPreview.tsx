import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PayrollPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const PayrollPreview: React.FC<PayrollPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  
  const totals = (rows || []).reduce((acc: any, row: any) => ({
    productSalaryAmount: acc.productSalaryAmount + (Number(row.productSalary?.amount) || 0),
    timeSalaryAmount: acc.timeSalaryAmount + (Number(row.timeSalary?.amount) || 0),
    leaveSalaryAmount: acc.leaveSalaryAmount + (Number(row.leaveSalary?.amount) || 0),
    salaryFundAllowances: acc.salaryFundAllowances + (Number(row.salaryFundAllowances) || 0),
    otherAllowances: acc.otherAllowances + (Number(row.otherAllowances) || 0),
    total: acc.total + (Number(row.total) || 0),
    advancePeriod1: acc.advancePeriod1 + (Number(row.advancePeriod1) || 0),
    deductionsTotal: acc.deductionsTotal + (Number(row.deductions?.total) || 0),
    period2Amount: acc.period2Amount + (Number(row.period2Amount) || 0),
  }), {
    productSalaryAmount: 0,
    timeSalaryAmount: 0,
    leaveSalaryAmount: 0,
    salaryFundAllowances: 0,
    otherAllowances: 0,
    total: 0,
    advancePeriod1: 0,
    deductionsTotal: 0,
    period2Amount: 0,
  });

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-tight border border-slate-200 shadow-inner overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:overflow-visible">
      <div className="min-w-[1200px] print:min-w-0 print:w-full">
        <VoucherHeader 
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 01 - LĐTL"
          templateSource="Thông tư số 99/2018/TT-BTC"
          templateDate="Ngày 01/11/2018 của Bộ Tài chính"
        />

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">BẢNG THANH TOÁN TIỀN LƯƠNG</h2>
          <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="mt-1 font-bold">Số: {number || '............'}</p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[9px]">
          <thead>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th rowSpan={2} className="border border-black p-1 w-8">STT</th>
              <th rowSpan={2} className="border border-black p-1 w-48">Họ và tên</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Ngạch bậc lương</th>
              <th rowSpan={2} className="border border-black p-1 w-12">Hệ số</th>
              <th colSpan={2} className="border border-black p-1">Lương sản phẩm</th>
              <th colSpan={2} className="border border-black p-1">Lương thời gian</th>
              <th colSpan={2} className="border border-black p-1">Nghỉ việc...</th>
              <th rowSpan={2} className="border border-black p-1 w-20">Phụ cấp quỹ lương</th>
              <th rowSpan={2} className="border border-black p-1 w-20">Phụ cấp khác</th>
              <th rowSpan={2} className="border border-black p-1 w-28">Tổng số</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Tạm ứng kỳ I</th>
              <th colSpan={4} className="border border-black p-1">Các khoản khấu trừ</th>
              <th rowSpan={2} className="border border-black p-1 w-28">Kỳ II được lĩnh</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Ký nhận</th>
            </tr>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th className="border border-black p-1 w-12">Số SP</th>
              <th className="border border-black p-1 w-24">Số tiền</th>
              <th className="border border-black p-1 w-12">Số công</th>
              <th className="border border-black p-1 w-24">Số tiền</th>
              <th className="border border-black p-1 w-12">Số công</th>
              <th className="border border-black p-1 w-24">Số tiền</th>
              <th className="border border-black p-1 w-24">BHXH</th>
              <th className="border border-black p-1 w-24">BHYT/BHTN</th>
              <th className="border border-black p-1 w-24">Thuế TNCN</th>
              <th className="border border-black p-1 w-24">Cộng</th>
            </tr>
            <tr className="text-[8px] text-center italic">
              <td className="border border-black">A</td>
              <td className="border border-black">B</td>
              <td className="border border-black">1</td>
              <td className="border border-black">2</td>
              <td className="border border-black">3</td>
              <td className="border border-black">4</td>
              <td className="border border-black">5</td>
              <td className="border border-black">6</td>
              <td className="border border-black">7</td>
              <td className="border border-black">8</td>
              <td className="border border-black">9</td>
              <td className="border border-black">10</td>
              <td className="border border-black">11</td>
              <td className="border border-black">12</td>
              <td className="border border-black">13</td>
              <td className="border border-black">14</td>
              <td className="border border-black">15</td>
              <td className="border border-black">16</td>
              <td className="border border-black">17</td>
              <td className="border border-black">C</td>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((row: any, i: number) => (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1 font-bold">{row.fullName}</td>
                <td className="border border-black p-1 text-center">{row.rank}</td>
                <td className="border border-black p-1 text-center">{row.coefficient}</td>
                <td className="border border-black p-1 text-center">{row.productSalary?.quantity}</td>
                <td className="border border-black p-1 text-right">{Number(row.productSalary?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.timeSalary?.days}</td>
                <td className="border border-black p-1 text-right">{Number(row.timeSalary?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.leaveSalary?.days}</td>
                <td className="border border-black p-1 text-right">{Number(row.leaveSalary?.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.salaryFundAllowances || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.otherAllowances || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.advancePeriod1 || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.deductions?.bhxh || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.deductions?.other || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.deductions?.thueTNCN || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.deductions?.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold bg-slate-50 print:bg-transparent">{Number(row.period2Amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 print:bg-transparent h-10">
              <td className="border border-black p-1 text-center" colSpan={4}>Tổng cộng</td>
              <td className="border border-black p-1 text-center">x</td>
              <td className="border border-black p-1 text-right">{totals.productSalaryAmount.toLocaleString()}</td>
              <td className="border border-black p-1 text-center">x</td>
              <td className="border border-black p-1 text-right">{totals.timeSalaryAmount.toLocaleString()}</td>
              <td className="border border-black p-1 text-center">x</td>
              <td className="border border-black p-1 text-right">{totals.leaveSalaryAmount.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.salaryFundAllowances.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.otherAllowances.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.total.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.advancePeriod1.toLocaleString()}</td>
              <td className="border border-black p-1 text-center" colSpan={3}>x</td>
              <td className="border border-black p-1 text-right">{totals.deductionsTotal.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.period2Amount.toLocaleString()}</td>
              <td className="border border-black p-1"></td>
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
