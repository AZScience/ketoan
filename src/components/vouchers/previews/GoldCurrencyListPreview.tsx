import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface GoldCurrencyListPreviewProps {
  voucher: any;
  companySettings: any;
}

export const GoldCurrencyListPreview: React.FC<GoldCurrencyListPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;
  const emptyRowsCount = Math.max(0, 5 - (items?.length || 0));

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto min-h-[1000px] flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5 max-w-[350px]">
          <p className="font-bold text-sm">Mẫu số 07 - TT</p>
          <p className="italic text-[10px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[10px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-[0.1em] mb-4">BẢNG KÊ VÀNG TIỀN TỆ</h2>
        <div className="flex justify-between items-end max-w-[700px] mx-auto text-left mb-4">
          <div className="space-y-1">
            <p className="italic text-[11px]">
              (Đính kèm phiếu <span className="font-bold border-b border-dotted border-black inline-block min-w-[80px] text-center">{metadata?.attachedToVoucher || '.........'}</span>
            </p>
            <p className="italic text-[11px]">
              Ngày {date ? format(new Date(date), 'dd') : '....'} tháng {date ? format(new Date(date), 'MM') : '....'} năm {date ? format(new Date(date), 'yyyy') : '.....'})
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[11px]">
              Quyển số: <span className="font-bold border-b border-dotted border-black inline-block min-w-[120px] text-center">{metadata?.bookNumber || '....................'}</span>
            </p>
            <p className="text-[11px]">
              Số: <span className="font-bold border-b border-dotted border-black inline-block min-w-[120px] text-center">{number || '....................'}</span>
            </p>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-8 text-[11px]">
        <thead>
          <tr className="font-bold text-center">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2">Tên, loại, quy cách, phẩm chất vàng tiền tệ</th>
            <th className="border border-black p-2 w-20">Đơn vị tính</th>
            <th className="border border-black p-2 w-20">Số lượng</th>
            <th className="border border-black p-2 w-24">Đơn giá</th>
            <th className="border border-black p-2 w-28">Thành tiền</th>
            <th className="border border-black p-2 w-24">Ghi chú</th>
          </tr>
          <tr className="text-[10px] text-center italic">
            <th className="border border-black p-1">A</th>
            <th className="border border-black p-1">B</th>
            <th className="border border-black p-1">C</th>
            <th className="border border-black p-1">1</th>
            <th className="border border-black p-1">2</th>
            <th className="border border-black p-1">3</th>
            <th className="border border-black p-1">4</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item: any, index: number) => (
            <tr key={index} className="h-10">
              <td className="border border-black p-2 text-center">{index + 1}</td>
              <td className="border border-black p-2">{item.itemName || item.note}</td>
              <td className="border border-black p-2 text-center">{item.unit}</td>
              <td className="border border-black p-2 text-right">{item.quantityActual?.toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{item.price?.toLocaleString()}</td>
              <td className="border border-black p-2 text-right">{item.amount.toLocaleString()}</td>
              <td className="border border-black p-2">{item.note}</td>
            </tr>
          ))}
          {Array.from({ length: emptyRowsCount }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-10">
              <td className="border border-black p-2 text-center">&nbsp;</td>
              <td className="border border-black p-2">&nbsp;</td>
              <td className="border border-black p-2 text-center">&nbsp;</td>
              <td className="border border-black p-2 text-right">&nbsp;</td>
              <td className="border border-black p-2 text-right">&nbsp;</td>
              <td className="border border-black p-2 text-right">&nbsp;</td>
              <td className="border border-black p-2">&nbsp;</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center font-bold">Cộng</td>
            <td className="border border-black p-2 text-center font-bold">x</td>
            <td className="border border-black p-2 text-center font-bold">x</td>
            <td className="border border-black p-2 text-center font-bold">x</td>
            <td className="border border-black p-2 text-right">{totalAmount.toLocaleString()}</td>
            <td className="border border-black p-2 text-center font-bold">x</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right mb-6">
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <VoucherSignatures
        signatures={[
          { role: 'Người lập biểu', subtext: '(Ký, họ tên)' },
          { role: 'Kế toán trưởng', subtext: '(Ký, họ tên)' },
          { role: 'Thủ quỹ', subtext: '(Ký, họ tên)' }
        ]}
        columns={3}
      />

      <div className="mt-auto pt-8 border-t border-slate-100">
        <p className="italic text-[10px] leading-relaxed">
          <span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.
        </p>
      </div>
    </div>
  );
};
