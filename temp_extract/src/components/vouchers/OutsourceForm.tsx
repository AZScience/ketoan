import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Hash, User, Briefcase, FileText, Wallet, CreditCard } from 'lucide-react';

interface OutsourceRow {
  stt: string;
  fullName: string;
  idNumber: string; // CCCD/MST
  jobContent: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxWithheld: number;
  netAmount: number;
}

interface OutsourceFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const OutsourceForm: React.FC<OutsourceFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<OutsourceRow[]>(metadata?.rows || [
    {
      stt: '1',
      fullName: '',
      idNumber: '',
      jobContent: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      taxWithheld: 0,
      netAmount: 0,
    }
  ]);

  useEffect(() => {
    onChange({ ...metadata, rows });
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      fullName: '',
      idNumber: '',
      jobContent: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      taxWithheld: 0,
      netAmount: 0,
    }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    const row = { ...newRows[index] };

    (row as any)[field] = value;

    // Recalculate
    row.amount = (row.quantity || 0) * (row.unitPrice || 0);
    row.netAmount = row.amount - (row.taxWithheld || 0);

    newRows[index] = row;
    setRows(newRows);
  };

  const totals = rows.reduce((acc, row) => ({
    amount: acc.amount + (row.amount || 0),
    taxWithheld: acc.taxWithheld + (row.taxWithheld || 0),
    netAmount: acc.netAmount + (row.netAmount || 0),
  }), {
    amount: 0,
    taxWithheld: 0,
    netAmount: 0,
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Họ và tên người thuê
            </label>
            <input
              type="text"
              value={metadata?.employerName || ''}
              onChange={(e) => onChange({ ...metadata, employerName: e.target.value })}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập tên người thuê..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-600" />
              Bộ phận (hoặc địa chỉ)
            </label>
            <input
              type="text"
              value={metadata?.department || ''}
              onChange={(e) => onChange({ ...metadata, department: e.target.value })}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập bộ phận..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-amber-600" />
            Đã thuê những công việc sau để
          </label>
          <input
            type="text"
            value={metadata?.purpose || ''}
            onChange={(e) => onChange({ ...metadata, purpose: e.target.value })}
            disabled={isViewOnly}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Nhập mục đích thuê..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          Danh sách người được thuê
        </h3>
        {!isViewOnly && (
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Thêm người
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-10">STT</th>
              <th className="p-2 border border-slate-200 text-center w-48">Họ và tên người được thuê</th>
              <th className="p-2 border border-slate-200 text-center w-32">CCCD/MST TNCN</th>
              <th className="p-2 border border-slate-200 text-center">Nội dung công việc</th>
              <th className="p-2 border border-slate-200 text-center w-24">Số công/KL</th>
              <th className="p-2 border border-slate-200 text-center w-28">Đơn giá</th>
              <th className="p-2 border border-slate-200 text-center w-28">Thành tiền</th>
              <th className="p-2 border border-slate-200 text-center w-28">Thuế khấu trừ</th>
              <th className="p-2 border border-slate-200 text-center w-28">Số tiền còn lại</th>
              {!isViewOnly && <th className="p-2 border border-slate-200 text-center w-10"></th>}
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
                  <input type="text" value={row.idNumber} onChange={(e) => handleRowChange(index, 'idNumber', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.jobContent} onChange={(e) => handleRowChange(index, 'jobContent', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.quantity} onChange={(e) => handleRowChange(index, 'quantity', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.unitPrice} onChange={(e) => handleRowChange(index, 'unitPrice', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-slate-50">{row.amount.toLocaleString()}</td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.taxWithheld} onChange={(e) => handleRowChange(index, 'taxWithheld', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-blue-50 text-blue-700">{row.netAmount.toLocaleString()}</td>
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
              <td colSpan={6} className="p-2 border border-slate-200 text-right">Cộng</td>
              <td className="p-2 border border-slate-200 text-right">{totals.amount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right">{totals.taxWithheld.toLocaleString()}</td>
              <td className="p-2 border border-slate-200 text-right text-blue-700">{totals.netAmount.toLocaleString()}</td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutsourceForm;
