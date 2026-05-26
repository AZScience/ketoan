import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface InventoryInventoryPreviewProps {
  voucher: any;
  companySettings: any;
}

export const InventoryInventoryPreview: React.FC<InventoryInventoryPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 05 - VT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BIÊN BẢN KIỂM KÊ VẬT TƯ, CÔNG CỤ, SẢN PHẨM, HÀNG HÓA</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-10">
        <p>- Ban kiểm kê gồm:</p>
        <div className="pl-4 space-y-2">
          <p>1. {metadata?.member1 || '................................................................'} - Chức vụ: {metadata?.position1 || '................................'}</p>
          <p>2. {metadata?.member2 || '................................................................'} - Chức vụ: {metadata?.position2 || '................................'}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[10px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12" rowSpan={2}>STT</th>
            <th className="border border-black p-2" rowSpan={2}>Tên, nhãn hiệu, quy cách vật tư</th>
            <th className="border border-black p-2 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-2 w-16" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-2" colSpan={2}>Theo sổ kế toán</th>
            <th className="border border-black p-2" colSpan={2}>Theo kiểm kê</th>
            <th className="border border-black p-2" colSpan={2}>Chênh lệch</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-16">SL</th>
            <th className="border border-black p-1 w-24">Giá trị</th>
            <th className="border border-black p-1 w-16">SL</th>
            <th className="border border-black p-1 w-24">Giá trị</th>
            <th className="border border-black p-1 w-16">Thừa</th>
            <th className="border border-black p-1 w-16">Thiếu</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2">{row.name}</td>
              <td className="border border-black p-2 text-center">{row.code}</td>
              <td className="border border-black p-2 text-center">{row.unit}</td>
              <td className="border border-black p-2 text-center">{row.bookQuantity}</td>
              <td className="border border-black p-2 text-right">{Number(row.bookValue || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-center">{row.actualQuantity}</td>
              <td className="border border-black p-2 text-right">{Number(row.actualValue || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-center">{row.surplus}</td>
              <td className="border border-black p-2 text-center">{row.deficit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Trưởng ban kiểm kê', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' }
        ]}
        columns={2}
        date={date}
      />
    </div>
  );
};
