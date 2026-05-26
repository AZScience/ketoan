import React from 'react';
import { format } from 'date-fns';
import { VoucherSignatures } from './VoucherSignatures';

interface AssetHandoverPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AssetHandoverPreview: React.FC<AssetHandoverPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const assets = metadata?.assets || [];
  const tools = metadata?.tools || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.unit || companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm">Mẫu số 01 - TSCĐ</p>
          <p className="italic text-[9px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[9px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BIÊN BẢN GIAO NHẬN TSCĐ</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <div className="flex justify-end mb-4 space-y-1 flex-col items-end">
        <p>Số: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{number || '............'}</span></p>
        <p>Nợ: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.debit || '............'}</span></p>
        <p>Có: <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center">{metadata?.credit || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Căn cứ Quyết định số: <span className="font-bold">{metadata?.decisionNo || '................'}</span> ngày {metadata?.decisionDate ? format(new Date(metadata.decisionDate), 'dd/MM/yyyy') : '.../.../...'} của <span className="font-bold">{metadata?.decisionBy || '................'}</span> về việc bàn giao TSCĐ</p>
        <p>- Ban giao nhận TSCĐ gồm:</p>
        <div className="pl-4 space-y-1">
          {(metadata?.committee || []).map((member: any, i: number) => (
            <p key={i}>- Ông/Bà: <span className="font-bold">{member.name || '................................'}</span> chức vụ <span className="font-bold">{member.role || '................'}</span> Đại diện <span className="font-bold">{member.representative || '................'}</span></p>
          ))}
        </div>
        <p>- Địa điểm giao nhận TSCĐ: <span className="font-bold">{metadata?.handoverLocation || '................................'}</span></p>
        <p>Xác nhận việc giao nhận TSCĐ như sau:</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[9px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-6" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên, ký hiệu quy cách (cấp hạng TSCĐ)</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Số hiệu/Mã TSCĐ</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Nước sản xuất (XD)</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Năm sản xuất</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Năm đưa vào sử dụng</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Công suất (diện tích thiết kế)</th>
            <th className="border border-black p-1" colSpan={5}>Tính nguyên giá tài sản cố định</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Tài liệu kỹ thuật kèm theo</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-16">Giá mua</th>
            <th className="border border-black p-1 w-16">Chi phí vận chuyển</th>
            <th className="border border-black p-1 w-16">Chi phí chạy thử</th>
            <th className="border border-black p-1 w-16">...</th>
            <th className="border border-black p-1 w-20">Nguyên giá TSCĐ</th>
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
            <td className="border border-black">5</td>
            <td className="border border-black">6</td>
            <td className="border border-black">7</td>
            <td className="border border-black">8</td>
            <td className="border border-black">E</td>
          </tr>
        </thead>
        <tbody>
          {(assets || []).map((asset: any, i: number) => {
            const total = Number(asset.purchasePrice || 0) + Number(asset.shippingCost || 0) + Number(asset.trialCost || 0) + Number(asset.otherCost || 0);
            return (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{asset.name}</td>
                <td className="border border-black p-1 text-center">{asset.code}</td>
                <td className="border border-black p-1 text-center">{asset.origin}</td>
                <td className="border border-black p-1 text-center">{asset.manufactureYear}</td>
                <td className="border border-black p-1 text-center">{asset.useYear}</td>
                <td className="border border-black p-1 text-center">{asset.capacity}</td>
                <td className="border border-black p-1 text-right">{Number(asset.purchasePrice || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(asset.shippingCost || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(asset.trialCost || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(asset.otherCost || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{total.toLocaleString()}</td>
                <td className="border border-black p-1">{asset.techDocs}</td>
              </tr>
            );
          })}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={2}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{(assets || []).reduce((sum: number, a: any) => sum + Number(a.purchasePrice || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{(assets || []).reduce((sum: number, a: any) => sum + Number(a.shippingCost || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{(assets || []).reduce((sum: number, a: any) => sum + Number(a.trialCost || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{(assets || []).reduce((sum: number, a: any) => sum + Number(a.otherCost || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{(assets || []).reduce((sum: number, a: any) => {
              const total = Number(a.purchasePrice || 0) + Number(a.shippingCost || 0) + Number(a.trialCost || 0) + Number(a.otherCost || 0);
              return sum + total;
            }, 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
          </tr>
        </tbody>
      </table>

      <div className="text-center font-bold mb-4 uppercase">DỤNG CỤ, PHỤ TÙNG KÈM THEO</div>
      <table className="w-full border-collapse border border-black mb-10 text-[9px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-12">Số thứ tự</th>
            <th className="border border-black p-1">Tên, quy cách dụng cụ, phụ tùng</th>
            <th className="border border-black p-1 w-24">Đơn vị tính</th>
            <th className="border border-black p-1 w-24">Số lượng</th>
            <th className="border border-black p-1 w-32">Giá trị</th>
          </tr>
          <tr className="text-[8px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
          </tr>
        </thead>
        <tbody>
          {(tools || []).map((tool: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{tool.name}</td>
              <td className="border border-black p-1 text-center">{tool.unit}</td>
              <td className="border border-black p-1 text-center">{tool.quantity}</td>
              <td className="border border-black p-1 text-right">{Number(tool.value || 0).toLocaleString()}</td>
            </tr>
          ))}
          {tools.length === 0 && (
            <tr className="h-8">
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-right"></td>
            </tr>
          )}
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Giám đốc bên nhận', subtitle: '(Ký, họ tên, đóng dấu)' },
          { title: 'Kế toán trưởng bên nhận', subtitle: '(Ký, họ tên)' },
          { title: 'Người nhận', subtitle: '(Ký, họ tên)' },
          { title: 'Người giao', subtitle: '(Ký, họ tên)' },
        ]}
        columns={4}
        date={date}
      />

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100 mt-8">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
