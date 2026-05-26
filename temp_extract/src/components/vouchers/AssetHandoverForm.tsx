import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Hash, Box, User, Briefcase, FileText, ClipboardList } from 'lucide-react';

interface AssetRow {
  stt: string;
  assetName: string;
  assetCode: string;
  unit: string;
  quantity: number;
  originalPrice: number;
  depreciation: number;
  remainingValue: number;
}

interface AssetHandoverFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AssetHandoverForm: React.FC<AssetHandoverFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<AssetRow[]>(metadata?.rows || [
    {
      stt: '1',
      assetName: '',
      assetCode: '',
      unit: '',
      quantity: 0,
      originalPrice: 0,
      depreciation: 0,
      remainingValue: 0,
    }
  ]);

  useEffect(() => {
    onChange({ ...metadata, rows });
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      assetName: '',
      assetCode: '',
      unit: '',
      quantity: 0,
      originalPrice: 0,
      depreciation: 0,
      remainingValue: 0,
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
    row.remainingValue = (row.originalPrice || 0) - (row.depreciation || 0);

    newRows[index] = row;
    setRows(newRows);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Bên giao (Họ tên, bộ phận)
            </label>
            <input
              type="text"
              value={metadata?.giverInfo || ''}
              onChange={(e) => onChange({ ...metadata, giverInfo: e.target.value })}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập thông tin bên giao..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              Bên nhận (Họ tên, bộ phận)
            </label>
            <input
              type="text"
              value={metadata?.receiverInfo || ''}
              onChange={(e) => onChange({ ...metadata, receiverInfo: e.target.value })}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập thông tin bên nhận..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-amber-600" />
            Lý do bàn giao
          </label>
          <input
            type="text"
            value={metadata?.reason || ''}
            onChange={(e) => onChange({ ...metadata, reason: e.target.value })}
            disabled={isViewOnly}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Nhập lý do bàn giao..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Box size={18} className="text-blue-600" />
          Danh sách tài sản bàn giao
        </h3>
        {!isViewOnly && (
          <button 
            type="button"
            onClick={handleAddRow}
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Thêm tài sản
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-10">STT</th>
              <th className="p-2 border border-slate-200 text-center w-48">Tên tài sản</th>
              <th className="p-2 border border-slate-200 text-center w-24">Mã số</th>
              <th className="p-2 border border-slate-200 text-center w-20">ĐVT</th>
              <th className="p-2 border border-slate-200 text-center w-20">Số lượng</th>
              <th className="p-2 border border-slate-200 text-center w-28">Nguyên giá</th>
              <th className="p-2 border border-slate-200 text-center w-28">Hao mòn lũy kế</th>
              <th className="p-2 border border-slate-200 text-center w-28">Giá trị còn lại</th>
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
                  <input type="text" value={row.assetName} onChange={(e) => handleRowChange(index, 'assetName', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.assetCode} onChange={(e) => handleRowChange(index, 'assetCode', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={row.unit} onChange={(e) => handleRowChange(index, 'unit', e.target.value)} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.quantity} onChange={(e) => handleRowChange(index, 'quantity', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-center bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.originalPrice} onChange={(e) => handleRowChange(index, 'originalPrice', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={row.depreciation} onChange={(e) => handleRowChange(index, 'depreciation', parseFloat(e.target.value))} disabled={isViewOnly} className="w-full text-right bg-transparent outline-none" />
                </td>
                <td className="p-1 border border-slate-200 text-right font-bold bg-blue-50 text-blue-700">{row.remainingValue.toLocaleString()}</td>
                {!isViewOnly && (
                  <td className="p-1 border border-slate-200 text-center">
                    <button type="button" onClick={() => handleRemoveRow(index)} disabled={rows.length === 1} className="text-red-400 hover:text-red-600 p-1 disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetHandoverForm;
