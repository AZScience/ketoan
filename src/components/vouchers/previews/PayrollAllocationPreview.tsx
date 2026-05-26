import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface PayrollAllocationPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const PayrollAllocationPreview: React.FC<PayrollAllocationPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata } = voucher;
  const rows = metadata?.rows || [];
  const totals = rows.reduce((acc: any, row: any) => ({
    tk334Total: acc.tk334Total + (Number(row.tk334?.total) || 0),
    tk338Total: acc.tk338Total + (Number(row.tk338?.total) || 0),
    tk335Total: acc.tk335Total + (Number(row.tk335) || 0),
    total: acc.total + (Number(row.total) || 0),
  }), { tk334Total: 0, tk338Total: 0, tk335Total: 0, total: 0 });

  return (
    <div className="p-8 bg-white text-black font-serif text-[10px] leading-tight border border-slate-200 shadow-inner overflow-x-auto print:p-0 print:border-0 print:shadow-none print:max-w-none print:overflow-visible">
      <div className="min-w-[1200px] print:min-w-0 print:w-full">
        <VoucherHeader 
          companyName={companySettings?.name}
          companyAddress={companySettings?.address}
          templateCode="Mẫu số 08 - LĐTL"
          templateSource="Thông tư số 200/2014/TT-BTC"
          templateDate="Ngày 22/12/2014 của Bộ Tài chính"
        />

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">BẢNG PHÂN BỔ TIỀN LƯƠNG VÀ BẢO HIỂM XÃ HỘI</h2>
          <p className="italic text-[11px]">Tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
          <p className="mt-1 font-bold">Số: {number || '............'}</p>
        </div>

        <table className="w-full border-collapse border border-black mb-6 text-[9px]">
          <thead>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th rowSpan={2} className="border border-black p-1 w-8">STT</th>
              <th rowSpan={2} className="border border-black p-1 w-48">Đối tượng sử dụng (Ghi Nợ các TK)</th>
              <th colSpan={3} className="border border-black p-1">Ghi Có TK 334</th>
              <th colSpan={5} className="border border-black p-1">Ghi Có TK 338</th>
              <th rowSpan={2} className="border border-black p-1 w-24">Ghi Có TK 335</th>
              <th rowSpan={2} className="border border-black p-1 w-28">Tổng cộng</th>
            </tr>
            <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
              <th className="border border-black p-1 w-20">Lương</th>
              <th className="border border-black p-1 w-20">Khác</th>
              <th className="border border-black p-1 w-24">Cộng</th>
              <th className="border border-black p-1 w-16">KPCĐ</th>
              <th className="border border-black p-1 w-16">BHXH</th>
              <th className="border border-black p-1 w-16">BHYT</th>
              <th className="border border-black p-1 w-16">BHTN</th>
              <th className="border border-black p-1 w-24">Cộng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{row.stt || i + 1}</td>
                <td className="border border-black p-1 font-bold">{row.targetAccount}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk334?.salary || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk334?.other || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.tk334?.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk338?.kpcd || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk338?.bhxh || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk338?.bhyt || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk338?.bhtn || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.tk338?.total || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right">{Number(row.tk335 || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(row.total || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-100 print:bg-transparent h-10">
              <td className="border border-black p-1 text-center" colSpan={2}>Tổng cộng</td>
              <td colSpan={2} className="border border-black p-1"></td>
              <td className="border border-black p-1 text-right">{totals.tk334Total.toLocaleString()}</td>
              <td colSpan={4} className="border border-black p-1"></td>
              <td className="border border-black p-1 text-right">{totals.tk338Total.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.tk335Total.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{totals.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <VoucherSignatures 
          roles={[
            { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
            { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
            { title: 'Giám đốc', subtitle: '(Ký, họ tên, đóng dấu)', isDate: true },
          ]}
          date={date}
          gridCols={3}
        />
      </div>
    </div>
  );
};
