import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface BonusPreviewProps {
  voucher: any;
  companySettings: any;
}

export const BonusPreview: React.FC<BonusPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totalAmount = (rows || []).reduce((sum: number, row: any) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 02 - LĐTL"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">DANH SÁCH THƯỞNG NHÂN VIÊN</h2>
        <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2 w-24">Mã NV</th>
            <th className="border border-black p-2">Họ và tên</th>
            <th className="border border-black p-2">Lý do thưởng</th>
            <th className="border border-black p-2 w-32">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 text-center">{row.employeeCode}</td>
              <td className="border border-black p-2">{row.employeeName}</td>
              <td className="border border-black p-2">{row.reason}</td>
              <td className="border border-black p-2 text-right">{Number(row.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-2 text-center" colSpan={4}>Tổng cộng</td>
            <td className="border border-black p-2 text-right">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)', isDate: true }
        ]}
        gridCols={3}
        date={date}
      />
    </div>
  );
};
