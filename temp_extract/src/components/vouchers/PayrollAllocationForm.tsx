import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Hash, Wallet, Sigma, Briefcase } from 'lucide-react';

interface AllocationRow {
  stt: string;
  targetAccount: string; // Đối tượng sử dụng (Ghi Nợ các TK)
  tk334: {
    salary: number;
    other: number;
    total: number;
  };
  tk338: {
    kpcd: number;
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  tk335: number;
  total: number;
}

interface PayrollAllocationFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PayrollAllocationForm: React.FC<PayrollAllocationFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<AllocationRow[]>(metadata?.rows || [
    {
      stt: '1',
      targetAccount: '',
      tk334: { salary: 0, other: 0, total: 0 },
      tk338: { kpcd: 0, bhxh: 0, bhyt: 0, bhtn: 0, total: 0 },
      tk335: 0,
      total: 0,
    }
  ]);

  useEffect(() => {
    onChange({ ...metadata, rows });
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      targetAccount: '',
      tk334: { salary: 0, other: 0, total: 0 },
      tk338: { kpcd: 0, bhxh: 0, bhyt: 0, bhtn: 0, total: 0 },
      tk335: 0,
      total: 0,
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
    row.tk334.total = (row.tk334.salary || 0) + (row.tk334.other || 0);
    row.tk338.total = (row.tk338.kpcd || 0) + (row.tk338.bhxh || 0) + (row.tk338.bhyt || 0) + (row.tk338.bhtn || 0);
    row.total = row.tk334.total + row.tk338.total + (row.tk335 || 0);

    newRows[index] = row;
    setRows(newRows);
  };

  const totals = rows.reduce((acc, row) => ({
    tk334Total: acc.tk334Total + (row.tk334.total || 0),
    tk338Total: acc.tk338Total + (row.tk338.total || 0),
    total: acc.total + (row.total || 0),
  }), {
    tk334Total: 0,
    tk338Total: 0,
    total: 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Briefcase size={18} className="text-blue-600" />
          Chi tiết phân bổ lương và các khoản trích theo lương
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
        <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10">STT</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-48">Đối tượng sử dụng (Nợ TK)</th>
              <th colSpan={3} className="p-2 border border-slate-200 text-center">TK 334</th>
              <th colSpan={5} className="p-2 border border-slate-200 text-center">TK 338</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-24">TK 335</th>
              <th rowSpan={2} className="p-2 border border-slate-200 text-center w-28">Tổng cộng</th>
              {!isViewOnly && <th rowSpan={2} className="p-2 border border-slate-200 text-center w-10"></th>}
            </tr>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-24">Lương</th>
              <th className="p-2 border border-slate-200 text-center w-24">Khác</th>
              <th className="p-2 border border-slate-200 text-center w-24">Cộng</th>
              <th className="p-2 border border-slate-200 text-center w-20">KPCĐ</th>
              <th className="p-2 border border-slate-200 text-center w-20">BHXH</th>
              <th className="p-2 border border-slate-200 text-center w-20">BHYT</th>
              <th className="p-2 border border-slate-200 text-center w-20">BHTN</th>
              <th className="p-2 border border-slate-200 text-center w-24">Cộng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-1 border border-slate-200 text-center">
                  <input type="text" value={row.stt} onChange={(e) => handleRowChange(index, 'stt', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.targetAccount} onChange={(e) => handleRowChange(index, 'targetAccount', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" placeholder="VD: TK 622" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk334.salary} onChange={(e) => handleRowChange(index, 'tk334.salary', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk334.other} onChange={(e) => handleRowChange(index, 'tk334.other', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.tk334.total.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk338.kpcd} onChange={(e) => handleRowChange(index, 'tk338.kpcd', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk338.bhxh} onChange={(e) => handleRowChange(index, 'tk338.bhxh', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk338.bhyt} onChange={(e) => handleRowChange(index, 'tk338.bhyt', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk338.bhtn} onChange={(e) => handleRowChange(index, 'tk338.bhtn', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.tk338.total.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.tk335} onChange={(e) => handleRowChange(index, 'tk335', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-blue-50 text-blue-700">{row.total.toLocaleString()}</td>
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
              <td colSpan={4} className="p-2 border border-slate-200 text-right">Cộng</td>
              <td className="p-2 border border-slate-200 text-right">{totals.tk334Total.toLocaleString()}</td>
              <td colSpan={4} className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right">{totals.tk338Total.toLocaleString()}</td>
              <td className="p-2 border border-slate-200"></td>
              <td className="p-2 border border-slate-200 text-right text-blue-700">{totals.total.toLocaleString()}</td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollAllocationForm;
