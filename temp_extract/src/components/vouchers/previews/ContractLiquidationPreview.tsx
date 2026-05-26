import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface ContractLiquidationPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const ContractLiquidationPreview: React.FC<ContractLiquidationPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 06 - LĐTL"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BIÊN BẢN THANH LÝ HỢP ĐỒNG GIAO KHOÁN</h2>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-10">
        <p>- Căn cứ Hợp đồng giao khoán số {metadata?.contractNumber || '............'} ngày {metadata?.contractDate || '.../.../...'}</p>
        <p>- Hôm nay, ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}, chúng tôi gồm:</p>
        
        <div className="pl-4 space-y-2">
          <p><span className="font-bold">Bên giao khoán (Bên A):</span> {metadata?.giverName || '..........................................................................................'}</p>
          <p><span className="font-bold">Bên nhận khoán (Bên B):</span> {metadata?.receiverName || '..........................................................................................'}</p>
        </div>

        <p>Hai bên cùng tiến hành thanh lý hợp đồng với các nội dung sau:</p>
        <div className="pl-4 space-y-2">
          <p>1. Nội dung công việc đã thực hiện: {metadata?.jobDone || '................................................................................'}</p>
          <p>2. Giá trị hợp đồng đã thực hiện: {Number(metadata?.contractValue || 0).toLocaleString()} đồng</p>
          <p>3. Số tiền đã thanh toán: {Number(metadata?.paidAmount || 0).toLocaleString()} đồng</p>
          <p>4. Số tiền bị phạt do vi phạm: {Number(metadata?.penaltyAmount || 0).toLocaleString()} đồng</p>
          <p>5. Số tiền còn lại phải thanh toán: {Number(metadata?.remainingAmount || 0).toLocaleString()} đồng</p>
        </div>
        <p className="font-bold">Kết luận:</p>
        <p className="pl-4 italic">{metadata?.conclusion || 'Hai bên thống nhất thanh lý hợp đồng và không còn bất kỳ khiếu nại nào khác.'}</p>
      </div>

      <VoucherSignatures 
        roles={[
          { title: 'Đại diện bên B', subtitle: '(Ký, họ tên)' },
          { title: 'Đại diện bên A', subtitle: '(Ký, họ tên, đóng dấu)' },
        ]}
        columns={2}
        date={date}
      />
    </div>
  );
};
