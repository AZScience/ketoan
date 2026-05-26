import React from 'react';
import { format } from 'date-fns';

interface AssetInventoryPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AssetInventoryPreview: React.FC<AssetInventoryPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const committee = metadata?.committee || [];
  const details = metadata?.inventoryDetails || [];
  const inventoryTime = metadata?.inventoryTime ? new Date(metadata.inventoryTime) : null;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.unit || companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm">Mẫu số 05 - TSCĐ</p>
          <p className="italic text-[9px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[9px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider leading-tight">BIÊN BẢN TỔNG HỢP KIỂM KÊ TÀI SẢN CỐ ĐỊNH</h2>
        <p className="mt-2 font-bold">Số: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{number || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>Thời điểm kiểm kê <span className="font-bold">{inventoryTime ? format(inventoryTime, 'HH') : '...'}</span> giờ <span className="font-bold">{inventoryTime ? format(inventoryTime, 'mm') : '...'}</span> ngày <span className="font-bold">{inventoryTime ? format(inventoryTime, 'dd') : '...'}</span> tháng <span className="font-bold">{inventoryTime ? format(inventoryTime, 'MM') : '...'}</span> năm <span className="font-bold">{inventoryTime ? format(inventoryTime, 'yyyy') : '...'}</span></p>
        <p>Ban kiểm kê gồm:</p>
        <div className="pl-4 space-y-1">
          {committee.map((member: any, i: number) => (
            <p key={i}>- Ông/Bà: <span className="font-bold">{member.name || '................'}</span> Chức vụ <span className="font-bold">{member.role || '................'}</span> Đại diện <span className="font-bold">{member.representative || '................'}</span> {member.title}</p>
          ))}
        </div>
        <p>Đã kiểm kê TSCĐ, kết quả như sau:</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[8px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên TSCĐ</th>
            <th className="border border-black p-1" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-1" rowSpan={2}>Mã số</th>
            <th className="border border-black p-1" rowSpan={2}>Nơi sử dụng</th>
            <th className="border border-black p-1" colSpan={3}>Theo sổ kế toán</th>
            <th className="border border-black p-1" colSpan={3}>Theo kiểm kê</th>
            <th className="border border-black p-1" colSpan={3}>Chênh lệch</th>
            <th className="border border-black p-1" rowSpan={2}>Ghi chú</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1">Số lượng</th>
            <th className="border border-black p-1">Nguyên giá</th>
            <th className="border border-black p-1">Giá trị còn lại</th>
            <th className="border border-black p-1">Số lượng</th>
            <th className="border border-black p-1">Nguyên giá</th>
            <th className="border border-black p-1">Giá trị còn lại</th>
            <th className="border border-black p-1">Số lượng</th>
            <th className="border border-black p-1">Nguyên giá</th>
            <th className="border border-black p-1">Giá trị còn lại</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">E</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
            <td className="border border-black">4</td>
            <td className="border border-black">5</td>
            <td className="border border-black">6</td>
            <td className="border border-black">7</td>
            <td className="border border-black">8</td>
            <td className="border border-black">9</td>
            <td className="border border-black">F</td>
          </tr>
        </thead>
        <tbody>
          {details.map((row: any, i: number) => {
            const diffQty = Number(row.actualQty || 0) - Number(row.bookQty || 0);
            const diffOriginal = Number(row.actualOriginal || 0) - Number(row.bookOriginal || 0);
            const diffRemaining = Number(row.actualRemaining || 0) - Number(row.bookRemaining || 0);

            return (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{row.name}</td>
                <td className="border border-black p-1 text-center">{row.unit}</td>
                <td className="border border-black p-1 text-center">{row.code}</td>
                <td className="border border-black p-1 text-center">{row.location}</td>
                <td className="border border-black p-1 text-center">{row.bookQty}</td>
                <td className="border border-black p-1 text-right">{Number(row.bookOriginal || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.bookRemaining || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{row.actualQty}</td>
                <td className="border border-black p-1 text-right">{Number(row.actualOriginal || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.actualRemaining || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{diffQty.toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{diffOriginal.toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{diffRemaining.toLocaleString()}</td>
                <td className="border border-black p-1">{row.note}</td>
              </tr>
            );
          })}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={5}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.bookOriginal || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.bookRemaining || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.actualOriginal || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{details.reduce((sum: number, r: any) => sum + Number(r.actualRemaining || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{(details.reduce((sum: number, r: any) => sum + Number(r.actualOriginal || 0), 0) - details.reduce((sum: number, r: any) => sum + Number(r.bookOriginal || 0), 0)).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{(details.reduce((sum: number, r: any) => sum + Number(r.actualRemaining || 0), 0) - details.reduce((sum: number, r: any) => sum + Number(r.bookRemaining || 0), 0)).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-3 text-center gap-4 mt-12 mb-24">
        <div className="space-y-1">
          <p className="font-bold uppercase">Giám đốc</p>
          <p className="italic text-[8px] leading-tight">(Ghi ý kiến giải quyết số chênh lệch)</p>
          <p className="italic text-[8px]">(Ký, họ tên, đóng dấu)</p>
          <div className="mt-4 text-left italic text-[9px] min-h-[40px] border border-slate-200 p-2 rounded">
            {metadata?.directorOpinion}
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-bold uppercase">Kế toán trưởng</p>
          <p className="italic text-[8px]">(Ký, họ tên)</p>
        </div>
        <div className="space-y-1">
          <p className="italic text-[9px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="font-bold uppercase">Trưởng Ban kiểm kê</p>
          <p className="italic text-[8px]">(Ký, họ tên)</p>
        </div>
      </div>

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
