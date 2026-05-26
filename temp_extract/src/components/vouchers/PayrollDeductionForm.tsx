import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Hash, Calendar, Wallet, Percent, PlusCircle, MinusCircle, Sigma } from 'lucide-react';

interface DeductionRow {
  stt: string;
  month: string;
  totalSalaryFund: number;
  insurance: {
    total: number;
    expense: number;
    salaryDeduction: number;
  };
  unionFee: {
    total: number;
    upperLevel: number;
    retained: number;
  };
}

interface PayrollDeductionFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PayrollDeductionForm: React.FC<PayrollDeductionFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<DeductionRow[]>(metadata?.rows || [
    {
      stt: '1',
      month: '',
      totalSalaryFund: 0,
      insurance: { total: 0, expense: 0, salaryDeduction: 0 },
      unionFee: { total: 0, upperLevel: 0, retained: 0 },
    }
  ]);

  useEffect(() => {
    onChange({ ...metadata, rows });
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      month: '',
      totalSalaryFund: 0,
      insurance: { total: 0, expense: 0, salaryDeduction: 0 },
      unionFee: { total: 0, upperLevel: 0, retained: 0 },
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
    row.insurance.total = (row.insurance.expense || 0) + (row.insurance.salaryDeduction || 0);
    row.unionFee.total = (row.unionFee.upperLevel || 0) + (row.unionFee.retained || 0);

    newRows[index] = row;
    setRows(newRows);
  };

  const totals = rows.reduce((acc, row) => ({
    totalSalaryFund: acc.totalSalaryFund + (row.totalSalaryFund || 0),
    insuranceTotal: acc.insuranceTotal + (row.insurance.total || 0),
    unionFeeTotal: acc.unionFeeTotal + (row.unionFee.total || 0),
  }), {
    totalSalaryFund: 0,
    insuranceTotal: 0,
    unionFeeTotal: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Percent size={18} className="text-blue-600" />
          Chi tiết trích nộp theo lương
        </h3>
        {!isViewOnly && (
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Thêm dòng
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10">STT</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-32">Số tháng trích</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-32">Tổng quỹ lương trích</th>
              <th colSpan={3} className="p-2 border border-slate-200 text-center">BHXH, BHYT, BHTN</th>
              <th colSpan={3} className="p-2 border border-slate-200 text-center">KPCĐ</th>
              {!isViewOnly && <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10"></th>}
            </tr>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-24">Tổng số</th>
              <th className="p-2 border border-slate-200 text-center w-24">Trích vào CP</th>
              <th className="p-2 border border-slate-200 text-center w-24">Trừ vào lương</th>
              <th className="p-2 border border-slate-200 text-center w-24">Tổng số</th>
              <th className="p-2 border border-slate-200 text-center w-24">Nộp cấp trên</th>
              <th className="p-2 border border-slate-200 text-center w-24">Để lại đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-1 border border-slate-200 text-center">
                  <input type="text" value={row.stt} onChange={(e) => handleRowChange(index, 'stt', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.month} onChange={(e) => handleRowChange(index, 'month', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" placeholder="Tháng 01" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.totalSalaryFund} onChange={(e) => handleRowChange(index, 'totalSalaryFund', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.insurance.total.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.insurance.expense} onChange={(e) => handleRowChange(index, 'insurance.expense', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.insurance.salaryDeduction} onChange={(e) => handleRowChange(index, 'insurance.salaryDeduction', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.unionFee.total.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.unionFee.upperLevel} onChange={(e) => handleRowChange(index, 'unionFee.upperLevel', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.unionFee.retained} onChange={(e) => handleRowChange(index, 'unionFee.retained', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
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
              <td colSpan={2} className="p-2 border border-slate-200 text-right">Cộng</td>
              <td className="p-2 border border-slate-200 text-right">{totals.totalSalaryFund.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.insuranceTotal.toLocaleString()}</td>
              <td colSpan={2} className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right">{totals.unionFeeTotal.toLocaleString()}</td>
              <td colSpan={2} className="p-2 border border-slate-200"></td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollDeductionForm;
