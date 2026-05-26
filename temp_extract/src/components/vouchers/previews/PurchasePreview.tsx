import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PurchasePreviewProps {
  voucher: any;
  companySettings: any;
}

export const PurchasePreview: React.FC<PurchasePreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items } = voucher;
  const subTotal = items?.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
  const totalVat = items?.reduce((sum: number, item: any) => sum + (Number(item.vatAmount) || 0), 0) || 0;
  const totalAmount = subTotal + totalVat;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 06a - VT"
        templateSource="Thông tư số 99/2018/TT-BTC"
        templateDate="Ngày 01/11/2018 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">HÓA ĐƠN MUA HÀNG</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-2 mb-6">
        <p><span className="font-bold">Đơn vị bán hàng:</span> {metadata?.supplierName || '................................................................'}</p>
        <p><span className="font-bold">Địa chỉ:</span> {metadata?.supplierAddress || '................................................................'}</p>
        <p><span className="font-bold">Hình thức thanh toán:</span> {metadata?.paymentMethod || '................................'}</p>
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
          {(items || []).map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2">{item.itemName}</td>
              <td className="border border-black p-2 text-center">{item.unit}</td>
              <td className="border border-black p-2 text-center">{item.quantityActual}</td>
              <td className="border border-black p-2 text-right">{Number(item.price || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-8">
            <td className="border border-black p-2 text-right" colSpan={5}>Cộng tiền hàng</td>
            <td className="border border-black p-2 text-right">{subTotal.toLocaleString()}</td>
          </tr>
          <tr className="font-bold h-8">
            <td className="border border-black p-2 text-right" colSpan={5}>Tiền thuế GTGT</td>
            <td className="border border-black p-2 text-right">{totalVat.toLocaleString()}</td>
          </tr>
          <tr className="font-bold h-10 bg-slate-50 print:bg-transparent">
            <td className="border border-black p-2 text-right uppercase" colSpan={5}>Tổng cộng tiền thanh toán</td>
            <td className="border border-black p-2 text-right text-lg">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-10">
        <p><span className="font-bold italic">Tổng số tiền (viết bằng chữ):</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Người mua hàng', subtitle: '(Ký, họ tên)' },
          { title: 'Người bán hàng', subtitle: '(Ký, họ tên)' }
        ]}
        gridCols={2}
        date={date}
      />
    </div>
  );
};
