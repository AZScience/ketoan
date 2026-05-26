import React from 'react';
import { format } from 'date-fns';

interface AssetRepairPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AssetRepairPreview: React.FC<AssetRepairPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const details = metadata?.repairDetails || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.unit || companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm">Mẫu số 03 - TSCĐ</p>
          <p className="italic text-[9px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[9px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider leading-tight">BIÊN BẢN BÀN GIAO TSCĐ<br/>SỬA CHỮA, BẢO DƯỠNG HOẶC NÂNG CẤP, CẢI TẠO HOÀN THÀNH</h2>
        <p className="italic text-[11px] mt-2">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <div className="flex justify-end mb-4 space-y-1 flex-col items-end">
        <p>Số: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{number || '............'}</span></p>
        <p>Nợ: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.debit || '............'}</span></p>
        <p>Có: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.credit || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Căn cứ Quyết định số: <span className="font-bold">{metadata?.decisionNo || '................'}</span> ngày {metadata?.decisionDate ? format(new Date(metadata.decisionDate), 'dd/MM/yyyy') : '.../.../...'} của <span className="font-bold">{metadata?.decisionBy || '................'}</span></p>
        <p>Chúng tôi gồm:</p>
        <div className="pl-4 space-y-1">
          <p>- Ông/Bà: <span className="font-bold">{metadata?.repairParty?.name || '................'}</span> Chức vụ <span className="font-bold">{metadata?.repairParty?.role || '................'}</span> Đại diện <span className="font-bold">{metadata?.repairParty?.representative || '................'}</span> đơn vị sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo</p>
          <p>- Ông/Bà: <span className="font-bold">{metadata?.ownerParty?.name || '................'}</span> Chức vụ <span className="font-bold">{metadata?.ownerParty?.role || '................'}</span> Đại diện <span className="font-bold">{metadata?.ownerParty?.representative || '................'}</span> đơn vị có TSCĐ.</p>
        </div>
        <p>Đã kiểm nhận việc sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo TSCĐ như sau:</p>
        <div className="pl-4 space-y-1">
          <p>- Tên, ký mã hiệu, quy cách (cấp hạng) TSCĐ: <span className="font-bold">{metadata?.assetName || '................'}</span></p>
          <p>- Số hiệu TSCĐ: <span className="font-bold">{metadata?.assetCode || '................'}</span> Số thẻ TSCĐ: <span className="font-bold">{metadata?.assetCardNo || '................'}</span></p>
          <p>- Bộ phận quản lý, sử dụng: <span className="font-bold">{metadata?.managementDept || '................'}</span></p>
          <p>- Thời gian sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo từ ngày <span className="font-bold">{metadata?.startDate ? format(new Date(metadata.startDate), 'dd/MM/yyyy') : '.../.../...'}</span> đến ngày <span className="font-bold">{metadata?.endDate ? format(new Date(metadata.endDate), 'dd/MM/yyyy') : '.../.../...'}</span></p>
        </div>
        <p>Các bộ phận sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo gồm có:</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[9px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1">Tên bộ phận cần sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo</th>
            <th className="border border-black p-1">Nội dung (mức độ) công việc sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo</th>
            <th className="border border-black p-1 w-20">Giá dự toán</th>
            <th className="border border-black p-1 w-20">Chi phí thực tế</th>
            <th className="border border-black p-1">Kết quả kiểm tra sau sửa chữa, bảo dưỡng hoặc nâng cấp, cải tạo</th>
          </tr>
          <tr className="text-[8px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
          </tr>
        </thead>
        <tbody>
          {details.map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1">{row.partName}</td>
              <td className="border border-black p-1">{row.content}</td>
              <td className="border border-black p-1 text-right">{Number(row.estimatedCost || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right font-bold">{Number(row.actualCost || 0).toLocaleString()}</td>
              <td className="border border-black p-1">{row.testResult}</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={2}>Cộng</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.estimatedCost || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.actualCost || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-2 mb-10">
        <p><span className="font-bold">Kết luận:</span> {metadata?.conclusion || '................................................................................................................'}</p>
      </div>

      <div className="grid grid-cols-2 text-center gap-4 mt-12 mb-24">
        <div className="space-y-1">
          <p className="font-bold uppercase">Đại diện đơn vị nhận</p>
          <p className="italic text-[8px]">(Ký, họ tên)</p>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase">Đại diện đơn vị giao</p>
          <p className="italic text-[8px]">(Ký, họ tên)</p>
        </div>
      </div>

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
