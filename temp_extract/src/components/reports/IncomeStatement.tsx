import React from 'react';
import { Voucher, Account } from '../../types/accounting';
import { format } from 'date-fns';

interface IncomeStatementProps {
  vouchers: Voucher[];
  accounts: Account[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const IncomeStatement: React.FC<IncomeStatementProps> = ({ vouchers, accounts, workingYear, filters }) => {
  const formatCurrency = (val: number) => {
    if (val === 0 || isNaN(val)) return '-';
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(val));
    return val < 0 ? `(${formatted})` : formatted;
  };

  const calculateIncome = (accountCode: string) => {
    let income = 0;
    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          if (item.creditAccount?.startsWith(accountCode)) {
            income += item.amount || 0;
          }
          if (item.debitAccount?.startsWith(accountCode)) {
            income -= item.amount || 0;
          }
        });
      }
    });
    return income;
  };

  const calculateExpense = (accountCode: string) => {
    let expense = 0;
    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          if (item.debitAccount?.startsWith(accountCode)) {
            expense += item.amount || 0;
          }
          if (item.creditAccount?.startsWith(accountCode)) {
            expense -= item.amount || 0;
          }
        });
      }
    });
    return expense;
  };

  const getRowValue = (code: string): number => {
    switch (code) {
      case '01': return calculateIncome('511');
      case '02': return calculateExpense('521'); // Các khoản giảm trừ doanh thu
      case '10': return getRowValue('01') - getRowValue('02');
      case '11': return calculateExpense('632');
      case '20': return getRowValue('10') - getRowValue('11');
      case '21': return calculateIncome('515');
      case '22': return calculateExpense('635');
      case '23': return calculateExpense('6351'); // Chi phí lãi vay (sub-account of 635)
      case '25': return calculateExpense('641');
      case '26': return calculateExpense('642');
      case '30': return getRowValue('20') + (getRowValue('21') - getRowValue('22')) - (getRowValue('25') + getRowValue('26'));
      case '31': return calculateIncome('711');
      case '32': return calculateExpense('811');
      case '40': return getRowValue('31') - getRowValue('32');
      case '50': return getRowValue('30') + getRowValue('40');
      case '51': return calculateExpense('8211');
      case '52': return calculateExpense('8212');
      case '60': return getRowValue('50') - getRowValue('51') - getRowValue('52');
      case '70': return 0; // Lãi cơ bản trên cổ phiếu
      case '71': return 0; // Lãi suy giảm trên cổ phiếu
      default: return 0;
    }
  };

  const items = [
    { label: '1. Doanh thu bán hàng và cung cấp dịch vụ', code: '01' },
    { label: '2. Các khoản giảm trừ doanh thu', code: '02' },
    { label: '3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10=01-02)', code: '10', isHeader: true },
    { label: '4. Giá vốn hàng bán', code: '11' },
    { label: '5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20=10-11)', code: '20', isHeader: true },
    { label: '6. Doanh thu hoạt động tài chính', code: '21' },
    { label: '7. Chi phí tài chính', code: '22' },
    { label: ' - Trong đó: Chi phí lãi vay', code: '23', level: 1 },
    { label: '8. Chi phí bán hàng', code: '25' },
    { label: '9. Chi phí quản lý doanh nghiệp', code: '26' },
    { label: '10. Lợi nhuận thuần từ hoạt động kinh doanh {30 = 20 + (21 - 22) - (25 + 26)}', code: '30', isHeader: true },
    { label: '11. Thu nhập khác', code: '31' },
    { label: '12. Chi phí khác', code: '32' },
    { label: '13. Lợi nhuận khác (40 = 31 - 32)', code: '40', isHeader: true },
    { label: '14. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)', code: '50', isHeader: true },
    { label: '15. Chi phí thuế TNDN hiện hành', code: '51' },
    { label: '16. Chi phí thuế TNDN hoãn lại', code: '52' },
    { label: '17. Lợi nhuận sau thuế thu nhập doanh nghiệp (60=50-51-52)', code: '60', isHeader: true },
    { label: '18. Lãi cơ bản trên cổ phiếu (*)', code: '70' },
    { label: '19. Lãi suy giảm trên cổ phiếu (*)', code: '71' },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:p-0 print:shadow-none print:border-none">
      <div className="flex justify-between items-start mb-8">
        <div className="text-sm">
          <p className="font-bold">Đơn vị báo cáo: ....................</p>
          <p className="font-bold">Địa chỉ: ....................</p>
        </div>
        <div className="text-center text-xs">
          <p className="font-bold text-sm">Mẫu số B 02 - DN</p>
          <p>(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p>Ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH</h2>
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
                <tr key={i} className={`${item.isHeader ? 'font-bold bg-slate-50/30' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <td className={`px-4 py-2 border border-slate-300 text-slate-800 ${item.level === 1 ? 'pl-8' : ''}`}>
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
