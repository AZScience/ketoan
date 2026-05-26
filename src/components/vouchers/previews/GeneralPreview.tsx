import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface GeneralPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const GeneralPreview: React.FC<GeneralPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, description, items, metadata } = voucher;
  const totalAmount = items?.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0) || 0;

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader
        companySettings={companySettings}
        templateName="Mẫu số 01 - L"
        templateInfo={[
          '(Ban hành kèm theo Thông tư số 200/2014/TT-BTC',
          'Ngày 22/12/2014 của Bộ Tài chính)'
        ]}
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold uppercase tracking-wider">CHỨNG TỪ KẾ TOÁN</h2>
        <p className="italic text-[11px]">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="font-bold mt-2">Số: {number || '............'}</p>
      </div>

      <div className="mb-6">
        <p><span className="font-bold">Diễn giải:</span> {description || '................................................................'}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-2 w-12">STT</th>
            <th className="border border-black p-2">Diễn giải</th>
            <th className="border border-black p-2 w-24">Tài khoản Nợ</th>
            <th className="border border-black p-2 w-24">Tài khoản Có</th>
            <th className="border border-black p-2 w-32">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-2 text-center">{i + 1}</td>
              <td className="border border-black p-2">{item.note || description}</td>
              <td className="border border-black p-2 text-center font-bold">{item.debitAccount}</td>
              <td className="border border-black p-2 text-center font-bold">{item.creditAccount}</td>
              <td className="border border-black p-2 text-right">{Number(item.amount || 0).toLocaleString()}</td>
            </tr>
          ))}
          {(!items || items.length === 0) && (
            <tr className="h-8">
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">................................</td>
              <td className="border border-black p-2 text-center">..........</td>
              <td className="border border-black p-2 text-center">..........</td>
              <td className="border border-black p-2 text-right">0</td>
            </tr>
          )}
          <tr className="font-bold h-10">
            <td className="border border-black p-2 text-center uppercase" colSpan={4}>Tổng cộng</td>
            <td className="border border-black p-2 text-right">{totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-2 mb-10">
        <p><span className="font-bold italic">Bằng chữ:</span> <span className="italic">{metadata?.amountInWords || '................................................................'}</span></p>
        <p><span className="font-bold">Kèm theo:</span> {metadata?.attachments || '..........'} chứng từ gốc.</p>
      </div>

      <VoucherSignatures
        signatures={[
          { role: 'Giám đốc', subtext: '(Ký, họ tên, đóng dấu)' },
          { role: 'Kế toán trưởng', subtext: '(Ký, họ tên)' },
          { role: 'Người lập biểu', subtext: '(Ký, họ tên)' }
        ]}
        columns={3}
      />
    </div>
  );
};
