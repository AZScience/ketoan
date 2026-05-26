import React from 'react';
import { format } from 'date-fns';
import { VoucherHeader } from './VoucherHeader';
import { VoucherSignatures } from './VoucherSignatures';

interface FundInventoryPreviewProps {
  voucher: any;
  companySettings?: any;
}

export const FundInventoryPreview: React.FC<FundInventoryPreviewProps> = ({ voucher, companySettings }) => {
  const { type, number, date, metadata } = voucher;
  const isForeign = type === 'FundInventoryForeign';
  const rows = metadata?.rows || [];
  const totals = (rows || []).reduce((acc: any, row: any) => ({
    amount: acc.amount + (Number(row.amount) || 0),
  }), { amount: 0 });

  return (
    <div className="p-12 bg-white text-black font-serif text-xs leading-relaxed border border-slate-200 shadow-inner max-w-[800px] mx-auto print:p-0 print:border-0 print:shadow-none print:max-w-none">
      <VoucherHeader 
        companyName={companySettings?.name}
        companyAddress={companySettings?.address}
        templateCode={isForeign ? 'Mẫu số 08b - TT' : 'Mẫu số 08a - TT'}
        templateSource="Thông tư số 99/2025/TT-BTC"
        templateDate="Ngày 27/10/2025 của Bộ Tài chính"
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider">BẢNG KIỂM KÊ QUỸ</h2>
        <p className="italic">(Dùng cho {isForeign ? 'ngoại tệ, vàng tiền tệ' : 'VNĐ'})</p>
        <div className="flex justify-end mt-2">
          <p>Số: <span className="border-b border-dotted border-black inline-block min-w-[150px] text-center">{metadata?.voucherNumber || number || '....................'}</span></p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <p className="italic">Hôm nay, vào <span className="border-b border-dotted border-black inline-block min-w-[30px] text-center">{metadata?.hour || '.....'}</span> giờ <span className="border-b border-dotted border-black inline-block min-w-[30px] text-center">{metadata?.minute || '.....'}</span> ngày <span className="border-b border-dotted border-black inline-block min-w-[30px] text-center">{date ? format(new Date(date), 'dd') : '....'}</span> tháng <span className="border-b border-dotted border-black inline-block min-w-[30px] text-center">{date ? format(new Date(date), 'MM') : '....'}</span> năm <span className="border-b border-dotted border-black inline-block min-w-[50px] text-center">{date ? format(new Date(date), 'yyyy') : '.....'}</span></p>
        <p>Chúng tôi gồm:</p>
        <div className="space-y-1">
          {metadata?.committee ? (
            metadata.committee.map((member: any, idx: number) => (
              <p key={idx}>- Ông/Bà: <span className="border-b border-dotted border-black inline-block min-w-[400px]">{member.name || '................................................................'}</span> đại diện {member.role || '...........'}</p>
            ))
          ) : (
            <>
              <p>- Ông/Bà: <span className="border-b border-dotted border-black inline-block min-w-[400px]">................................................................</span> đại diện kế toán</p>
              <p>- Ông/Bà: <span className="border-b border-dotted border-black inline-block min-w-[400px]">................................................................</span> đại diện thủ quỹ</p>
              <p>- Ông/Bà: <span className="border-b border-dotted border-black inline-block min-w-[400px]">................................................................</span> đại diện ...........</p>
            </>
          )}
        </div>
        <p>Cùng tiến hành kiểm kê quỹ {isForeign ? 'ngoại tệ, vàng bạc ...' : 'tiền mặt'} kết quả như sau:</p>
      </div>

      <table className="w-full border-collapse border border-black mb-6 text-[11px]">
        <thead>
          <tr className="font-bold text-center">
            <th className="border border-black p-2 w-12" rowSpan={isForeign ? 2 : 1}>STT</th>
            <th className="border border-black p-2" rowSpan={isForeign ? 2 : 1}>Diễn giải</th>
            {isForeign ? (
              <>
                <th className="border border-black p-2 w-20" rowSpan={2}>Đơn vị tính</th>
                <th className="border border-black p-2 w-20" rowSpan={2}>Số lượng</th>
                <th className="border border-black p-2 w-24" rowSpan={2}>Đơn giá</th>
                <th className="border border-black p-2" colSpan={2}>Tính ra VNĐ</th>
                <th className="border border-black p-2 w-24" rowSpan={2}>Ghi chú</th>
              </>
            ) : (
              <>
                <th className="border border-black p-2 w-32">Số lượng(tờ)</th>
                <th className="border border-black p-2 w-40">Số tiền</th>
              </>
            )}
          </tr>
          {isForeign && (
            <tr className="font-bold text-center">
              <th className="border border-black p-2 w-24">Tỷ giá</th>
              <th className="border border-black p-2 w-32">VNĐ</th>
            </tr>
          )}
          <tr className="text-[10px] text-center italic">
            <th className="border border-black p-1">A</th>
            <th className="border border-black p-1">B</th>
            {isForeign ? (
              <>
                <th className="border border-black p-1">C</th>
                <th className="border border-black p-1">1</th>
                <th className="border border-black p-1">2</th>
                <th className="border border-black p-1">3</th>
                <th className="border border-black p-1">4</th>
                <th className="border border-black p-1">5</th>
              </>
            ) : (
              <>
                <th className="border border-black p-1">1</th>
                <th className="border border-black p-1">2</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">I</td>
            <td className="border border-black p-2 font-bold">Số dư theo sổ quỹ:</td>
            {isForeign ? (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2 text-right">{metadata?.bookBalance ? Number(metadata.bookBalance).toLocaleString() : '....................'}</td>
                <td className="border border-black p-2"></td>
              </>
            ) : (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-right">{metadata?.bookBalance ? Number(metadata.bookBalance).toLocaleString() : '....................'}</td>
              </>
            )}
          </tr>
          <tr className="h-8">
            <td className="border border-black p-2 text-center">II</td>
            <td className="border border-black p-2 font-bold">Số kiểm kê thực tế {isForeign ? '(*)' : ''}:</td>
            {isForeign ? (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2 text-right">{totals.amount > 0 ? totals.amount.toLocaleString() : '....................'}</td>
                <td className="border border-black p-2"></td>
              </>
            ) : (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-right">{totals.amount > 0 ? totals.amount.toLocaleString() : '....................'}</td>
              </>
            )}
          </tr>
          {Array.from({ length: 5 }).map((_, i) => {
            const row = rows[i] || {};
            return (
              <tr key={i} className="h-8">
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2 pl-8">
                  {i === 0 ? 'Trong đó: - Loại' : '- Loại'} {row.denomination || '................'}
                </td>
                {isForeign ? (
                  <>
                    <td className="border border-black p-2 text-center">{row.unit || '..........'}</td>
                    <td className="border border-black p-2 text-center">{row.quantity || '..........'}</td>
                    <td className="border border-black p-2 text-right">{row.price ? Number(row.price).toLocaleString() : '..........'}</td>
                    <td className="border border-black p-2 text-right">{row.exchangeRate ? Number(row.exchangeRate).toLocaleString() : '..........'}</td>
                    <td className="border border-black p-2 text-right">{row.amount ? Number(row.amount).toLocaleString() : '..........'}</td>
                    <td className="border border-black p-2">{row.note || ''}</td>
                  </>
                ) : (
                  <>
                    <td className="border border-black p-2 text-center">{row.quantity || '................'}</td>
                    <td className="border border-black p-2 text-right">{row.amount ? Number(row.amount).toLocaleString() : '................'}</td>
                  </>
                )}
              </tr>
            );
          })}
          <tr className="h-8 font-bold">
            <td className="border border-black p-2 text-center">III</td>
            <td className="border border-black p-2">Chênh lệch (III = I - II):</td>
            {isForeign ? (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2 text-right">
                  {metadata?.bookBalance !== undefined && totals.amount !== undefined ? 
                    (Number(metadata.bookBalance) - totals.amount).toLocaleString() : 
                    (metadata?.difference ? Number(metadata.difference).toLocaleString() : '....................')}
                </td>
                <td className="border border-black p-2"></td>
              </>
            ) : (
              <>
                <td className="border border-black p-2 text-center">x</td>
                <td className="border border-black p-2 text-right">
                  {metadata?.bookBalance !== undefined && totals.amount !== undefined ? 
                    (Number(metadata.bookBalance) - totals.amount).toLocaleString() : 
                    (metadata?.difference ? Number(metadata.difference).toLocaleString() : '....................')}
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>

      <div className="space-y-1 mb-10">
        <div className="flex">
          <p className="whitespace-nowrap">- Lý do: + Thừa:</p>
          <span className="border-b border-dotted border-black flex-grow ml-2">{metadata?.surplusReason || ''}</span>
        </div>
        <div className="flex">
          <p className="whitespace-nowrap pl-12">+ Thiếu:</p>
          <span className="border-b border-dotted border-black flex-grow ml-2">{metadata?.shortageReason || metadata?.deficitReason || ''}</span>
        </div>
        <div className="flex mt-2">
          <p className="whitespace-nowrap">- Kết luận sau khi kiểm kê quỹ:</p>
          <span className="border-b border-dotted border-black flex-grow ml-2">{metadata?.conclusion || ''}</span>
        </div>
      </div>

      <VoucherSignatures 
        roles={isForeign ? [
          { title: 'Thủ quỹ', subtitle: '(Ký, họ tên)' },
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Người chịu trách nhiệm kiểm kê quỹ', subtitle: '(Ký, họ tên)' },
        ] : [
          { title: 'Kế toán trưởng', subtitle: '(Ký, họ tên)' },
          { title: 'Thủ quỹ', subtitle: '(Ký, họ tên)' },
          { title: 'Người chịu trách nhiệm kiểm kê quỹ', subtitle: '(Ký, họ tên)' },
        ]}
        columns={3}
        date={date}
      />

      <div className="italic text-[10px] leading-relaxed pt-4">
        <p><span className="font-bold">Ghi chú:</span> Tùy theo đặc điểm hoạt động sản xuất kinh doanh và yêu cầu quản lý của đơn vị mình, doanh nghiệp được xây dựng, thiết kế biểu mẫu chứng từ kế toán.</p>
      </div>
    </div>
  );
};
