import React from 'react';
import { format } from 'date-fns';

interface AssetLiquidationPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AssetLiquidationPreview: React.FC<AssetLiquidationPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.unit || companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm">Mẫu số 02 - TSCĐ</p>
          <p className="italic text-[9px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[9px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BIÊN BẢN THANH LÝ TSCĐ</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <div className="flex justify-end mb-4 space-y-1 flex-col items-end">
        <p>Số: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{number || '............'}</span></p>
        <p>Nợ: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.debit || '............'}</span></p>
        <p>Có: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.credit || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Căn cứ Quyết định số: <span className="font-bold">{metadata?.decisionNo || '................'}</span> ngày {metadata?.decisionDate ? format(new Date(metadata.decisionDate), 'dd/MM/yyyy') : '.../.../...'} của <span className="font-bold">{metadata?.decisionBy || '................'}</span> về việc thanh lý tài sản cố định.</p>
        <p>I. Ban thanh lý TSCĐ gồm:</p>
        <div className="pl-4 space-y-1">
          {(metadata?.committee || []).map((member: any, i: number) => (
            <p key={i}>- Ông/Bà: <span className="font-bold">{member.name || '................................'}</span> chức vụ <span className="font-bold">{member.role || '................'}</span> Đại diện <span className="font-bold">{member.representative || '................'}</span> <span className="font-bold">{member.title || '................'}</span></p>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <p className="font-bold">II. Tiến hành thanh lý TSCĐ:</p>
        <div className="pl-4 space-y-2">
          <p>- Tên, ký mã hiệu, quy cách (cấp hạng) TSCĐ: <span className="font-bold">{metadata?.assetName || '................................'}</span></p>
          <p>- Số hiệu TSCĐ/Mã TSCĐ: <span className="font-bold">{metadata?.assetCode || '................'}</span></p>
          <p>- Năm sản xuất: <span className="font-bold">{metadata?.manufactureYear || '................'}</span></p>
          <p>- Năm đưa vào sử dụng: <span className="font-bold">{metadata?.useYear || '................'}</span> Số thẻ TSCĐ: <span className="font-bold">{metadata?.assetCardNo || '................'}</span></p>
          <p>- Nguyên giá TSCĐ: <span className="font-bold">{Number(metadata?.originalCost || 0).toLocaleString()}</span></p>
          <p>- Giá trị hao mòn đã trích đến thời điểm thanh lý: <span className="font-bold">{Number(metadata?.accumulatedDepreciation || 0).toLocaleString()}</span></p>
          <p>- Giá trị còn lại của TSCĐ: <span className="font-bold">{Number(metadata?.remainingValue || 0).toLocaleString()}</span></p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <p className="font-bold">III. Kết luận của Ban thanh lý TSCĐ:</p>
        <div className="pl-4 min-h-[60px] border-b border-dotted border-black">
          {metadata?.conclusion || '................................................................................................................................................................'}
        </div>
        <div className="flex justify-end mt-4">
          <div className="text-center">
            <p className="italic">Ngày {metadata?.conclusionDate ? format(new Date(metadata.conclusionDate), 'dd') : '...'} tháng {metadata?.conclusionDate ? format(new Date(metadata.conclusionDate), 'MM') : '...'} năm {metadata?.conclusionDate ? format(new Date(metadata.conclusionDate), 'yyyy') : '...'}</p>
            <p className="font-bold uppercase">Trưởng Ban thanh lý</p>
            <p className="italic text-[8px]">(Ký, họ tên)</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <p className="font-bold">IV. Kết quả thanh lý TSCĐ:</p>
        <div className="pl-4 space-y-2">
          <p>- Chi phí thanh lý TSCĐ: <span className="font-bold">{Number(metadata?.liquidationCost || 0).toLocaleString()}</span> (viết bằng chữ): <span className="italic">{metadata?.liquidationCostInWords || '................................'}</span></p>
          <p>- Giá trị thu hồi: <span className="font-bold">{Number(metadata?.recoveryValue || 0).toLocaleString()}</span> (viết bằng chữ): <span className="italic">{metadata?.recoveryValueInWords || '................................'}</span></p>
          <p>- Đã ghi giảm sổ TSCĐ ngày <span className="font-bold">{metadata?.reductionDate ? format(new Date(metadata.reductionDate), 'dd') : '...'}</span> tháng <span className="font-bold">{metadata?.reductionDate ? format(new Date(metadata.reductionDate), 'MM') : '...'}</span> năm <span className="font-bold">{metadata?.reductionDate ? format(new Date(metadata.reductionDate), 'yyyy') : '...'}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 text-center gap-4 mt-12 mb-24">
        <div className="space-y-1">
          <p className="font-bold uppercase">Giám đốc</p>
          <p className="italic text-[8px]">(Ký, họ tên, đóng dấu)</p>
        </div>
        <div className="space-y-1">
          <div className="text-center">
            <p className="italic">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
            <p className="font-bold uppercase">Kế toán trưởng</p>
            <p className="italic text-[8px]">(Ký, họ tên)</p>
          </div>
        </div>
      </div>

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
