import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Hash, User, Briefcase, Percent, Clock, Wallet, Calendar, Moon } from 'lucide-react';

interface OvertimeRow {
  stt: string;
  fullName: string;
  rank: string;
  salaryCoefficient: number;
  allowanceCoefficient: number;
  totalCoefficient: number;
  monthlySalary: number;
  salaryRate: number;
  overtimeWorkday: { hours: number; amount: number };
  overtimeWeekend: { hours: number; amount: number };
  overtimeHoliday: { hours: number; amount: number };
  overtimeNight: { hours: number; amount: number };
  totalAmount: number;
  compulsoryLeaveDays: number;
  actualPayment: number;
}

interface OvertimeFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const OvertimeForm: React.FC<OvertimeFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<OvertimeRow[]>(metadata?.rows || [
    {
      stt: '1',
      fullName: '',
      rank: '',
      salaryCoefficient: 0,
      allowanceCoefficient: 0,
      totalCoefficient: 0,
      monthlySalary: 0,
      salaryRate: 0,
      overtimeWorkday: { hours: 0, amount: 0 },
      overtimeWeekend: { hours: 0, amount: 0 },
      overtimeHoliday: { hours: 0, amount: 0 },
      overtimeNight: { hours: 0, amount: 0 },
      totalAmount: 0,
      compulsoryLeaveDays: 0,
      actualPayment: 0,
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
      salaryCoefficient: 0,
      allowanceCoefficient: 0,
      totalCoefficient: 0,
      monthlySalary: 0,
      salaryRate: 0,
      overtimeWorkday: { hours: 0, amount: 0 },
      overtimeWeekend: { hours: 0, amount: 0 },
      overtimeHoliday: { hours: 0, amount: 0 },
      overtimeNight: { hours: 0, amount: 0 },
      totalAmount: 0,
      compulsoryLeaveDays: 0,
      actualPayment: 0,
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

    // Recalculate
    row.totalCoefficient = (row.salaryCoefficient || 0) + (row.allowanceCoefficient || 0);
    row.totalAmount = (row.overtimeWorkday.amount || 0) + 
                      (row.overtimeWeekend.amount || 0) + 
                      (row.overtimeHoliday.amount || 0) + 
                      (row.overtimeNight.amount || 0);
    row.actualPayment = row.totalAmount; // Simplified, could subtract leave days if needed

    newRows[index] = row;
    setRows(newRows);
  };

  const totals = rows.reduce((acc, row) => ({
    totalAmount: acc.totalAmount + (row.totalAmount || 0),
    actualPayment: acc.actualPayment + (row.actualPayment || 0),
  }), {
    totalAmount: 0,
    actualPayment: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Clock size={18} className="text-blue-600" />
          Chi tiết thanh toán làm thêm giờ
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
        <table className="w-full text-xs text-left border-collapse min-w-[2000px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10">STT</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-48">Họ và tên</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-32">Ngạch bậc</th>
              <th colSpan={3} className="p-2 border border-slate-200 text-center">Hệ số</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">Lương tháng</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">Mức lương</th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">Làm thêm ngày làm việc</th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">Làm thêm T7, CN</th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">Làm thêm Lễ, Tết</th>
              <th colSpan={2} className="p-2 border border-slate-200 text-center">Làm thêm đêm</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-28">Tổng cộng tiền</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-20">Số ngày nghỉ bù</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-28">Thực thanh toán</th>
              {!isViewOnly && <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10"></th>}
            </tr>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-16">Lương</th>
              <th className="p-2 border border-slate-200 text-center w-16">Phụ cấp</th>
              <th className="p-2 border border-slate-200 text-center w-16">Cộng</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số giờ</th>
              <th className="p-2 border border-slate-200 text-center w-24">Thành tiền</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số giờ</th>
              <th className="p-2 border border-slate-200 text-center w-24">Thành tiền</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số giờ</th>
              <th className="p-2 border border-slate-200 text-center w-24">Thành tiền</th>
              <th className="p-2 border border-slate-200 text-center w-16">Số giờ</th>
              <th className="p-2 border border-slate-200 text-center w-24">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-1 border border-slate-200 text-center">
                  <input type="text" value={row.stt} onChange={(e) => handleRowChange(index, 'stt', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.fullName} onChange={(e) => handleRowChange(index, 'fullName', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.rank} onChange={(e) => handleRowChange(index, 'rank', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" step="0.01" value={row.salaryCoefficient} onChange={(e) => handleRowChange(index, 'salaryCoefficient', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" step="0.01" value={row.allowanceCoefficient} onChange={(e) => handleRowChange(index, 'allowanceCoefficient', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-center bg-slate-50">{row.totalCoefficient}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.monthlySalary} onChange={(e) => handleRowChange(index, 'monthlySalary', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.salaryRate} onChange={(e) => handleRowChange(index, 'salaryRate', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeWorkday.hours} onChange={(e) => handleRowChange(index, 'overtimeWorkday.hours', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeWorkday.amount} onChange={(e) => handleRowChange(index, 'overtimeWorkday.amount', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeWeekend.hours} onChange={(e) => handleRowChange(index, 'overtimeWeekend.hours', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeWeekend.amount} onChange={(e) => handleRowChange(index, 'overtimeWeekend.amount', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeHoliday.hours} onChange={(e) => handleRowChange(index, 'overtimeHoliday.hours', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeHoliday.amount} onChange={(e) => handleRowChange(index, 'overtimeHoliday.amount', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeNight.hours} onChange={(e) => handleRowChange(index, 'overtimeNight.hours', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.overtimeNight.amount} onChange={(e) => handleRowChange(index, 'overtimeNight.amount', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.totalAmount.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.compulsoryLeaveDays} onChange={(e) => handleRowChange(index, 'compulsoryLeaveDays', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-blue-50 text-blue-700">{row.actualPayment.toLocaleString()}</td>
                {!isViewOnly && (
                  <td className="p-1 border border-slate-200 text-center">
                    <button type="button" onClick={() => handleRemoveRow(index)} disabled={rows.length === 1} className="text-red-400 hover:text-red-600 p-1 disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold">
              <td colSpan={16} className="p-2 border border-slate-200 text-right">Cộng</td>
              <td className="p-2 border border-slate-200 text-right">{totals.totalAmount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right text-blue-700">{totals.actualPayment.toLocaleString()}</td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OvertimeForm;
