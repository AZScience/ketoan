import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface MaterialInspectionPreviewProps {
  voucher: any;
  companySettings: any;
}

export const MaterialInspectionPreview: React.FC<MaterialInspectionPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items = [] } = voucher;
  const committee = metadata?.committee || [];

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 03 - VT"
        templateSource="Thông tư số 99/2025/TT-BTC"
        templateDate="Ngày 27/10/2025 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">BIÊN BẢN KIỂM NGHIỆM<br/>VẬT TƯ, CÔNG CỤ, SẢN PHẨM, HÀNG HÓA</h2>
        <p className="italic text-[11px] mt-1">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1">Số: <span className="font-bold">{number || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Căn cứ <span className="font-bold">{metadata?.basis || '................'}</span> số <span className="font-bold">{metadata?.basisNo || '............'}</span> ngày <span className="font-bold">{metadata?.basisDate ? format(new Date(metadata.basisDate), 'dd/MM/yyyy') : '.../.../...'}</span> của <span className="font-bold">{metadata?.basisBy || '................'}</span></p>
        <p>Ban kiểm nghiệm gồm:</p>
        <div className="pl-4 space-y-1">
          {committee.map((member: any, i: number) => (
            <p key={i}>- Ông/Bà: <span className="font-bold">{member.name || '................'}</span> Chức vụ <span className="font-bold">{member.role || '................'}</span> Đại diện <span className="font-bold">{member.representative || '................'}</span> {member.title}</p>
          ))}
        </div>
        <p>Đã kiểm nghiệm các loại: <span className="font-bold">{metadata?.materialType || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[8px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-8" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Số lượng</th>
            <th className="border border-black p-1" rowSpan={2}>Kết quả kiểm nghiệm (đúng quy cách, phẩm chất, hay sai quy cách, phẩm chất, ...)</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-14">Theo chứng từ</th>
            <th className="border border-black p-1 w-14">Thực nhập (kiểm nghiệm)</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="h-8">
              <td className="border border-black p-1 text-center">{i + 1}</td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.code}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-center">{item.documentQty}</td>
              <td className="border border-black p-1 text-center font-bold">{item.actualQty || item.quantity}</td>
              <td className="border border-black p-1">{item.result}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 mb-10">
        <p><span className="font-bold">Ý kiến của Ban kiểm nghiệm:</span> {metadata?.committeeOpinion || '................................................................................................'}</p>
      </div>

      <VoucherSignatures
        roles={[
          { title: 'Đại diện bên giao', subtitle: '(Ký, họ tên)' },
          { title: 'Ủy viên', subtitle: '(Ký, họ tên)' },
          { title: 'Trưởng Ban kiểm nghiệm', subtitle: '(Ký, họ tên)' },
        ]}
        date={date}
      />

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100 mt-8">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
