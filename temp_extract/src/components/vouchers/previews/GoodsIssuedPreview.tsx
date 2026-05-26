import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface GoodsIssuedPreviewProps {
  voucher: any;
  companySettings: any;
}

export const GoodsIssuedPreview: React.FC<GoodsIssuedPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items = [] } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 02 - VT"
        templateSource="Thông tư số 99/2018/TT-BTC"
        templateDate="Ngày 01/11/2018 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">PHIẾU XUẤT KHO</h2>
        <p className="italic text-[11px] mt-1">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <div className="flex justify-end mb-4 space-y-1 flex-col items-end">
        <p>Số: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center font-bold">{number || '............'}</span></p>
        <p>Nợ: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.debit || '............'}</span></p>
        <p>Có: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.credit || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Họ và tên người nhận hàng: <span className="font-bold">{metadata?.receiver || '................................................................................................'}</span></p>
        <p>- Lý do xuất kho: <span className="font-bold">{metadata?.reason || '................................................................................................'}</span></p>
        <p>- Xuất tại kho (ngăn lô): <span className="font-bold">{metadata?.warehouse || '................'}</span> địa điểm <span className="font-bold">{metadata?.location || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[9px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-8" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Số lượng</th>
            <th className="border border-black p-1 w-20" rowSpan={2}>Đơn giá</th>
            <th className="border border-black p-1 w-24" rowSpan={2}>Thành tiền</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-14">Yêu cầu</th>
            <th className="border border-black p-1 w-14">Thực xuất</th>
          </tr>
          <tr className="text-[8px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
            <td className="border border-black">4</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.code}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-center">{item.requestedQty}</td>
              <td className="border border-black p-1 text-center font-bold">{item.actualQty || item.quantity}</td>
              <td className="border border-black p-1 text-right">{Number(item.price || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right font-bold">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill empty rows to maintain layout if few items */}
          {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={4}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-2 mb-8">
        <p>- Tổng số tiền (viết bằng chữ): <span className="italic font-bold">{metadata?.amountInWords || '................................................................................................'}</span></p>
        <p>- Số chứng từ gốc: <span className="font-bold">{metadata?.attachments || metadata?.originalDocsCount || '............'}</span></p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Người lập phiếu', subtitle: '(Ký, họ tên)' },
          { title: 'Người nhận hàng', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ kho', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Hoặc bộ phận có nhu cầu xuất)', isDate: true },
        ]}
        date={date}
      />

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100 mt-8">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
