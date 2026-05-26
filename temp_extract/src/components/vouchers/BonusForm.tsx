import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Trophy, Hash, User, Briefcase, Star, DollarSign, FileText } from 'lucide-react';

interface BonusRow {
  stt: string;
  fullName: string;
  rank: string;
  rating: string;
  amount: number;
  note: string;
}

interface BonusFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const BonusForm: React.FC<BonusFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [rows, setRows] = useState<BonusRow[]>(metadata?.rows || [
    {
      stt: '1',
      fullName: '',
      rank: '',
      rating: '',
      amount: 0,
      note: '',
    }
  ]);

  const [period, setPeriod] = useState(metadata?.period || '');

  useEffect(() => {
    onChange({ ...metadata, rows, period });
  }, [rows, period]);

  const handleAddRow = () => {
    setRows([...rows, {
      stt: (rows.length + 1).toString(),
      fullName: '',
      rank: '',
      rating: '',
      amount: 0,
      note: '',
    }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: keyof BonusRow, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const totalAmount = rows.reduce((sum, row) => sum + (row.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            Quý/Kỳ thưởng
          </label>
          <input 
            type="text" 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Quý I năm 2026"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Chi tiết bảng thưởng
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
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold">
              <th className="p-2 border border-slate-200 text-center w-12">
                <div className="flex flex-col items-center gap-1">
                  <Hash size={14} className="text-slate-400" />
                  <span>STT</span>
                </div>
              </th>
              <th className="p-2 border border-slate-200 text-center">
                <div className="flex flex-col items-center gap-1">
                  <User size={14} className="text-emerald-500" />
                  <span>Họ và tên</span>
                </div>
              </th>
              <th className="p-2 border border-slate-200 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Briefcase size={14} className="text-blue-500" />
                  <span>Ngạch bậc lương/Chức vụ</span>
                </div>
              </th>
              <th className="p-2 border border-slate-200 text-center w-32">
                <div className="flex flex-col items-center gap-1">
                  <Star size={14} className="text-amber-500" />
                  <span>Xếp loại thưởng</span>
                </div>
              </th>
              <th className="p-2 border border-slate-200 text-center w-40">
                <div className="flex flex-col items-center gap-1">
                  <DollarSign size={14} className="text-emerald-600" />
                  <span>Số tiền</span>
                </div>
              </th>
              <th className="p-2 border border-slate-200 text-center">
                <div className="flex flex-col items-center gap-1">
                  <FileText size={14} className="text-slate-400" />
                  <span>Ghi chú</span>
                </div>
              </th>
              {!isViewOnly && <th className="p-2 border border-slate-200 text-center w-10"></th>}
            </tr>
            <tr className="bg-slate-100 text-slate-500 text-[10px] text-center">
              <td className="p-1 border border-slate-200">A</td>
              <td className="p-1 border border-slate-200">B</td>
              <td className="p-1 border border-slate-200">C</td>
              <td className="p-1 border border-slate-200">1</td>
              <td className="p-1 border border-slate-200">2</td>
              <td className="p-1 border border-slate-200">E</td>
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
                  <input 
                    type="text" 
                    value={row.fullName}
                    onChange={(e) => handleRowChange(index, 'fullName', e.target.value)}
                    disabled={isViewOnly}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-transparent outline-none"
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
                    type="text" 
                    value={row.rating}
                    onChange={(e) => handleRowChange(index, 'rating', e.target.value)}
                    disabled={isViewOnly}
                    placeholder="A / Xuất sắc"
                    className="w-full text-center bg-transparent outline-none"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="number" 
                    value={row.amount}
                    onChange={(e) => handleRowChange(index, 'amount', parseFloat(e.target.value))}
                    disabled={isViewOnly}
                    className="w-full text-right bg-transparent outline-none font-bold"
                  />
                </td>
                <td className="p-1 border border-slate-200">
                  <input 
                    type="text" 
                    value={row.note}
                    onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                    disabled={isViewOnly}
                    className="w-full bg-transparent outline-none"
                  />
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
              <td colSpan={4} className="p-2 border border-slate-200 text-right uppercase">Cộng</td>
              <td className="p-2 border border-slate-200 text-right text-blue-700">{totalAmount.toLocaleString()}</td>
              <td className="p-2 border border-slate-200"></td>
              {!isViewOnly && <td className="p-2 border border-slate-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BonusForm;
