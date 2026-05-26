import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface InventoryInspectionPreviewProps {
  voucher: any;
  companySettings: any;
}

export const InventoryInspectionPreview: React.FC<InventoryInspectionPreviewProps> = ({ voucher, companySettings }) => {
  const { number, date, metadata, items = [] } = voucher;
  const committee = metadata?.committee || [];
  const inventoryTime = metadata?.inventoryTime ? new Date(metadata.inventoryTime) : null;

  return (
    <div className="p-12 bg-white text-black font-serif text-[10px] leading-relaxed border border-slate-200 shadow-inner max-w-[900px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode="Mẫu số 05 - VT"
        templateSource="Thông tư số 99/2025/TT-BTC"
        templateDate="Ngày 27/10/2025 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider">BIÊN BẢN KIỂM KÊ<br/>VẬT TƯ, CÔNG CỤ, SẢN PHẨM, HÀNG HÓA</h2>
        <p className="italic text-[11px] mt-1">Ngày {date ? format(new Date(date), 'dd') : '...'} tháng {date ? format(new Date(date), 'MM') : '...'} năm {date ? format(new Date(date), 'yyyy') : '...'}</p>
        <p className="mt-1">Số: <span className="font-bold">{number || '............'}</span></p>
      </div>

      <div className="space-y-2 mb-6">
        <p>- Thời điểm kiểm kê <span className="font-bold">{inventoryTime ? format(inventoryTime, 'HH') : '...'}</span> giờ <span className="font-bold">{inventoryTime ? format(inventoryTime, 'mm') : '...'}</span> ngày <span className="font-bold">{inventoryTime ? format(inventoryTime, 'dd') : '...'}</span> tháng <span className="font-bold">{inventoryTime ? format(inventoryTime, 'MM') : '...'}</span> năm <span className="font-bold">{inventoryTime ? format(inventoryTime, 'yyyy') : '...'}</span></p>
        <p>Ban kiểm kê gồm:</p>
        <div className="pl-4 space-y-1">
          {committee.map((member: any, i: number) => (
            <p key={i}>- Ông/Bà: <span className="font-bold">{member.name || '................'}</span> Chức vụ <span className="font-bold">{member.role || '................'}</span> Đại diện <span className="font-bold">{member.representative || '................'}</span> {member.title}</p>
          ))}
        </div>
        <p>Đã kiểm kê các loại: <span className="font-bold">{metadata?.materialType || '................'}</span> tại kho <span className="font-bold">{metadata?.warehouse || '................'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[8px]">
        <thead>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-8" rowSpan={2}>STT</th>
            <th className="border border-black p-1" rowSpan={2}>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hóa</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Mã số</th>
            <th className="border border-black p-1 w-12" rowSpan={2}>Đơn vị tính</th>
            <th className="border border-black p-1 w-16" rowSpan={2}>Đơn giá</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Theo sổ kế toán</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Theo kiểm kê</th>
            <th className="border border-black p-1 text-center" colSpan={2}>Chênh lệch</th>
          </tr>
          <tr className="font-bold text-center bg-slate-50 print:bg-transparent">
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
            <th className="border border-black p-1 w-14">Số lượng</th>
            <th className="border border-black p-1 w-14">Thành tiền</th>
            <th className="border border-black p-1 w-14">Thừa</th>
            <th className="border border-black p-1 w-14">Thiếu</th>
          </tr>
          <tr className="text-[7px] text-center italic">
            <td className="border border-black">A</td>
            <td className="border border-black">B</td>
            <td className="border border-black">C</td>
            <td className="border border-black">D</td>
            <td className="border border-black">1</td>
            <td className="border border-black">2</td>
            <td className="border border-black">3</td>
            <td className="border border-black">4</td>
            <td className="border border-black">5</td>
            <td className="border border-black">6</td>
            <td className="border border-black">7</td>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => {
            const diffAmount = Number(item.actualAmount || 0) - Number(item.bookAmount || 0);
            return (
              <tr key={i} className="h-8">
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{item.name}</td>
                <td className="border border-black p-1 text-center">{item.code}</td>
                <td className="border border-black p-1 text-center">{item.unit}</td>
                <td className="border border-black p-1 text-right">{Number(item.price || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center">{item.bookQty}</td>
                <td className="border border-black p-1 text-right">{Number(item.bookAmount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-center font-bold">{item.actualQty || item.quantity}</td>
                <td className="border border-black p-1 text-right font-bold">{Number(item.actualAmount || item.amount || 0).toLocaleString()}</td>
                <td className="border border-black p-1 text-right text-green-700">{diffAmount > 0 ? diffAmount.toLocaleString() : ''}</td>
                <td className="border border-black p-1 text-right text-red-700">{diffAmount < 0 ? Math.abs(diffAmount).toLocaleString() : ''}</td>
              </tr>
            );
          })}
          <tr className="font-bold h-10">
            <td className="border border-black p-1 text-center" colSpan={5}>Cộng</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.bookAmount || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-center">X</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => sum + Number(item.actualAmount || item.amount || 0), 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => {
              const diff = Number(item.actualAmount || 0) - Number(item.bookAmount || 0);
              return sum + (diff > 0 ? diff : 0);
            }, 0).toLocaleString()}</td>
            <td className="border border-black p-1 text-right">{items.reduce((sum: number, item: any) => {
              const diff = Number(item.actualAmount || 0) - Number(item.bookAmount || 0);
              return sum + (diff < 0 ? Math.abs(diff) : 0);
            }, 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <VoucherSignatures
        roles={[
          { title: 'Người lập biểu', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ kho', subtitle: '(Ký, họ tên)' },
          { title: 'Trưởng Ban kiểm kê', subtitle: '(Ký, họ tên)' },
        ]}
        date={date}
      />

      <div className="italic text-[9px] leading-relaxed pt-4 border-t border-slate-100 mt-8">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
