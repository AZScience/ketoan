import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PurchaseListPreviewProps {
  voucher: any;
  companySettings: any;
}

export const PurchaseListPreview: React.FC<PurchaseListPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totalAmount = (rows || []).reduce((sum: number, row: any) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companySettings={companySettings}
        templateName="Mẫu số 03 - VT"
        templateInfo={[
          '(Ban hành kèm theo Thông tư số 200/2014/TT-BTC',
          'Ngày 22/12/2014 của Bộ Tài chính)'
        ]}
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BẢNG KÊ THU MUA HÀNG HÓA KHÔNG CÓ HÓA ĐƠN</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="mb-6">
        <p><span className="font-bold">Họ và tên người mua:</span> {metadata?.buyerName || '................................................................'}</p>
        <p><span className="font-bold">Địa chỉ:</span> {metadata?.buyerAddress || '................................................................'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2">Tên hàng hóa, dịch vụ</th>
            <th className="border border-black p-2 w-16">ĐVT</th>
            <th className="border border-black p-2 w-16">SL</th>
            <th className="border border-black p-2 w-24">Đơn giá</th>
            <th className="border border-black p-2 w-32">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2">{row.itemName}</td>
              <td className="border border-black p-2 text-center">{row.unit}</td>
              <td className="border border-black p-2 text-center">{row.quantity}</td>
              <td className="border border-black p-2 text-right">{Number(row.price || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(row.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-2 text-center" colSpan={5}>Tổng cộng</td>
            <td className="border border-black p-2 text-right">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        signatures={[
          { role: 'Người lập biểu', subtext: '(Ký, họ tên)' },
          { role: 'Kế toán trưởng', subtext: '(Ký, họ tên)' },
          { role: 'Giám đốc', subtext: '(Ký, họ tên, đóng dấu)', showDate: true }
        ]}
        columns={3}
      />
    </div>
  );
};
