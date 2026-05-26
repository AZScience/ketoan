import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface MaterialAllocationPreviewProps {
  voucher: any;
  companySettings: any;
}

export const MaterialAllocationPreview: React.FC<MaterialAllocationPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 04 - VT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BẢNG PHÂN BỔ VẬT TƯ, CÔNG CỤ, DỤNG CỤ</h2>
        <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[10px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12" rowSpan={2}>STT</th>
            <th className="border border-black p-2" rowSpan={2}>Ghi có các TK / Ghi nợ các TK</th>
            <th className="border border-black p-2" colSpan={2}>Vật tư</th>
            <th className="border border-black p-2" colSpan={2}>Công cụ, dụng cụ</th>
            <th className="border border-black p-2 w-28" rowSpan={2}>Tổng cộng</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-24">Giá thực tế</th>
            <th className="border border-black p-1 w-24">Giá hạch toán</th>
            <th className="border border-black p-1 w-24">Giá thực tế</th>
            <th className="border border-black p-1 w-24">Giá hạch toán</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 font-bold">{row.account}</td>
              <td className="border border-black p-2 text-right">{Number(row.materialActual || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(row.materialPlanned || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(row.toolActual || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(row.toolPlanned || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right font-bold">{Number(row.total || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)', isDate: true }
        ]}
        columns={3}
        date={date}
      />
    </div>
  );
};
