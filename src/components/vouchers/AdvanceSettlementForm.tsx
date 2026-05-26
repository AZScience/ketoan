import React, { useState, useEffect } from 'react';
import { User, MapPin, List, Plus, Trash2, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';

interface AdvanceSettlementFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AdvanceSettlementForm: React.FC<AdvanceSettlementFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    department: metadata?.department || '',
    requesterName: metadata?.requesterName || '',
    address: metadata?.address || '',
    advanceItems: metadata?.advanceItems || [
      { description: '1. Số tạm ứng các kỳ trước chưa chi hết', amount: 0, note: '' },
      { description: '2. Số tạm ứng kỳ này', amount: 0, note: '' },
    ],
    expenseItems: metadata?.expenseItems || [
      { description: '1. Chứng từ số ... ngày ...', amount: 0, note: '' },
    ],
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (type: 'advance' | 'expense') => {
    if (type === 'advance') {
      setFormData(prev => ({
        ...prev,
        advanceItems: [...prev.advanceItems, { description: '', amount: 0, note: '' }]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expenseItems: [...prev.expenseItems, { description: '', amount: 0, note: '' }]
      }));
    }
  };

  const handleRemoveItem = (type: 'advance' | 'expense', index: number) => {
    if (type === 'advance') {
      setFormData(prev => ({
        ...prev,
        advanceItems: prev.advanceItems.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expenseItems: prev.expenseItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleItemChange = (type: 'advance' | 'expense', index: number, field: string, value: any) => {
    if (type === 'advance') {
      const newItems = [...formData.advanceItems];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData(prev => ({ ...prev, advanceItems: newItems }));
    } else {
      const newItems = [...formData.expenseItems];
      newItems[index] = { ...newItems[index], [field]: value };
      setFormData(prev => ({ ...prev, expenseItems: newItems }));
    }
  };

  const totalAdvance = formData.advanceItems.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const totalExpense = formData.expenseItems.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
  const difference = totalAdvance - totalExpense;

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            Họ và tên người thanh toán
          </label>
          <input 
            type="text" 
            value={formData.requesterName}
            onChange={(e) => handleChange('requesterName', e.target.value)}
            disabled={isViewOnly}
            placeholder="Họ và tên"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Bộ phận (hoặc địa chỉ)
          </label>
          <input 
            type="text" 
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isViewOnly}
            placeholder="Địa chỉ hoặc bộ phận"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* I. Số tiền tạm ứng */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightCircle size={18} className="text-emerald-600" />
            I. Số tiền tạm ứng
          </h3>
          {!isViewOnly && (
            <button type="button" onClick={() => handleAddItem('advance')} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm dòng
            </button>
          )}
        </div>
        <div className="space-y-2">
          {formData.advanceItems.map((item: any, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={item.description}
                onChange={(e) => handleItemChange('advance', index, 'description', e.target.value)}
                disabled={isViewOnly}
                placeholder="Diễn giải"
                className="flex-[2] p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm"
              />
              <input 
                type="text" 
                value={item.note}
                onChange={(e) => handleItemChange('advance', index, 'note', e.target.value)}
                disabled={isViewOnly}
                placeholder="Ghi chú"
                className="flex-1 p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm"
              />
              <input 
                type="number" 
                value={item.amount}
                onChange={(e) => handleItemChange('advance', index, 'amount', e.target.value)}
                disabled={isViewOnly}
                className="w-32 p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm text-right"
              />
              {!isViewOnly && (
                <button type="button" onClick={() => handleRemoveItem('advance', index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-between p-2 bg-emerald-50 rounded-lg font-bold text-emerald-700 text-sm">
            <span>Cộng (I):</span>
            <span>{totalAdvance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* II. Số tiền đã chi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftCircle size={18} className="text-red-600" />
            II. Số tiền đã chi
          </h3>
          {!isViewOnly && (
            <button type="button" onClick={() => handleAddItem('expense')} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm dòng
            </button>
          )}
        </div>
        <div className="space-y-2">
          {formData.expenseItems.map((item: any, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={item.description}
                onChange={(e) => handleItemChange('expense', index, 'description', e.target.value)}
                disabled={isViewOnly}
                placeholder="Diễn giải chứng từ"
                className="flex-[2] p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm"
              />
              <input 
                type="text" 
                value={item.note}
                onChange={(e) => handleItemChange('expense', index, 'note', e.target.value)}
                disabled={isViewOnly}
                placeholder="Ghi chú"
                className="flex-1 p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm"
              />
              <input 
                type="number" 
                value={item.amount}
                onChange={(e) => handleItemChange('expense', index, 'amount', e.target.value)}
                disabled={isViewOnly}
                className="w-32 p-2 rounded-lg bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none text-sm text-right"
              />
              {!isViewOnly && (
                <button type="button" onClick={() => handleRemoveItem('expense', index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-between p-2 bg-red-50 rounded-lg font-bold text-red-700 text-sm">
            <span>Cộng (II):</span>
            <span>{totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* III. Chênh lệch */}
      <div className="p-4 bg-slate-100 rounded-2xl space-y-2">
        <h3 className="font-bold text-slate-900">III. Chênh lệch (I - II)</h3>
        <div className="flex justify-between text-sm">
          <span>1. Số tạm ứng chi không hết (nộp lại quỹ):</span>
          <span className="font-bold">{difference > 0 ? difference.toLocaleString() : 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>2. Chi quá số tạm ứng (được chi thêm):</span>
          <span className="font-bold">{difference < 0 ? Math.abs(difference).toLocaleString() : 0}</span>
        </div>
      </div>
    </div>
  );
};

export default AdvanceSettlementForm;
