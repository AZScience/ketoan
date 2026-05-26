import React from 'react';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface SalesPreviewProps {
  voucher: any;
  companySettings: any;
}

export const SalesPreview: React.FC<SalesPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items, description } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;
  const totalVat = items?.reduce((sum: number, item: any) => sum + (Number(item.vatAmount) || 0), 0) || 0;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold uppercase">{companySettings?.name || '................'}</p>
          <p className="font-bold">Địa chỉ: <span className="font-normal">{companySettings?.address || '................'}</span></p>
          <p className="font-bold">MST: <span className="font-normal">{companySettings?.taxCode || '................'}</span></p>
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold text-lg uppercase">Hóa đơn GTGT</p>
          <p className="italic text-[10px]">(Bản thể hiện của hóa đơn điện tử)</p>
          <p>Ký hiệu: <span className="font-bold">{metadata?.invoiceSerial || '................'}</span></p>
          <p>Số: <span className="font-bold text-red-600">{metadata?.invoiceNumber || '............'}</span></p>
        </div>
      </div>

      <div className="border-t border-b border-black py-4 mb-6 space-y-2 text-[11px]">
        <p><span className="font-bold">Đơn vị bán hàng:</span> {companySettings?.name || '................'}</p>
        <p><span className="font-bold">Họ tên người mua hàng:</span> {metadata?.buyerName || '................................'}</p>
        <p><span className="font-bold">Tên đơn vị:</span> {metadata?.customerName || '................................'}</p>
        <p><span className="font-bold">Địa chỉ:</span> {metadata?.customerAddress || '................................'}</p>
        <p><span className="font-bold">Hình thức thanh toán:</span> {metadata?.paymentMethod || '................'} <span className="ml-10 font-bold">MST:</span> {metadata?.customerTaxCode || '................'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[10px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-10">STT</th>
            <th className="border border-black p-2">Tên hàng hóa, dịch vụ</th>
            <th className="border border-black p-2 w-16">ĐVT</th>
            <th className="border border-black p-2 w-16">SL</th>
            <th className="border border-black p-2 w-24">Đơn giá</th>
            <th className="border border-black p-2 w-28">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item: any, index: number) => (
            <tr key={index} className="h-8">
              <td className="border border-black p-2 text-center">{index + 1}</td>
              <td className="border border-black p-2">{item.itemName || item.note}</td>
              <td className="border border-black p-2 text-center">{item.unit}</td>
              <td className="border border-black p-2 text-right">{Number(item.quantityActual || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(item.price || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right font-bold">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="h-8">
            <td className="border border-black p-2 text-right font-bold" colSpan={5}>Cộng tiền hàng:</td>
            <td className="border border-black p-2 text-right font-bold">{totalAmount.toLocaleString()}</td>
          </tr>
          <tr className="h-8">
            <td className="border border-black p-2 text-right font-bold" colSpan={5}>Tiền thuế GTGT:</td>
            <td className="border border-black p-2 text-right font-bold">{totalVat.toLocaleString()}</td>
          </tr>
          <tr className="h-8 bg-slate-50 print:bg-transparent">
            <td className="border border-black p-2 text-right font-bold uppercase" colSpan={5}>Tổng cộng tiền thanh toán:</td>
            <td className="border border-black p-2 text-right font-bold text-lg">{(totalAmount + totalVat).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-10 text-[11px]">
        <p><span className="font-bold italic">Số tiền viết bằng chữ:</span> <span className="font-bold italic">{metadata?.amountInWords || '................................................................'}</span></p>
      </div>

      <VoucherSignatures
        signatures={[
          { role: 'Người mua hàng', subtext: '(Ký, họ tên)' },
          { role: 'Người bán hàng', subtext: '(Ký, họ tên, đóng dấu)' }
        ]}
        columns={2}
      />
    </div>
  );
};
