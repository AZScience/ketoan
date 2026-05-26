import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface AdvanceSettlementPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AdvanceSettlementPreview: React.FC<AdvanceSettlementPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 04 - TT"
        templateSource="Thông tư số 99/2018/TT-BTC"
        templateDate="Ngày 01/11/2018 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">GIẤY THANH TOÁN TIỀN TẠM ỨNG</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-6 text-[11px]">
        <p>- Họ tên người thanh toán: <span className="font-bold uppercase">{metadata?.requesterName || '................................'}</span></p>
        <p>- Bộ phận: <span className="font-bold">{metadata?.department || '................................'}</span></p>
        <p>- Số tiền tạm ứng được thanh toán theo bảng dưới đây:</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2">Nội dung</th>
            <th className="border border-black p-2 w-32">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">1</td>
            <td className="border border-black p-2">Số tiền tạm ứng chưa chi hết kỳ trước chuyển sang</td>
            <td className="border border-black p-2 text-right">{Number(metadata?.previousBalance || 0).toLocaleString()}</td>
          </tr>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">2</td>
            <td className="border border-black p-2">Số tiền tạm ứng kỳ này</td>
            <td className="border border-black p-2 text-right">{Number(metadata?.currentAdvance || 0).toLocaleString()}</td>
          </tr>
          <tr className="h-8 font-bold">
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center uppercase">Cộng (1+2)</td>
            <td className="border border-black p-2 text-right">{(Number(metadata?.previousBalance || 0) + Number(metadata?.currentAdvance || 0)).toLocaleString()}</td>
          </tr>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">3</td>
            <td className="border border-black p-2">Số tiền đã chi</td>
            <td className="border border-black p-2 text-right">{Number(metadata?.spentAmount || 0).toLocaleString()}</td>
          </tr>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">4</td>
            <td className="border border-black p-2">Số tiền tạm ứng chưa chi hết (1+2-3)</td>
            <td className="border border-black p-2 text-right">{Math.max(0, (Number(metadata?.previousBalance || 0) + Number(metadata?.currentAdvance || 0) - Number(metadata?.spentAmount || 0))).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người duyệt', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Người thanh toán', subtitle: '(Ký, họ tên)' }
        ]}
        gridCols={3}
        date={date}
      />
    </div>
  );
};
