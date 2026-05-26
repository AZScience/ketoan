import React from 'react';
import { Voucher, Account, OpeningBalance } from '../../types/accounting';
import { format } from 'date-fns';

interface BalanceSheetProps {
  vouchers: Voucher[];
  accounts: Account[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ vouchers, accounts, openingBalances, workingYear, filters }) => {
  const formatCurrency = (val: number) => {
    if (val === 0 || isNaN(val)) return '-';
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
    return val < 0 ? `(${formatted})` : formatted;
  };

  const calculateBalance = (accountCode: string, dateLimit: string) => {
    let balance = 0;

    // Add opening balances
    openingBalances.forEach(ob => {
      if (ob.accountCode.startsWith(accountCode)) {
        balance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

    // Add vouchers up to dateLimit
    vouchers.forEach(v => {
      if (v.date <= dateLimit) {
        v.items?.forEach(item => {
          if (item.debitAccount?.startsWith(accountCode)) {
            balance += item.amount || 0;
          }
          if (item.creditAccount?.startsWith(accountCode)) {
            balance -= item.amount || 0;
          }
        });
      }
    });
    
    // For liabilities and equity (3xx, 4xx), balance is usually credit - debit
    if (accountCode.startsWith('3') || accountCode.startsWith('4')) {
      return -balance;
    }
    
    return balance;
  };

  const calculateOpening = (accountCode: string) => {
    let balance = 0;
    openingBalances.forEach(ob => {
      if (ob.accountCode.startsWith(accountCode)) {
        balance += (ob.debit || 0) - (ob.credit || 0);
      }
    });
    if (accountCode.startsWith('3') || accountCode.startsWith('4')) {
      return -balance;
    }
    return balance;
  };

  // Define the rows as per the image (Standard B01-DN structure)
  const rows = [
    { label: 'A. TÀI SẢN NGẮN HẠN', code: '100', isHeader: true, level: 0 },
    { label: 'I. Tiền và các khoản tương đương tiền', code: '110', isHeader: true, level: 1, note: 'V.01' },
    { label: '1. Tiền', code: '111', level: 2, account: '111' },
    { label: '2. Các khoản tương đương tiền', code: '112', level: 2, account: '112' },
    { label: 'II. Đầu tư tài chính ngắn hạn', code: '120', isHeader: true, level: 1, note: 'V.02' },
    { label: '1. Chứng khoán kinh doanh', code: '121', level: 2, account: '121' },
    { label: '2. Dự phòng giảm giá chứng khoán kinh doanh (*)', code: '122', level: 2, account: '129' },
    { label: '3. Đầu tư nắm giữ đến ngày đáo hạn', code: '123', level: 2, account: '128' },
    { label: 'III. Các khoản phải thu ngắn hạn', code: '130', isHeader: true, level: 1, note: 'V.03' },
    { label: '1. Phải thu ngắn hạn của khách hàng', code: '131', level: 2, account: '131' },
    { label: '2. Trả trước cho người bán ngắn hạn', code: '132', level: 2, account: '331' },
    { label: '3. Phải thu nội bộ ngắn hạn', code: '133', level: 2, account: '136' },
    { label: '4. Phải thu theo tiến độ kế hoạch hợp đồng xây dựng', code: '134', level: 2, account: '337' },
    { label: '5. Phải thu về cho vay ngắn hạn', code: '135', level: 2, account: '1288' },
    { label: '6. Phải thu ngắn hạn khác', code: '136', level: 2, account: '138' },
    { label: '7. Dự phòng phải thu ngắn hạn khó đòi (*)', code: '137', level: 2, account: '2293' },
    { label: '8. Tài sản thiếu chờ xử lý', code: '139', level: 2, account: '1381' },
    { label: 'IV. Hàng tồn kho', code: '140', isHeader: true, level: 1, note: 'V.04' },
    { label: '1. Hàng tồn kho', code: '141', level: 2, account: '15' },
    { label: '2. Dự phòng giảm giá hàng tồn kho (*)', code: '142', level: 2, account: '2294' },
    { label: 'V. Tài sản ngắn hạn khác', code: '150', isHeader: true, level: 1 },
    { label: '1. Chi phí trả trước ngắn hạn', code: '151', level: 2, account: '242' },
    { label: '2. Thuế GTGT được khấu trừ', code: '152', level: 2, account: '133' },
    { label: '3. Thuế và các khoản khác phải thu Nhà nước', code: '153', level: 2, account: '333' },
    { label: '4. Giao dịch mua bán lại trái phiếu Chính phủ', code: '154', level: 2, account: '171' },
    { label: '5. Tài sản ngắn hạn khác', code: '155', level: 2, account: '138' },
    
    { label: 'B. TÀI SẢN DÀI HẠN', code: '200', isHeader: true, level: 0 },
    { label: 'I. Các khoản phải thu dài hạn', code: '210', isHeader: true, level: 1, note: 'V.06' },
    { label: '1. Phải thu dài hạn của khách hàng', code: '211', level: 2, account: '131' },
    { label: '2. Trả trước cho người bán dài hạn', code: '212', level: 2, account: '331' },
    { label: '3. Vốn kinh doanh ở đơn vị trực thuộc', code: '213', level: 2, account: '1361' },
    { label: '4. Phải thu nội bộ dài hạn', code: '214', level: 2, account: '136' },
    { label: '5. Phải thu về cho vay dài hạn', code: '215', level: 2, account: '1288' },
    { label: '6. Phải thu dài hạn khác', code: '216', level: 2, account: '138' },
    { label: '7. Dự phòng phải thu dài hạn khó đòi (*)', code: '219', level: 2, account: '2293' },
    { label: 'II. Tài sản cố định', code: '220', isHeader: true, level: 1, note: 'V.07' },
    { label: '1. Tài sản cố định hữu hình', code: '221', level: 2, account: '211' },
    { label: ' - Nguyên giá', code: '222', level: 3, account: '211' },
    { label: ' - Giá trị hao mòn lũy kế (*)', code: '223', level: 3, account: '2141' },
    { label: '2. Tài sản cố định thuê tài chính', code: '224', level: 2, account: '212' },
    { label: ' - Nguyên giá', code: '225', level: 3, account: '212' },
    { label: ' - Giá trị hao mòn lũy kế (*)', code: '226', level: 3, account: '2142' },
    { label: '3. Tài sản cố định vô hình', code: '227', level: 2, account: '213' },
    { label: ' - Nguyên giá', code: '228', level: 3, account: '213' },
    { label: ' - Giá trị hao mòn lũy kế (*)', code: '229', level: 3, account: '2143' },
    { label: 'III. Bất động sản đầu tư', code: '230', isHeader: true, level: 1, note: 'V.08', account: '217' },
    { label: 'IV. Tài sản dở dang dài hạn', code: '240', isHeader: true, level: 1, note: 'V.09' },
    { label: '1. Chi phí sản xuất, kinh doanh dở dang dài hạn', code: '241', level: 2, account: '154' },
    { label: '2. Chi phí xây dựng cơ bản dở dang', code: '242', level: 2, account: '241' },
    { label: 'V. Đầu tư tài chính dài hạn', code: '250', isHeader: true, level: 1, note: 'V.10' },
    { label: '1. Đầu tư vào công ty con', code: '251', level: 2, account: '221' },
    { label: '2. Đầu tư vào công ty liên doanh, liên kết', code: '252', level: 2, account: '222' },
    { label: '3. Đầu tư góp vốn vào đơn vị khác', code: '253', level: 2, account: '228' },
    { label: '4. Dự phòng đầu tư tài chính dài hạn (*)', code: '254', level: 2, account: '229' },
    { label: '5. Đầu tư nắm giữ đến ngày đáo hạn', code: '255', level: 2, account: '128' },
    { label: 'VI. Tài sản dài hạn khác', code: '260', isHeader: true, level: 1, note: 'V.11' },
    { label: '1. Chi phí trả trước dài hạn', code: '261', level: 2, account: '242' },
    { label: '2. Tài sản thuế thu nhập hoãn lại', code: '262', level: 2, account: '243' },
    { label: '3. Thiết bị, vật tư, phụ tùng thay thế dài hạn', code: '263', level: 2, account: '153' },
    { label: '4. Tài sản dài hạn khác', code: '268', level: 2, account: '244' },
    
    { label: 'TỔNG CỘNG TÀI SẢN (270 = 100 + 200)', code: '270', isTotal: true, level: 0 },
    
    { label: 'C. NỢ PHẢI TRẢ', code: '300', isHeader: true, level: 0 },
    { label: 'I. Nợ ngắn hạn', code: '310', isHeader: true, level: 1, note: 'V.12' },
    { label: '1. Phải trả người bán ngắn hạn', code: '311', level: 2, account: '331' },
    { label: '2. Người mua trả tiền trước ngắn hạn', code: '312', level: 2, account: '131' },
    { label: '3. Thuế và các khoản phải nộp Nhà nước', code: '313', level: 2, account: '333' },
    { label: '4. Phải trả người lao động', code: '314', level: 2, account: '334' },
    { label: '5. Chi phí phải trả ngắn hạn', code: '315', level: 2, account: '335' },
    { label: '6. Phải trả nội bộ ngắn hạn', code: '316', level: 2, account: '336' },
    { label: '7. Phải trả theo tiến độ kế hoạch hợp đồng xây dựng', code: '317', level: 2, account: '337' },
    { label: '8. Doanh thu chưa thực hiện ngắn hạn', code: '318', level: 2, account: '3387' },
    { label: '9. Phải trả ngắn hạn khác', code: '319', level: 2, account: '338' },
    { label: '10. Vay và nợ thuê tài chính ngắn hạn', code: '320', level: 2, account: '341' },
    { label: '11. Dự phòng phải trả ngắn hạn', code: '321', level: 2, account: '352' },
    { label: '12. Quỹ khen thưởng, phúc lợi', code: '322', level: 2, account: '353' },
    { label: '13. Quỹ bình ổn giá', code: '323', level: 2, account: '357' },
    { label: '14. Giao dịch mua bán lại trái phiếu Chính phủ', code: '324', level: 2, account: '171' },
    { label: 'II. Nợ dài hạn', code: '330', isHeader: true, level: 1, note: 'V.13' },
    { label: '1. Phải trả người bán dài hạn', code: '331', level: 2, account: '331' },
    { label: '2. Người mua trả tiền trước dài hạn', code: '332', level: 2, account: '131' },
    { label: '3. Chi phí phải trả dài hạn', code: '333', level: 2, account: '335' },
    { label: '4. Phải trả nội bộ về vốn kinh doanh', code: '334', level: 2, account: '3361' },
    { label: '5. Phải trả nội bộ dài hạn', code: '335', level: 2, account: '336' },
    { label: '6. Doanh thu chưa thực hiện dài hạn', code: '336', level: 2, account: '3387' },
    { label: '7. Phải trả dài hạn khác', code: '337', level: 2, account: '338' },
    { label: '8. Vay và nợ thuê tài chính dài hạn', code: '338', level: 2, account: '341' },
    { label: '9. Trái phiếu chuyển đổi', code: '339', level: 2, account: '3432' },
    { label: '10. Cổ phiếu ưu đãi', code: '340', level: 2, account: '343' },
    { label: '11. Thuế thu nhập hoãn lại phải trả', code: '341', level: 2, account: '347' },
    { label: '12. Dự phòng phải trả dài hạn', code: '342', level: 2, account: '352' },
    { label: '13. Quỹ phát triển khoa học và công nghệ', code: '343', level: 2, account: '356' },
    
    { label: 'D. VỐN CHỦ SỞ HỮU', code: '400', isHeader: true, level: 0 },
    { label: 'I. Vốn chủ sở hữu', code: '410', isHeader: true, level: 1, note: 'V.14' },
    { label: '1. Vốn góp của chủ sở hữu', code: '411', level: 2, account: '4111' },
    { label: ' - Cổ phiếu phổ thông có quyền biểu quyết', code: '411a', level: 3, account: '4111' },
    { label: ' - Cổ phiếu ưu đãi', code: '411b', level: 3, account: '4111' },
    { label: '2. Thặng dư vốn cổ phần', code: '412', level: 2, account: '412' },
    { label: '3. Quyền chọn chuyển đổi trái phiếu', code: '413', level: 2, account: '413' },
    { label: '4. Vốn khác của chủ sở hữu', code: '414', level: 2, account: '4118' },
    { label: '5. Cổ phiếu quỹ (*)', code: '415', level: 2, account: '419' },
    { label: '6. Chênh lệch đánh giá lại tài sản', code: '416', level: 2, account: '412' },
    { label: '7. Chênh lệch tỷ giá hối đoái', code: '417', level: 2, account: '413' },
    { label: '8. Quỹ đầu tư phát triển', code: '418', level: 2, account: '414' },
    { label: '9. Quỹ hỗ trợ sắp xếp doanh nghiệp', code: '419', level: 2, account: '417' },
    { label: '10. Quỹ khác thuộc vốn chủ sở hữu', code: '420', level: 2, account: '418' },
    { label: '11. Lợi nhuận sau thuế chưa phân phối', code: '421', level: 2, account: '421' },
    { label: ' - LNST chưa phân phối lũy kế đến cuối kỳ trước', code: '421a', level: 3, account: '4211' },
    { label: ' - LNST chưa phân phối kỳ này', code: '421b', level: 3, account: '4212' },
    { label: '12. Nguồn vốn đầu tư XDCB', code: '422', level: 2, account: '441' },
    { label: 'II. Nguồn kinh phí và quỹ khác', code: '430', isHeader: true, level: 1, note: 'V.15' },
    { label: '1. Nguồn kinh phí', code: '431', level: 2, account: '461' },
    { label: '2. Nguồn kinh phí đã hình thành TSCĐ', code: '432', level: 2, account: '466' },
    
    { label: 'TỔNG CỘNG NGUỒN VỐN (440 = 300 + 400)', code: '440', isTotal: true, level: 0 },
  ];

  const getRowValue = (row: any, isClosing: boolean): number => {
    if (row.account) {
      return isClosing ? calculateBalance(row.account, filters.endDate) : calculateOpening(row.account);
    }
    
    // Manual summing logic for standard sections
    const getVal = (code: string) => {
      const r = rows.find(x => x.code === code);
      return r ? getRowValue(r, isClosing) : 0;
    };

    switch (row.code) {
      case '100': return getVal('110') + getVal('120') + getVal('130') + getVal('140') + getVal('150');
      case '110': return getVal('111') + getVal('112');
      case '120': return getVal('121') + getVal('122') + getVal('123');
      case '130': return getVal('131') + getVal('132') + getVal('133') + getVal('134') + getVal('135') + getVal('136') + getVal('137') + getVal('139');
      case '140': return getVal('141') + getVal('142');
      case '150': return getVal('151') + getVal('152') + getVal('153') + getVal('154') + getVal('155');
      case '200': return getVal('210') + getVal('220') + getVal('230') + getVal('240') + getVal('250') + getVal('260');
      case '210': return getVal('211') + getVal('212') + getVal('213') + getVal('214') + getVal('215') + getVal('216') + getVal('219');
      case '220': return getVal('221') + getVal('224') + getVal('227');
      case '240': return getVal('241') + getVal('242');
      case '250': return getVal('251') + getVal('252') + getVal('253') + getVal('254') + getVal('255');
      case '260': return getVal('261') + getVal('262') + getVal('263') + getVal('268');
      case '270': return getVal('100') + getVal('200');
      case '300': return getVal('310') + getVal('330');
      case '310': return getVal('311') + getVal('312') + getVal('313') + getVal('314') + getVal('315') + getVal('316') + getVal('317') + getVal('318') + getVal('319') + getVal('320') + getVal('321') + getVal('322') + getVal('323') + getVal('324');
      case '330': return getVal('331') + getVal('332') + getVal('333') + getVal('334') + getVal('335') + getVal('336') + getVal('337') + getVal('338') + getVal('339') + getVal('340') + getVal('341') + getVal('342') + getVal('343');
      case '400': return getVal('410') + getVal('430');
      case '410': return getVal('411') + getVal('412') + getVal('413') + getVal('414') + getVal('415') + getVal('416') + getVal('417') + getVal('418') + getVal('419') + getVal('420') + getVal('421') + getVal('422');
      case '430': return getVal('431') + getVal('432');
      case '440': return getVal('300') + getVal('400');
      default: return 0;
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:p-0 print:shadow-none print:border-none">
      <div className="flex justify-between items-start mb-8">
        <div className="text-sm">
          <p className="font-bold">Đơn vị báo cáo: ....................</p>
          <p className="font-bold">Địa chỉ: ....................</p>
        </div>
        <div className="text-center text-xs">
          <p className="font-bold text-sm">Mẫu số B 01 - DN</p>
          <p>(Ban hành theo Thông tư số 99/2025/TT-BTC</p>
          <p>ngày 27 tháng 10 năm 2025 của Bộ trưởng</p>
          <p>Bộ Tài chính)</p>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">BÁO CÁO TÌNH HÌNH TÀI CHÍNH</h2>
        <p className="text-slate-500 mt-2 italic">Tại ngày {format(new Date(filters.endDate), 'dd')} tháng {format(new Date(filters.endDate), 'MM')} năm {format(new Date(filters.endDate), 'yyyy')} (1)</p>
        <p className="text-xs text-slate-400 mt-1">(Áp dụng cho doanh nghiệp đáp ứng giả định hoạt động liên tục)</p>
      </div>
      
      <div className="flex justify-end mb-2 text-xs italic">
        Đơn vị tính: Đồng Việt Nam
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
              <th className="px-4 py-2 border border-slate-300 text-center w-[50%]">TÀI SẢN</th>
              <th className="px-2 py-2 border border-slate-300 text-center w-[8%]">Mã số</th>
              <th className="px-2 py-2 border border-slate-300 text-center w-[10%]">Thuyết minh</th>
              <th className="px-4 py-2 border border-slate-300 text-right w-[16%]">Số cuối năm (4)</th>
              <th className="px-4 py-2 border border-slate-300 text-right w-[16%]">Số đầu năm (5)</th>
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
            {rows.map((row, i) => {
              const closing = getRowValue(row, true);
              const opening = getRowValue(row, false);
              
              return (
                <tr key={i} className={`${row.isHeader || row.isTotal ? 'font-bold bg-slate-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <td className={`px-4 py-2 border border-slate-300 text-slate-800 ${row.level === 1 ? 'pl-8' : row.level === 2 ? 'pl-12' : row.level === 3 ? 'pl-16' : ''}`}>
                    {row.label}
                  </td>
                  <td className="px-2 py-2 border border-slate-300 text-center text-slate-600 font-mono">{row.code}</td>
                  <td className="px-2 py-2 border border-slate-300 text-center text-slate-600">{row.note}</td>
                  <td className="px-4 py-2 border border-slate-300 text-right font-mono text-slate-900">{formatCurrency(closing)}</td>
                  <td className="px-4 py-2 border border-slate-300 text-right font-mono text-slate-900">{formatCurrency(opening)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
