import React from 'react';
import { Voucher, OpeningBalance } from '../../types/accounting';
import { format } from 'date-fns';

interface CashFlowStatementProps {
  vouchers: Voucher[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
  method: 'direct' | 'indirect';
}

export const CashFlowStatement: React.FC<CashFlowStatementProps> = ({ vouchers, openingBalances, workingYear, filters, method }) => {
  const formatCurrency = (val: number) => {
    if (val === 0 || isNaN(val)) return '-';
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
    return val < 0 ? `(${formatted})` : formatted;
  };

  const cashAccounts = ['111', '112'];

  const getOpeningCash = () => {
    let openingCash = 0;
    openingBalances.forEach(ob => {
      if (cashAccounts.some(acc => ob.accountCode.startsWith(acc))) {
        openingCash += (ob.debit || 0) - (ob.credit || 0);
      }
    });
    return openingCash;
  };

  const calculateDirectFlow = (code: string): number => {
    let amount = 0;
    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          const isCashIn = cashAccounts.some(acc => item.debitAccount?.startsWith(acc));
          const isCashOut = cashAccounts.some(acc => item.creditAccount?.startsWith(acc));
          
          if (isCashIn) {
            const cp = item.creditAccount;
            if (code === '01' && (cp?.startsWith('511') || cp?.startsWith('131'))) amount += item.amount;
            if (code === '06' && !(cp?.startsWith('511') || cp?.startsWith('131') || cp?.startsWith('515') || cp?.startsWith('711'))) amount += item.amount;
            if (code === '22' && cp?.startsWith('711')) amount += item.amount;
            if (code === '24' && cp?.startsWith('128')) amount += item.amount;
            if (code === '26' && (cp?.startsWith('221') || cp?.startsWith('222') || cp?.startsWith('228'))) amount += item.amount;
            if (code === '27' && cp?.startsWith('515')) amount += item.amount;
            if (code === '31' && cp?.startsWith('411')) amount += item.amount;
            if (code === '33' && cp?.startsWith('341')) amount += item.amount;
          }
          
          if (isCashOut) {
            const cp = item.debitAccount;
            if (code === '02' && (cp?.startsWith('15') || cp?.startsWith('331'))) amount -= item.amount;
            if (code === '03' && cp?.startsWith('334')) amount -= item.amount;
            if (code === '04' && cp?.startsWith('6351')) amount -= item.amount;
            if (code === '05' && cp?.startsWith('3334')) amount -= item.amount;
            if (code === '07' && !(cp?.startsWith('15') || cp?.startsWith('331') || cp?.startsWith('334') || cp?.startsWith('635') || cp?.startsWith('3334') || cp?.startsWith('211') || cp?.startsWith('213'))) amount -= item.amount;
            if (code === '21' && (cp?.startsWith('211') || cp?.startsWith('213'))) amount -= item.amount;
            if (code === '23' && cp?.startsWith('128')) amount -= item.amount;
            if (code === '25' && (cp?.startsWith('221') || cp?.startsWith('222') || cp?.startsWith('228'))) amount -= item.amount;
            if (code === '32' && cp?.startsWith('411')) amount -= item.amount;
            if (code === '34' && cp?.startsWith('341')) amount -= item.amount;
            if (code === '36' && cp?.startsWith('421')) amount -= item.amount;
          }
        });
      }
    });
    return amount;
  };

  const getRowValue = (code: string): number => {
    if (method === 'direct') {
      switch (code) {
        case '01': case '02': case '03': case '04': case '05': case '06': case '07':
        case '21': case '22': case '23': case '24': case '25': case '26': case '27':
        case '31': case '32': case '33': case '34': case '35': case '36':
          return calculateDirectFlow(code);
        case '20': return getRowValue('01') + getRowValue('02') + getRowValue('03') + getRowValue('04') + getRowValue('05') + getRowValue('06') + getRowValue('07');
        case '30': return getRowValue('21') + getRowValue('22') + getRowValue('23') + getRowValue('24') + getRowValue('25') + getRowValue('26') + getRowValue('27');
        case '40': return getRowValue('31') + getRowValue('32') + getRowValue('33') + getRowValue('34') + getRowValue('35') + getRowValue('36');
        case '50': return getRowValue('20') + getRowValue('30') + getRowValue('40');
        case '60': return getOpeningCash();
        case '61': return 0;
        case '70': return getRowValue('50') + getRowValue('60') + getRowValue('61');
        default: return 0;
      }
    } else {
      // Indirect method simplified for now
      switch (code) {
        case '01': return 0; // Lợi nhuận trước thuế
        case '20': return calculateDirectFlow('20'); // Simplified
        case '30': return calculateDirectFlow('30');
        case '40': return calculateDirectFlow('40');
        case '50': return getRowValue('20') + getRowValue('30') + getRowValue('40');
        case '60': return getOpeningCash();
        case '61': return 0;
        case '70': return getRowValue('50') + getRowValue('60') + getRowValue('61');
        default: return 0;
      }
    }
  };

  const directItems = [
    { label: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', code: '20', isHeader: true, level: 0 },
    { label: '1. Tiền thu từ bán hàng, cung cấp dịch vụ và doanh thu khác', code: '01', level: 1 },
    { label: '2. Tiền chi trả cho người cung cấp hàng hóa và dịch vụ', code: '02', level: 1 },
    { label: '3. Tiền chi trả cho người lao động', code: '03', level: 1 },
    { label: '4. Tiền lãi vay đã trả', code: '04', level: 1 },
    { label: '5. Thuế thu nhập doanh nghiệp đã nộp', code: '05', level: 1 },
    { label: '6. Tiền thu khác từ hoạt động kinh doanh', code: '06', level: 1 },
    { label: '7. Tiền chi khác cho hoạt động kinh doanh', code: '07', level: 1 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', code: '20', isTotal: true, level: 0 },
    { label: 'II. Lưu chuyển tiền từ hoạt động đầu tư', code: '30', isHeader: true, level: 0 },
    { label: '1. Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác', code: '21', level: 1 },
    { label: '2. Tiền thu từ thanh lý, nhượng bán TSCĐ và các tài sản dài hạn khác', code: '22', level: 1 },
    { label: '3. Tiền chi cho vay, mua các công cụ nợ của đơn vị khác', code: '23', level: 1 },
    { label: '4. Tiền thu hồi cho vay, bán lại các công cụ nợ của đơn vị khác', code: '24', level: 1 },
    { label: '5. Tiền chi đầu tư góp vốn vào đơn vị khác', code: '25', level: 1 },
    { label: '6. Tiền thu hồi đầu tư góp vốn vào đơn vị khác', code: '26', level: 1 },
    { label: '7. Tiền thu lãi cho vay, cổ tức và lợi nhuận được chia', code: '27', level: 1 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động đầu tư', code: '30', isTotal: true, level: 0 },
    { label: 'III. Lưu chuyển tiền từ hoạt động tài chính', code: '40', isHeader: true, level: 0 },
    { label: '1. Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu', code: '31', level: 1 },
    { label: '2. Tiền trả lại vốn góp cho các chủ sở hữu, mua lại cổ phiếu của doanh nghiệp đã phát hành', code: '32', level: 1 },
    { label: '3. Tiền thu từ đi vay', code: '33', level: 1 },
    { label: '4. Tiền trả nợ gốc vay', code: '34', level: 1 },
    { label: '5. Tiền trả nợ thuê tài chính', code: '35', level: 1 },
    { label: '6. Cổ tức, lợi nhuận đã trả cho chủ sở hữu', code: '36', level: 1 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động tài chính', code: '40', isTotal: true, level: 0 },
    { label: 'Lưu chuyển tiền thuần trong kỳ (50 = 20 + 30 + 40)', code: '50', isTotal: true, level: 0 },
    { label: 'Tiền và tương đương tiền đầu kỳ', code: '60', level: 0 },
    { label: 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ', code: '61', level: 0 },
    { label: 'Tiền và tương đương tiền cuối kỳ (70 = 50 + 60 + 61)', code: '70', isTotal: true, level: 0 },
  ];

  const indirectItems = [
    { label: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', code: '20', isHeader: true, level: 0 },
    { label: '1. Lợi nhuận trước thuế', code: '01', level: 1 },
    { label: '2. Điều chỉnh cho các khoản', code: '02', isHeader: true, level: 1 },
    { label: ' - Khấu hao TSCĐ và BĐSĐT', code: '02', level: 2 },
    { label: ' - Các khoản dự phòng', code: '03', level: 2 },
    { label: ' - Lãi, lỗ chênh lệch tỷ giá hối đoái chưa thực hiện', code: '04', level: 2 },
    { label: ' - Lãi, lỗ từ hoạt động đầu tư', code: '05', level: 2 },
    { label: ' - Chi phí lãi vay', code: '06', level: 2 },
    { label: ' - Các khoản điều chỉnh khác', code: '07', level: 2 },
    { label: '3. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động', code: '08', isHeader: true, level: 1 },
    { label: ' - Tăng, giảm các khoản phải thu', code: '09', level: 2 },
    { label: ' - Tăng, giảm hàng tồn kho', code: '10', level: 2 },
    { label: ' - Tăng, giảm các khoản phải trả (không kể lãi vay phải trả, thuế TNDN phải nộp)', code: '11', level: 2 },
    { label: ' - Tăng, giảm chi phí trả trước', code: '12', level: 2 },
    { label: ' - Tăng, giảm chứng khoán kinh doanh', code: '13', level: 2 },
    { label: ' - Tiền lãi vay đã trả', code: '14', level: 2 },
    { label: ' - Thuế thu nhập doanh nghiệp đã nộp', code: '15', level: 2 },
    { label: ' - Tiền thu khác từ hoạt động kinh doanh', code: '16', level: 2 },
    { label: ' - Tiền chi khác cho hoạt động kinh doanh', code: '17', level: 2 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', code: '20', isTotal: true, level: 0 },
    { label: 'II. Lưu chuyển tiền từ hoạt động đầu tư', code: '30', isHeader: true, level: 0 },
    { label: '1. Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác', code: '21', level: 1 },
    { label: '2. Tiền thu từ thanh lý, nhượng bán TSCĐ và các tài sản dài hạn khác', code: '22', level: 1 },
    { label: '3. Tiền chi cho vay, mua các công cụ nợ của đơn vị khác', code: '23', level: 1 },
    { label: '4. Tiền thu hồi cho vay, bán lại các công cụ nợ của đơn vị khác', code: '24', level: 1 },
    { label: '5. Tiền chi đầu tư góp vốn vào đơn vị khác', code: '25', level: 1 },
    { label: '6. Tiền thu hồi đầu tư góp vốn vào đơn vị khác', code: '26', level: 1 },
    { label: '7. Tiền thu lãi cho vay, cổ tức và lợi nhuận được chia', code: '27', level: 1 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động đầu tư', code: '30', isTotal: true, level: 0 },
    { label: 'III. Lưu chuyển tiền từ hoạt động tài chính', code: '40', isHeader: true, level: 0 },
    { label: '1. Tiền thu từ phát hành cổ phiếu, nhận vốn góp của chủ sở hữu', code: '31', level: 1 },
    { label: '2. Tiền trả lại vốn góp cho các chủ sở hữu, mua lại cổ phiếu của doanh nghiệp đã phát hành', code: '32', level: 1 },
    { label: '3. Tiền thu từ đi vay', code: '33', level: 1 },
    { label: '4. Tiền trả nợ gốc vay', code: '34', level: 1 },
    { label: '5. Tiền trả nợ thuê tài chính', code: '35', level: 1 },
    { label: '6. Cổ tức, lợi nhuận đã trả cho chủ sở hữu', code: '36', level: 1 },
    { label: 'Lưu chuyển tiền thuần từ hoạt động tài chính', code: '40', isTotal: true, level: 0 },
    { label: 'Lưu chuyển tiền thuần trong kỳ (50 = 20 + 30 + 40)', code: '50', isTotal: true, level: 0 },
    { label: 'Tiền và tương đương tiền đầu kỳ', code: '60', level: 0 },
    { label: 'Ảnh hưởng của thay đổi tỷ giá hối đoái quy đổi ngoại tệ', code: '61', level: 0 },
    { label: 'Tiền và tương đương tiền cuối kỳ (70 = 50 + 60 + 61)', code: '70', isTotal: true, level: 0 },
  ];

  const items = method === 'direct' ? directItems : indirectItems;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:p-0 print:shadow-none print:border-none">
      <div className="flex justify-between items-start mb-8">
        <div className="text-sm">
          <p className="font-bold">Đơn vị báo cáo: ....................</p>
          <p className="font-bold">Địa chỉ: ....................</p>
        </div>
        <div className="text-center text-xs">
          <p className="font-bold text-sm">Mẫu số B 03 - DN</p>
          <p>(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p>Ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">BÁO CÁO LƯU CHUYỂN TIỀN TỆ</h2>
        <h3 className="text-lg font-bold text-slate-700 uppercase">({method === 'direct' ? 'PHƯƠNG PHÁP TRỰC TIẾP' : 'PHƯƠNG PHÁP GIÁN TIẾP'})</h3>
        <p className="text-slate-500 mt-2 italic">Kỳ kế toán từ ngày {format(new Date(filters.startDate), 'dd/MM/yyyy')} đến ngày {format(new Date(filters.endDate), 'dd/MM/yyyy')}</p>
      </div>
      
      <div className="flex justify-end mb-2 text-xs italic">
        Đơn vị tính: Đồng Việt Nam
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
              <th className="px-4 py-2 border border-slate-300 text-center w-[50%]">Chỉ tiêu</th>
              <th className="px-2 py-2 border border-slate-300 text-center w-[8%]">Mã số</th>
              <th className="px-2 py-2 border border-slate-300 text-center w-[10%]">Thuyết minh</th>
              <th className="px-4 py-2 border border-slate-300 text-right w-[16%]">Năm nay</th>
              <th className="px-4 py-2 border border-slate-300 text-right w-[16%]">Năm trước</th>
            </tr>
            <tr className="bg-slate-50 text-slate-500 text-[10px] text-center italic">
              <th className="px-4 py-1 border border-slate-300">1</th>
              <th className="px-2 py-1 border border-slate-300">2</th>
              <th className="px-2 py-1 border border-slate-300">3</th>
              <th className="px-4 py-1 border border-slate-300">4</th>
              <th className="px-4 py-1 border border-slate-300">5</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const value = getRowValue(item.code);
              return (
                <tr key={i} className={`${item.isHeader ? 'font-bold bg-slate-50/30' : ''} ${item.isTotal ? 'font-bold' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <td className={`px-4 py-2 border border-slate-300 text-slate-800 ${item.level === 1 ? 'pl-8' : item.level === 2 ? 'pl-12' : ''}`}>
                    {item.label}
                  </td>
                  <td className="px-2 py-2 border border-slate-300 text-center text-slate-600 font-mono">{item.code}</td>
                  <td className="px-2 py-2 border border-slate-300 text-center text-slate-600">-</td>
                  <td className="px-4 py-2 border border-slate-300 text-right font-mono text-slate-900">{formatCurrency(value)}</td>
                  <td className="px-4 py-2 border border-slate-300 text-right font-mono text-slate-900">-</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
