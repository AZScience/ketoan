import React from 'react';
import { format } from 'date-fns';
import { VoucherSignatures } from './VoucherSignatures';

interface AssetDepreciationPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AssetDepreciationPreview: React.FC<AssetDepreciationPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totals = {
    originalCost: rows.reduce((sum: number, r: any) => sum + Number(r.originalCost || 0), 0),
    depAmount: rows.reduce((sum: number, r: any) => sum + Number(r.depAmount || 0), 0),
    tk627_1: rows.reduce((sum: number, r: any) => sum + Number(r.tk627_1 || 0), 0),
    tk627_2: rows.reduce((sum: number, r: any) => sum + Number(r.tk627_2 || 0), 0),
    tk627_3: rows.reduce((sum: number, r: any) => sum + Number(r.tk627_3 || 0), 0),
    tk627_4: rows.reduce((sum: number, r: any) => sum + Number(r.tk627_4 || 0), 0),
    tk623: rows.reduce((sum: number, r: any) => sum + Number(r.tk623 || 0), 0),
    tk641: rows.reduce((sum: number, r: any) => sum + Number(r.tk641 || 0), 0),
    tk642: rows.reduce((sum: number, r: any) => sum + Number(r.tk642 || 0), 0),
    tk241: rows.reduce((sum: number, r: any) => sum + Number(r.tk241 || 0), 0),
    tk242: rows.reduce((sum: number, r: any) => sum + Number(r.tk242 || 0), 0),
    tk335: rows.reduce((sum: number, r: any) => sum + Number(r.tk335 || 0), 0),
  };

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[1100px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none overflow-x-auto">
      <div className="flex justify-between mb-6">
        <div className="space-y-0.5">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.unit || companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-xs">Mẫu số 06 - TSCĐ</p>
          <p className="italic text-[8px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[8px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider">BẢNG TÍNH VÀ PHÂN BỔ KHẤU HAO TSCĐ</h2>
        <p className="italic text-[10px]">Tháng {metadata?.month || (date ? format(new Date(date), 'MM') : '...')} năm {metadata?.year || (date ? format(new Date(date), 'yyyy') : '....')}</p>
        <div className="flex justify-end mt-2">
          <p className="font-bold">Số: <span className="font-normal border-b border-dotted border-black inline-block min-w-[80px] text-center">{number || '..........'}</span></p>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[8px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-6" rowSpan={3}>STT</th>
            <th className="border border-black p-1 min-w-[120px]" rowSpan={3}>Chỉ tiêu</th>
            <th className="border border-black p-1 w-16" rowSpan={3}>Tỷ lệ khấu hao (%) hoặc thời gian sử dụng</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Nơi sử dụng (Toàn DN)</th>
            <th className="border border-black p-1 text-center" colSpan={4}>TK 627 - Chi phí sản xuất chung</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 623 Chi phí sử dụng máy thi công</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 641 Chi phí bán hàng</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 642 Chi phí QLDN</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 241 XDCB dở dang</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 242 Chi phí chờ phân bổ</th>
            <th className="border border-black p-1 w-14" rowSpan={3}>TK 335 Chi phí phải trả</th>
            <th className="border border-black p-1 w-10" rowSpan={3}>...</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-0.5 w-16" rowSpan={2}>Nguyên giá TSCĐ</th>
            <th className="border border-black p-0.5 w-16" rowSpan={2}>Số khấu hao</th>
            <th className="border border-black p-0.5 w-14">Phân xưởng 1</th>
            <th className="border border-black p-0.5 w-14">Phân xưởng 2</th>
            <th className="border border-black p-0.5 w-14">Phân xưởng 3</th>
            <th className="border border-black p-0.5 w-14">Phân xưởng 4</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <th className="border border-black p-0.5">(sản phẩm)</th>
            <th className="border border-black p-0.5">(sản phẩm)</th>
            <th className="border border-black p-0.5">(sản phẩm)</th>
            <th className="border border-black p-0.5">(sản phẩm)</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
            <td className="border border-black">4</td>
            <td className="border border-black">5</td>
            <td className="border border-black">6</td>
            <td className="border border-black">7</td>
            <td className="border border-black">8</td>
            <td className="border border-black">9</td>
            <td className="border border-black">10</td>
            <td className="border border-black">11</td>
            <td className="border border-black">12</td>
            <td className="border border-black">13</td>
            <td className="border border-black">...</td>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className={`h-6 ${row.id === 'IV' ? 'font-bold bg-blue-50/20' : ''}`}>
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{row.name}</td>
              <td className="border border-black p-1 text-center">{row.rate}</td>
              <td className="border border-black p-1 text-right">{Number(row.originalCost || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.depAmount || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk627_1 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk627_2 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk627_3 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk627_4 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk623 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk641 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk642 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk241 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk242 || 0).toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{Number(row.tk335 || 0).toLocaleString()}</td>
              <td className="border border-black p-1"></td>
            </tr>
          ))}
          <tr className="font-bold h-8 bg-slate-100/50">
            <td className="border border-black p-1 text-center" colSpan={2}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{totals.originalCost.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.depAmount.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk627_1.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk627_2.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk627_3.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk627_4.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk623.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk641.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk642.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk241.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk242.toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{totals.tk335.toLocaleString()}</td>
            <td className="border border-black p-1"></td>
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
