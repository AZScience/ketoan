import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface ReceiptPreviewProps {
  voucher: any;
  companySettings: any;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, description, items, metadata } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  
  // Prioritize header accounts from metadata, fallback to items
  const debitAccounts = metadata?.debitAccount || items?.map((i: any) => i.debitAccount).filter(Boolean).join(', ') || '..........';
  const creditAccounts = metadata?.creditAccount || items?.map((i: any) => i.creditAccount).filter(Boolean).join(', ') || '..........';

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companySettings={companySettings}
        templateName="Mẫu số 01 - TT"
        templateInfo={[
          '(Ban hành kèm theo Thông tư số 99/2018/TT-BTC',
          'Ngày 01/11/2018 của Bộ Tài chính)'
        ]}
      />

      <div className="flex justify-between items-start mb-10">
        <div className="w-1/3"></div>
        <div className="w-1/3 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider">PHIẾU THU</h2>
          <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        </div>
        <div className="w-1/3 text-right space-y-1">
          <p className="font-bold">Số: {number || '............'}</p>
          <p>Nợ: {debitAccounts}</p>
          <p>Có: {creditAccounts}</p>
        </div>
      </div>

      <div className="space-y-3 mb-10">
        <p><span className="font-bold">Họ và tên người nộp tiền:</span> {metadata?.payerName || '................................................................'}</p>
        <p><span className="font-bold">Địa chỉ:</span> {metadata?.payerAddress || '................................................................'}</p>
        <p><span className="font-bold">Lý do nộp:</span> {description || '................................................................'}</p>
        <p><span className="font-bold">Số tiền:</span> <span className="text-sm font-bold">{totalAmount.toLocaleString()} VNĐ</span></p>
        <p><span className="font-bold italic">(Viết bằng chữ):</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
        <p><span className="font-bold">Số chứng từ gốc:</span> {metadata?.attachments || '..........'}</p>
      </div>

      <VoucherSignatures
        signatures={[
          { role: 'Giám đốc', subtext: '(Ký, họ tên, đóng dấu)' },
          { role: 'Kế toán trưởng', subtext: '(Ký, họ tên)' },
          { role: 'Người lập biểu', subtext: '(Ký, họ tên)' },
          { role: 'Người nộp tiền', subtext: '(Ký, họ tên)' },
          { role: 'Thủ quỹ', subtext: '(Ký, họ tên)' }
        ]}
        columns={5}
      />

      <div className="mt-10 pt-4 border-t border-dashed border-black italic">
        <p>Đã nhận đủ số tiền (viết bằng chữ): ....................................................................................................................................</p>
      </div>
    </div>
  );
};
