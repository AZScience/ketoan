import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface ContractPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 05 - LĐTL"
        templateSource="Thông tư số 200/2014/TT-BTC"
        templateDate="Ngày 22/12/2014 của Bộ Tài chính"
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">HỢP ĐỒNG GIAO KHOÁN</h2>
        <p className="mt-1 font-bold">Số: {number || '............'}</p>
      </div>

      <div className="space-y-4 mb-10">
        <p>- Căn cứ vào .................................................................................................................................................</p>
        <p>- Hôm nay, ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}, chúng tôi gồm:</p>
        
        <div className="pl-4 space-y-2">
          <p><span className="font-bold">Bên giao khoán (Bên A):</span> {metadata?.giverName || '..........................................................................................'}</p>
          <p>Đại diện là: {metadata?.giverName || '................................................................'} Chức vụ: {metadata?.giverPosition || '................................'}</p>
          
          <p><span className="font-bold">Bên nhận khoán (Bên B):</span> {metadata?.receiverName || '..........................................................................................'}</p>
          <p>Đại diện là: {metadata?.receiverName || '................................................................'} Chức vụ: {metadata?.receiverPosition || '................................'}</p>
        </div>

        <p>Hai bên thống nhất ký kết hợp đồng giao khoán với các điều khoản sau:</p>
        
        <div className="space-y-4">
          <div>
            <p className="font-bold uppercase">I- ĐIỀU KHOẢN CHUNG</p>
            <div className="pl-4 space-y-1">
              <p>- Phương thức giao khoán: {metadata?.method || '................................................................'}</p>
              <p>- Điều kiện thực hiện: {metadata?.conditions || '................................................................'}</p>
              <p>- Thời gian thực hiện: {metadata?.duration || '................................................................'}</p>
              <p>- Các điều kiện khác: {metadata?.otherTerms || '................................................................'}</p>
            </div>
          </div>

          <div>
            <p className="font-bold uppercase">II- ĐIỀU KHOẢN CỤ THỂ</p>
            <div className="pl-4 space-y-2">
              <p><span className="font-bold">1. Nội dung công việc khoán:</span> {metadata?.jobContent || '................................................................'}</p>
              <p><span className="font-bold">2. Trách nhiệm, quyền lợi và nghĩa vụ của người nhận khoán:</span> {metadata?.receiverRights || '................................................................'}</p>
              <p><span className="font-bold">3. Trách nhiệm, quyền lợi và nghĩa vụ của bên giao khoán:</span> {metadata?.giverRights || '................................................................'}</p>
            </div>
          </div>
        </div>
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
