import React from 'react';
import { format } from 'date-fns';
import { VoucherSignatures } from './VoucherSignatures';

interface PaymentListPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const PaymentListPreview: React.FC<PaymentListPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, description, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totalAmount = (rows || []).reduce((sum: number, row: any) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <div className="flex justify-between mb-8">
        <div className="space-y-1">
          <p className="font-bold">Đơn vị: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{companySettings?.name || '................'}</span></p>
          <p className="font-bold">Bộ phận: <span className="font-normal border-b border-dotted border-black inline-block min-w-[150px]">{metadata?.department || '................'}</span></p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm">Mẫu số 09 - TT</p>
          <p className="italic text-[10px] leading-tight">(Kèm theo Thông tư số 99/2025/TT-BTC</p>
          <p className="italic text-[10px] leading-tight">ngày 27 tháng 10 năm 2025 của Bộ trưởng Bộ Tài chính)</p>
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BẢNG KÊ CHI TIỀN</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
      </div>

      <div className="mb-6 space-y-2">
        <p><span className="font-bold">Họ và tên người chi:</span> {metadata?.payerName || '................................................................'}</p>
        <p><span className="font-bold">Bộ phận (hoặc địa chỉ):</span> {metadata?.payerAddress || '................................................................'}</p>
        <p><span className="font-bold">Chi cho công việc:</span> {metadata?.purpose || description || '................................................................'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12" rowSpan={2}>STT</th>
            <th className="border border-black p-2" colSpan={2}>Chứng từ</th>
            <th className="border border-black p-2" rowSpan={2}>Nội dung chi</th>
            <th className="border border-black p-2 w-32" rowSpan={2}>Số tiền</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-24">Số hiệu</th>
            <th className="border border-black p-1 w-24">Ngày, tháng</th>
          </tr>
          <tr className="text-[10px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2 text-center">{row.voucherNumber}</td>
              <td className="border border-black p-2 text-center">{row.voucherDate}</td>
              <td className="border border-black p-2">{row.description}</td>
              <td className="border border-black p-2 text-right">{Number(row.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold h-10">
            <td className="border border-black p-2 text-center uppercase" colSpan={4}>Cộng</td>
            <td className="border border-black p-2 text-right">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-2 mb-10">
        <p><span className="font-bold">Số tiền bằng chữ:</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
        <p>(Kèm theo <span className="border-b border-dotted border-black px-4">{metadata?.originalVouchers || '....'}</span> chứng từ gốc).</p>
      </div>

      <VoucherSignatures 
        roles={[
          { title: 'Người lập bảng kê', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Người duyệt', subtitle: '(Ký, họ tên)' },
        ]}
        gridCols={3}
      />
    </div>
  );
};
