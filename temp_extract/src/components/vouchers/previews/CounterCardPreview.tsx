import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface CounterCardPreviewProps {
  voucher: any;
  companySettings: any;
}

export const CounterCardPreview: React.FC<CounterCardPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 06 - VT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">THẺ KHO (SỔ KHO)</h2>
        <p className="italic text-[11px]">Ngày lập thẻ: {date ? format(new Date(date), 'dd/MM/yyyy') : '.../.../...'}</p>
      </div>

      <div className="space-y-3 mb-6 text-[11px]">
        <p>- Tên, nhãn hiệu, quy cách vật tư: <span className="font-bold border-b border-dotted border-black inline-block min-w-[300px]">{metadata?.itemName || '................................'}</span></p>
        <p>- Đơn vị tính: <span className="font-bold border-b border-dotted border-black inline-block min-w-[100px]">{metadata?.unit || '................'}</span> Mã số: <span className="font-bold border-b border-dotted border-black inline-block min-w-[100px]">{metadata?.itemCode || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[10px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12" rowSpan={2}>STT</th>
            <th className="border border-black p-2" colSpan={2}>Chứng từ</th>
            <th className="border border-black p-2" rowSpan={2}>Diễn giải</th>
            <th className="border border-black p-2" colSpan={3}>Số lượng</th>
            <th className="border border-black p-2 w-20" rowSpan={2}>Ký xác nhận của kế toán</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-20">Số hiệu</th>
            <th className="border border-black p-1 w-20">Ngày tháng</th>
            <th className="border border-black p-1 w-16">Nhập</th>
            <th className="border border-black p-1 w-16">Xuất</th>
            <th className="border border-black p-1 w-16">Tồn</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 text-center">{row.voucherNumber}</td>
              <td className="border border-black p-2 text-center">{row.voucherDate}</td>
              <td className="border border-black p-2">{row.description}</td>
              <td className="border border-black p-2 text-right">{row.inQuantity}</td>
              <td className="border border-black p-2 text-right">{row.outQuantity}</td>
              <td className="border border-black p-2 text-right font-bold">{row.balance}</td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập thẻ', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ kho', subtitle: '(Ký, họ tên)', isDate: true }
        ]}
        columns={2}
        date={date}
      />
    </div>
  );
};
