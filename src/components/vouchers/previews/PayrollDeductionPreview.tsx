import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PayrollDeductionPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const PayrollDeductionPreview: React.FC<PayrollDeductionPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totals = rows.reduce((acc: any, row: any) => ({
    totalSalaryFund: acc.totalSalaryFund + (Number(row.totalSalaryFund) || 0),
    insuranceTotal: acc.insuranceTotal + (Number(row.insurance?.total) || 0),
    unionFeeTotal: acc.unionFeeTotal + (Number(row.unionFee?.total) || 0),
  }), { totalSalaryFund: 0, insuranceTotal: 0, unionFeeTotal: 0 });

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-tight border border-slate-200 shadow-inner overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:overflow-visible">
      <div className="min-w-[1000px] print:min-w-0 print:w-full">
        <VoucherHeader 
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 07 - LĐTL"
          templateSource="Thông tư số 200/2014/TT-BTC"
          templateDate="Ngày 22/12/2014 của Bộ Tài chính"
        />

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">BẢNG KÊ TRÍCH NỘP THEO LƯƠNG</h2>
          <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="mt-1 font-bold">Số: {number || '............'}</p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[9px]">
          <thead>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th rowSpan={2} className="border border-black p-1 w-8">STT</th>
              <th rowSpan={2} className="border border-black p-1 w-32">Số tháng trích</th>
              <th rowSpan={2} className="border border-black p-1 w-32">Tổng quỹ lương trích</th>
              <th colSpan={3} className="border border-black p-1">BHXH, BHYT, BHTN</th>
              <th colSpan={3} className="border border-black p-1">KPCĐ</th>
            </tr>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th className="border border-black p-1 w-24">Tổng số</th>
              <th className="border border-black p-1 w-24">Trích vào CP</th>
              <th className="border border-black p-1 w-24">Trừ vào lương</th>
              <th className="border border-black p-1 w-24">Tổng số</th>
              <th className="border border-black p-1 w-24">Nộp cấp trên</th>
              <th className="border border-black p-1 w-24">Để lại đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{row.stt || i + 1}</td>
                <td className="border border-black p-1 text-center">{row.month}</td>
                <td className="border border-black p-1 text-right">{Number(row.totalSalaryFund || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.insurance?.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.insurance?.expense || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.insurance?.salaryDeduction || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.unionFee?.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.unionFee?.upperLevel || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.unionFee?.retained || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 print:bg-transparent h-10">
              <td className="border border-black p-1 text-center" colSpan={2}>Tổng cộng</td>
              <td className="border border-black p-1 text-right">{totals.totalSalaryFund.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.insuranceTotal.toLocaleString()}</td>
              <td colSpan={2} className="border border-black p-1"></td>
              <td className="border border-black p-1 text-right">{totals.unionFeeTotal.toLocaleString()}</td>
              <td colSpan={2} className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>

        <VoucherSignatures 
          roles={[
            { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
            { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
            { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)', isDate: true },
          ]}
          date={date}
          gridCols={3}
        />
      </div>
    </div>
  );
};
