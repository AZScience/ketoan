import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface GoodsDeliveredPreviewProps {
  voucher: any;
  companySettings: any;
}

export const GoodsDeliveredPreview: React.FC<GoodsDeliveredPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, description, items, metadata } = voucher;
  const subTotal = items?.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) || 0;
  const totalVat = items?.reduce((sum: number, item: any) => sum + (Number(item.vatAmount) || 0), 0) || 0;
  const totalAmount = subTotal + totalVat;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 02 - VT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">PHIẾU XUẤT KHO</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-2 mb-6">
        <p><span className="font-bold">Họ và tên người nhận hàng:</span> {metadata?.receiverName || '................................................................'}</p>
        <p><span className="font-bold">Lý do xuất kho:</span> {description || '................................................................'}</p>
        <p><span className="font-bold">Xuất tại kho (ngăn lô):</span> {metadata?.warehouseName || '................................'} Địa điểm: {metadata?.warehouseLocation || '................................'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12" rowSpan={2}>STT</th>
            <th className="border border-black p-2" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-2 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-2 w-16" rowSpan={2}>ĐVT</th>
            <th className="border border-black p-2" colSpan={2}>Số lượng</th>
            <th className="border border-black p-2 w-24" rowSpan={2}>Đơn giá</th>
            <th className="border border-black p-2 w-32" rowSpan={2}>Thành tiền</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-16">Yêu cầu</th>
            <th className="border border-black p-1 w-16">Thực xuất</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2">{item.itemName}</td>
              <td className="border border-black p-2 text-center">{item.itemCode}</td>
              <td className="border border-black p-2 text-center">{item.unit}</td>
              <td className="border border-black p-2 text-center">{item.quantityPlanned}</td>
              <td className="border border-black p-2 text-center">{item.quantityActual}</td>
              <td className="border border-black p-2 text-right">{Number(item.price || 0).toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-8">
            <td className="border border-black p-2 text-right" colSpan={7}>Cộng tiền hàng</td>
            <td className="border border-black p-2 text-right">{subTotal.toLocaleString()}</td>
          </tr>
          <tr className="font-bold h-8">
            <td className="border border-black p-2 text-right" colSpan={7}>Tiền thuế GTGT</td>
            <td className="border border-black p-2 text-right">{totalVat.toLocaleString()}</td>
          </tr>
          <tr className="font-bold h-10 bg-slate-50 print:bg-transparent">
            <td className="border border-black p-2 text-right uppercase" colSpan={7}>Tổng cộng tiền thanh toán</td>
            <td className="border border-black p-2 text-right text-lg">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-10">
        <p><span className="font-bold italic">Tổng số tiền (viết bằng chữ):</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
        <p><span className="font-bold">Số chứng từ gốc:</span> {metadata?.attachments || '................................'}</p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Người nhận hàng', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ kho', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)' }
        ]}
        gridCols={5}
        date={date}
      />
    </div>
  );
};
