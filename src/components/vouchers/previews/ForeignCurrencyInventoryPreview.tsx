import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface ForeignCurrencyInventoryPreviewProps {
  voucher: any;
  companySettings: any;
}

export const ForeignCurrencyInventoryPreview: React.FC<ForeignCurrencyInventoryPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 08 - TT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BẢNG KÊ NGOẠI TỆ</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd/MM/yyyy') : '.../.../...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2">Loại ngoại tệ</th>
            <th className="border border-black p-2 w-24">Số lượng</th>
            <th className="border border-black p-2 w-24">Tỷ giá</th>
            <th className="border border-black p-2 w-32">Thành tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 text-center">{row.currency}</td>
              <td className="border border-black p-2 text-center">{row.quantity}</td>
              <td className="border border-black p-2 text-right">{Number(row.rate || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right font-bold">{Number(row.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ quỹ', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)', isDate: true }
        ]}
        gridCols={3}
        date={date}
      />
    </div>
  );
};
