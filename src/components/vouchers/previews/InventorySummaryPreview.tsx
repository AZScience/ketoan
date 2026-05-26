import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface InventorySummaryPreviewProps {
  voucher: any;
  companySettings: any;
}

export const InventorySummaryPreview: React.FC<InventorySummaryPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items = [] } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[1000px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none overflow-x-auto">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 06 - VT"
        templateSource="Thông tư số 99/2025/TT-BTC"
        templateDate="Ngày 27/10/2025 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider leading-tight">BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN KHO<br/>VẬT TƯ, HÀNG HÓA</h2>
        <p className="italic text-[11px] mt-2">Tháng {metadata?.month || (date ? format(new Date(date), 'MM') : '...')} năm {metadata?.year || (date ? format(new Date(date), 'yyyy') : '....')}</p>
        <p className="mt-1">Số: <span className="font-bold">{number || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Loại vật tư, hàng hóa: <span className="font-bold">{metadata?.materialType || '................'}</span></p>
        <p>- Kho: <span className="font-bold">{metadata?.warehouse || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[8px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-8" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Tồn đầu kỳ</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Nhập trong kỳ</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Xuất trong kỳ</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Tồn cuối kỳ</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
            <td className="border border-black">4</td>
            <td className="border border-black">5</td>
            <td className="border border-black">6</td>
            <td className="border border-black">7</td>
            <td className="border border-black">8</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.code}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-center">{item.openingQty}</td>
              <td className="border border-black p-1 text-right">{Number(item.openingAmount || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-center">{item.inQty}</td>
              <td className="border border-black p-1 text-right">{Number(item.inAmount || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-center">{item.outQty}</td>
              <td className="border border-black p-1 text-right">{Number(item.outAmount || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-center font-bold">{item.closingQty}</td>
              <td className="border border-black p-1 text-right font-bold">{Number(item.closingAmount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-10 bg-slate-100/50">
            <td className="border border-black p-1 text-center" colSpan={4}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.openingAmount || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.inAmount || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.outAmount || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.closingAmount || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)', isDate: true },
        ]}
        date={date}
      />

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100 mt-8">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
