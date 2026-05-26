import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface OutsourcePreviewProps {
  voucher: any;
  companySettings?: any;
}

export const OutsourcePreview: React.FC<OutsourcePreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totals = rows.reduce((acc: any, row: any) => ({
    amount: acc.amount + (Number(row.amount) || 0),
    taxWithheld: acc.taxWithheld + (Number(row.taxWithheld) || 0),
    netAmount: acc.netAmount + (Number(row.netAmount) || 0),
  }), { amount: 0, taxWithheld: 0, netAmount: 0 });

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-tight border border-slate-200 shadow-inner overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:overflow-visible">
      <div className="min-w-[1000px] print:min-w-0 print:w-full">
        <VoucherHeader 
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 07 - LĐTL"
          templateSource="Thông tư số 200/2014/TT-BTC"
          templateDate="Ngày 22/12/2014 của Bộ Tài chính"
        />

        <div className="text-center mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider">BẢNG THANH TOÁN THUÊ NGOÀI</h2>
          <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="mt-1 font-bold">Số: {number || '............'}</p>
        </div>

        <div className="mb-6 space-y-1">
          <p>- Họ và tên người thuê: <span className="font-bold">{metadata?.employerName || '................................................................'}</span></p>
          <p>- Bộ phận (hoặc địa chỉ): <span className="font-bold">{metadata?.department || '................................................................'}</span></p>
          <p>- Đã thuê những công việc sau để: <span className="font-bold">{metadata?.purpose || '................................................................'}</span></p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[9px]">
          <thead>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th className="border border-black p-1 w-8">STT</th>
              <th className="border border-black p-1 w-48">Họ và tên người được thuê</th>
              <th className="border border-black p-1 w-32">CCCD/MST TNCN</th>
              <th className="border border-black p-1">Nội dung công việc</th>
              <th className="border border-black p-1 w-20">Số công/KL</th>
              <th className="border border-black p-1 w-24">Đơn giá</th>
              <th className="border border-black p-1 w-28">Thành tiền</th>
              <th className="border border-black p-1 w-24">Thuế khấu trừ</th>
              <th className="border border-black p-1 w-28">Số tiền còn lại</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{row.stt || i + 1}</td>
                <td className="border border-black p-1 font-bold">{row.fullName}</td>
                <td className="border border-black p-1 text-center">{row.idNumber}</td>
                <td className="border border-black p-1">{row.jobContent}</td>
                <td className="border border-black p-1 text-center">{row.quantity}</td>
                <td className="border border-black p-1 text-right">{Number(row.unitPrice || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.taxWithheld || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.netAmount || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 print:bg-transparent h-10">
              <td className="border border-black p-1 text-center" colSpan={6}>Tổng cộng</td>
              <td className="border border-black p-1 text-right">{totals.amount.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.taxWithheld.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.netAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <VoucherSignatures 
          roles={[
            { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
            { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
            { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)' },
            { title: 'Người duyệt', subtitle: '(Ký, họ tên)', isDate: true },
          ]}
          date={date}
        />
      </div>
    </div>
  );
};
