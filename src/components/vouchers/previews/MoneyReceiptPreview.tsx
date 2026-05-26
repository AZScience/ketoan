import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface MoneyReceiptPreviewProps {
  voucher: any;
  companySettings: any;
}

export const MoneyReceiptPreview: React.FC<MoneyReceiptPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, description, items, metadata } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  const debitAccounts = items?.map((i: any) => i.debitAccount).filter(Boolean).join(', ') || '..........';
  const creditAccounts = items?.map((i: any) => i.creditAccount).filter(Boolean).join(', ') || '..........';

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 01 - TT"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="flex justify-between items-start mb-10">
        <div className="w-1/3"></div>
        <div className="w-1/3 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider">GIẤY BÁO CÓ</h2>
          <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        </div>
        <div className="w-1/3 text-right space-y-1">
          <p className="font-bold">Số: {number || '............'}</p>
          <p>Nợ: {debitAccounts}</p>
          <p>Có: {creditAccounts}</p>
        </div>
      </div>

      <div className="space-y-3 mb-10">
        <p><span className="font-bold">Đơn vị trả tiền:</span> {metadata?.payerName || '................................................................'}</p>
        <p><span className="font-bold">Tại ngân hàng:</span> {metadata?.bankName || '................................................................'}</p>
        <p><span className="font-bold">Nội dung:</span> {description || '................................................................'}</p>
        <p><span className="font-bold">Số tiền:</span> <span className="text-sm font-bold">{totalAmount.toLocaleString()} VNĐ</span></p>
        <p><span className="font-bold italic">(Viết bằng chữ):</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)' }
        ]}
        gridCols={2}
        date={date}
      />
    </div>
  );
};
