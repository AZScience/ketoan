import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface AdvanceRequestPreviewProps {
  voucher: any;
  companySettings: any;
}

export const AdvanceRequestPreview: React.FC<AdvanceRequestPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, description, items } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
        <VoucherHeader
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 03 - TT"
          templateSource="Thông tư số 200/2014/TT-BTC"
          templateDate="Ngày 22/12/2014 của Bộ Tài chính"
        />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">GIẤY ĐỀ NGHỊ TẠM ỨNG</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-10 text-[11px]">
        <p>Kính gửi: Ban Giám đốc {companySettings?.name || '................'}</p>
        <p>Tôi tên là: <span className="font-bold uppercase">{metadata?.requesterName || '................................'}</span></p>
        <p>Bộ phận (hoặc địa chỉ): <span className="font-bold">{metadata?.department || '................................'}</span></p>
        <p>Đề nghị tạm ứng số tiền: <span className="font-bold">{totalAmount.toLocaleString()} đồng</span></p>
        <p>(Viết bằng chữ): <span className="italic font-bold">{metadata?.amountInWords || '................................................................'}</span></p>
        <p>Lý do tạm ứng: <span className="font-bold">{description || '................................................................'}</span></p>
        <p>Thời hạn thanh toán: <span className="font-bold">{metadata?.deadline || '................'}</span></p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Giám đốc', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Phụ trách bộ phận', subtitle: '(Ký, họ tên)' },
          { title: 'Người đề nghị', subtitle: '(Ký, họ tên)' }
        ]}
        gridCols={4}
        date={date}
      />
    </div>
  );
};
