import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PaymentRequestPreviewProps {
  voucher: any;
  companySettings: any;
}

export const PaymentRequestPreview: React.FC<PaymentRequestPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, description, items } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companySettings={companySettings}
        templateName="Mẫu số 05 - TT"
        templateInfo={[
          '(Ban hành kèm theo Thông tư số 200/2014/TT-BTC',
          'Ngày 22/12/2014 của Bộ Tài chính)'
        ]}
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">GIẤY ĐỀ NGHỊ THANH TOÁN</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-10 text-[11px]">
        <p>Kính gửi: Ban Giám đốc {companySettings?.name || '................'}</p>
        <p>Tôi tên là: <span className="font-bold uppercase">{metadata?.requesterName || '................................'}</span></p>
        <p>Bộ phận: <span className="font-bold">{metadata?.department || '................................'}</span></p>
        <p>Nội dung thanh toán: <span className="font-bold">{description || '................................................................'}</span></p>
        <p>Số tiền: <span className="font-bold">{totalAmount.toLocaleString()} đồng</span></p>
        <p>(Viết bằng chữ): <span className="italic font-bold">{metadata?.amountInWords || '................................................................'}</span></p>
        <p>Chứng từ gốc kèm theo: <span className="font-bold">{metadata?.attachments || '................'}</span></p>
      </div>

      <VoucherSignatures
        signatures={[
          { role: 'Giám đốc', subtext: '(Ký, họ tên)' },
          { role: 'Kế toán trưởng', subtext: '(Ký, họ tên)' },
          { role: 'Phụ trách bộ phận', subtext: '(Ký, họ tên)' },
          { role: 'Người đề nghị', subtext: '(Ký, họ tên)' }
        ]}
        columns={4}
      />
    </div>
  );
};
