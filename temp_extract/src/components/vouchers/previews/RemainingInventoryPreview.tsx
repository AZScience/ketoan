import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface RemainingInventoryPreviewProps {
  voucher: any;
  companySettings: any;
}

export const RemainingInventoryPreview: React.FC<RemainingInventoryPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items = [] } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 04 - VT"
        templateSource="Thông tư số 99/2025/TT-BTC"
        templateDate="Ngày 27/10/2025 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">PHIẾU BÁO VẬT TƯ CÒN LẠI CUỐI KỲ</h2>
        <p className="italic text-[11px] mt-1">Tháng {metadata?.month || (date ? format(new Date(date), 'MM') : '...')} năm {metadata?.year || (date ? format(new Date(date), 'yyyy') : '....')}</p>
        <p className="mt-1">Số: <span className="font-bold">{number || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Bộ phận sử dụng: <span className="font-bold">{metadata?.department || '................'}</span></p>
        <p>- Nhập tại kho: <span className="font-bold">{metadata?.warehouse || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[9px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-8">STT</th>
            <th className="border border-black p-1">Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-1 w-16">Mã số</th>
            <th className="border border-black p-1 w-12">Đơn vị tính</th>
            <th className="border border-black p-1 w-16">Số lượng</th>
            <th className="border border-black p-1 w-20">Đơn giá</th>
            <th className="border border-black p-1 w-24">Thành tiền</th>
          </tr>
          <tr className="text-[8px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.code}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-center font-bold">{item.quantity}</td>
              <td className="border border-black p-1 text-right">{Number(item.price || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right font-bold">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={4}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Người nhận hàng', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ kho', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Hoặc bộ phận có nhu cầu)', isDate: true },
        ]}
        date={date}
      />
    </div>
  );
};
