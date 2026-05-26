import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Hash, User, Briefcase, Percent, Package, Clock, CalendarOff, PlusCircle, Sigma, ArrowDownCircle, MinusCircle, Wallet } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';

interface PayrollRow {
  stt: string;
  fullName: string;
  rank: string;
  coefficient: number;
  productSalary: { quantity: number; amount: number };
  timeSalary: { days: number; amount: number };
  leaveSalary: { days: number; amount: number };
  salaryFundAllowances: number;
  otherAllowances: number;
  total: number;
  advancePeriod1: number;
  deductions: { bhxh: number; other: number; thueTNCN: number; total: number };
  period2Amount: number;
}

interface PayrollFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<PayrollRow[]>(metadata?.rows || [
    {
      stt: '1',
      fullName: '',
      rank: '',
      coefficient: 0,
      productSalary: { quantity: 0, amount: 0 },
      timeSalary: { days: 0, amount: 0 },
      leaveSalary: { days: 0, amount: 0 },
      salaryFundAllowances: 0,
      otherAllowances: 0,
      total: 0,
      advancePeriod1: 0,
      deductions: { bhxh: 0, other: 0, thueTNCN: 0, total: 0 },
      period2Amount: 0,
    }
  ]);

  useEffect(() => {
    onChange({ ...metadata, rows });
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      fullName: '',
      rank: '',
      coefficient: 0,
      productSalary: { quantity: 0, amount: 0 },
      timeSalary: { days: 0, amount: 0 },
      leaveSalary: { days: 0, amount: 0 },
      salaryFundAllowances: 0,
      otherAllowances: 0,
      total: 0,
      advancePeriod1: 0,
      deductions: { bhxh: 0, other: 0, thueTNCN: 0, total: 0 },
      period2Amount: 0,
    }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    const row = { ...newRows[index] };

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (row as any)[parent] = { ...(row as any)[parent], [child]: value };
    } else {
      (row as any)[field] = value;
    }

    // Recalculate totals for the row
    const total = (row.productSalary.amount || 0) + 
                  (row.timeSalary.amount || 0) + 
                  (row.leaveSalary.amount || 0) + 
                  (row.salaryFundAllowances || 0) + 
                  (row.otherAllowances || 0);
    
    row.total = total;

    const deductionTotal = (row.deductions.bhxh || 0) + 
                           (row.deductions.other || 0) + 
                           (row.deductions.thueTNCN || 0);
    
    row.deductions.total = deductionTotal;
    row.period2Amount = total - (row.advancePeriod1 || 0) - deductionTotal;

    newRows[index] = row;
    setRows(newRows);
  };

  const totals = rows.reduce((acc, row) => ({
    productSalaryAmount: acc.productSalaryAmount + (row.productSalary.amount || 0),
    timeSalaryAmount: acc.timeSalaryAmount + (row.timeSalary.amount || 0),
    leaveSalaryAmount: acc.leaveSalaryAmount + (row.leaveSalary.amount || 0),
    salaryFundAllowances: acc.salaryFundAllowances + (row.salaryFundAllowances || 0),
    otherAllowances: acc.otherAllowances + (row.otherAllowances || 0),
    total: acc.total + (row.total || 0),
    advancePeriod1: acc.advancePeriod1 + (row.advancePeriod1 || 0),
    bhxhTotal: acc.bhxhTotal + (row.deductions.bhxh || 0),
    otherDeductionsTotal: acc.otherDeductionsTotal + (row.deductions.other || 0),
    thueTNCNTotal: acc.thueTNCNTotal + (row.deductions.thueTNCN || 0),
    deductionsTotal: acc.deductionsTotal + (row.deductions.total || 0),
    period2Amount: acc.period2Amount + (row.period2Amount || 0),
  }), {
    productSalaryAmount: 0,
    timeSalaryAmount: 0,
    leaveSalaryAmount: 0,
    salaryFundAllowances: 0,
    otherAllowances: 0,
    total: 0,
    advancePeriod1: 0,
    bhxhTotal: 0,
    otherDeductionsTotal: 0,
    thueTNCNTotal: 0,
    deductionsTotal: 0,
    period2Amount: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          Chi tiết bảng lương
        </h3>
        {!isViewOnly && (
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Thêm nhân viên
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse min-w-[1800px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10">
                <div className="flex flex-col items-center gap-1">
                  <Hash size={14} className="text-slate-400" />
                  <span>STT</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-48">
                <div className="flex flex-col items-center gap-1">
                  <User size={14} className="text-emerald-500" />
                  <span>Họ và tên</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-32">
                <div className="flex flex-col items-center gap-1">
                  <Briefcase size={14} className="text-blue-500" />
                  <span>Ngạch bậc lương</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-16">
                <div className="flex flex-col items-center gap-1">
                  <Percent size={14} className="text-amber-500" />
                  <span>Hệ số</span>
                </div>
              </th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Package size={14} className="text-indigo-500" />
                  <span>Lương sản phẩm</span>
                </div>
              </th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span>Lương thời gian</span>
                </div>
              </th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CalendarOff size={14} className="text-red-400" />
                  <span>Nghỉ việc...</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <PlusCircle size={14} className="text-emerald-500" />
                  <span>Phụ cấp quỹ lương</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <Plus size={14} className="text-slate-400" />
                  <span>Phụ cấp khác</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-28">
                <div className="flex flex-col items-center gap-1">
                  <Sigma size={14} className="text-slate-900" />
                  <span>Tổng số</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">
                <div className="flex flex-col items-center gap-1">
                  <ArrowDownCircle size={14} className="text-orange-500" />
                  <span>Tạm ứng kỳ I</span>
                </div>
              </th>
              <th colSpan={4} className="p-2 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <MinusCircle size={14} className="text-red-500" />
                  <span>Các khoản khấu trừ</span>
                </div>
              </th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-28">
                <div className="flex flex-col items-center gap-1">
                  <Wallet size={14} className="text-emerald-600" />
                  <span>Kỳ II được lĩnh</span>
                </div>
              </th>
              {!isViewOnly && <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10"></th>}
            </tr>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-16">Số SP</th>
              <th className="p-2 border border-slate-200 text-center w-24">Số tiền</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số công</th>
              <th className="p-2 border border-slate-200 text-center w-24">Số tiền</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số công</th>
              <th className="p-2 border border-slate-200 text-center w-24">Số tiền</th>
              <th className="p-2 border border-slate-200 text-center w-24">BHXH</th>
              <th className="p-2 border border-slate-200 text-center w-24">Khác</th>
              <th className="p-2 border border-slate-200 text-center w-24">Thuế TNCN</th>
              <th className="p-2 border border-slate-200 text-center w-24">Cộng</th>
            </tr>
            <tr className="bg-slate-100 text-slate-500 text-[10px] text-center">
              <td className="p-1 border border-slate-200">A</td>
              <td className="p-1 border border-slate-200">B</td>
              <td className="p-1 border border-slate-200">1</td>
              <td className="p-1 border border-slate-200">2</td>
              <td className="p-1 border border-slate-200">3</td>
              <td className="p-1 border border-slate-200">4</td>
              <td className="p-1 border border-slate-200">5</td>
              <td className="p-1 border border-slate-200">6</td>
              <td className="p-1 border border-slate-200">7</td>
              <td className="p-1 border border-slate-200">8</td>
              <td className="p-1 border border-slate-200">9</td>
              <td className="p-1 border border-slate-200">10</td>
              <td className="p-1 border border-slate-200">11</td>
              <td className="p-1 border border-slate-200">12</td>
              <td className="p-1 border border-slate-200">13</td>
              <td className="p-1 border border-slate-200">14</td>
              <td className="p-1 border border-slate-200">15</td>
              <td className="p-1 border border-slate-200">16</td>
              <td className="p-1 border border-slate-200">17</td>
              {!isViewOnly && <td className="p-1 border border-slate-200"></td>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-1 border border-slate-200 text-center">
                  <input 
                    type="text" 
                    value={row.stt}
                    onChange={(e) => handleRowChange(index, 'stt', e.target.value)}
                    disabled={isViewOnly}
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <Autocomplete 
                    collectionName="employees"
                    searchField="fullName"
                    displayField="fullName"
                    valueField="fullName"
                    placeholder="Nguyễn Văn A"
                    value={row.fullName}
                    onChange={(val, emp) => {
                      handleRowChange(index, 'fullName', val);
                      if (emp) {
                        handleRowChange(index, 'rank', emp.position || emp.rank || '');
                        handleRowChange(index, 'coefficient', emp.salaryCoefficient || 0);
                      }
                    }}
                    disabled={isViewOnly}
                    className="border-none p-0"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="text" 
                    value={row.rank}
                    onChange={(e) => handleRowChange(index, 'rank', e.target.value)}
                    disabled={isViewOnly}
                    placeholder="Chuyên viên"
                    className="w-full bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    step="0.01"
                    value={row.coefficient}
                    onChange={(e) => handleRowChange(index, 'coefficient', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.productSalary.quantity}
                    onChange={(e) => handleRowChange(index, 'productSalary.quantity', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.productSalary.amount}
                    onChange={(e) => handleRowChange(index, 'productSalary.amount', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.timeSalary.days}
                    onChange={(e) => handleRowChange(index, 'timeSalary.days', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.timeSalary.amount}
                    onChange={(e) => handleRowChange(index, 'timeSalary.amount', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.leaveSalary.days}
                    onChange={(e) => handleRowChange(index, 'leaveSalary.days', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.leaveSalary.amount}
                    onChange={(e) => handleRowChange(index, 'leaveSalary.amount', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.salaryFundAllowances}
                    onChange={(e) => handleRowChange(index, 'salaryFundAllowances', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.otherAllowances}
                    onChange={(e) => handleRowChange(index, 'otherAllowances', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">
                  {row.total.toLocaleString()}
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.advancePeriod1}
                    onChange={(e) => handleRowChange(index, 'advancePeriod1', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.deductions.bhxh}
                    onChange={(e) => handleRowChange(index, 'deductions.bhxh', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.deductions.other}
                    onChange={(e) => handleRowChange(index, 'deductions.other', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.deductions.thueTNCN}
                    onChange={(e) => handleRowChange(index, 'deductions.thueTNCN', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">
                  {row.deductions.total.toLocaleString()}
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-blue-50 text-blue-700">
                  {row.period2Amount.toLocaleString()}
                </td>
                {!isViewOnly && (
                  <td className="p-1 border border-slate-200 text-center">
                    <button 
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={rows.length === 1}
                      className="text-red-400 hover:text-red-600 p-1 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold">
              <td colSpan={5} className="p-2 border border-slate-200 text-right">Cộng</td>
              <td className="p-2 border border-slate-200 text-right">{totals.productSalaryAmount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right">{totals.timeSalaryAmount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right">{totals.leaveSalaryAmount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.salaryFundAllowances.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.otherAllowances.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.total.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.advancePeriod1.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.bhxhTotal.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.otherDeductionsTotal.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.thueTNCNTotal.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.deductionsTotal.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right text-blue-700">{totals.period2Amount.toLocaleString()}</td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollForm;
