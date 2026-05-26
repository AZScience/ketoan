import React, { useState, useEffect } from 'react';
import { User, MapPin, MessageSquare, Type, Clock, Building, Users, DollarSign } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToWords';

interface AdvanceRequestFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
  totalAmount?: number;
}

const AdvanceRequestForm: React.FC<AdvanceRequestFormProps> = ({ metadata, onChange, isViewOnly, totalAmount }) => {
  const [formData, setFormData] = useState({
    department: metadata?.department || '',
    recipient: metadata?.recipient || '',
    requesterName: metadata?.requesterName || '',
    address: metadata?.address || '',
    amount: metadata?.amount || 0,
    amountInWords: metadata?.amountInWords || '',
    reason: metadata?.reason || '',
    deadline: metadata?.deadline || '',
  });

  useEffect(() => {
    if (totalAmount !== undefined && !isViewOnly) {
      const words = numberToVietnameseWords(totalAmount);
      setFormData(prev => ({ 
        ...prev, 
        amount: totalAmount,
        amountInWords: words 
      }));
    }
  }, [totalAmount, isViewOnly]);

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'amount' && !isViewOnly) {
        const numValue = parseFloat(value) || 0;
        updated.amountInWords = numberToVietnameseWords(numValue);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            Bộ phận
          </label>
          <input 
            type="text" 
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Phòng Kế toán"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building size={16} className="text-emerald-500" />
            Kính gửi
          </label>
          <input 
            type="text" 
            value={formData.recipient}
            onChange={(e) => handleChange('recipient', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Ban Giám đốc"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            Tên tôi là
          </label>
          <input 
            type="text" 
            value={formData.requesterName}
            onChange={(e) => handleChange('requesterName', e.target.value)}
            disabled={isViewOnly}
            placeholder="Họ và tên người đề nghị"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Địa chỉ/Bộ phận
          </label>
          <input 
            type="text" 
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isViewOnly}
            placeholder="Địa chỉ hoặc bộ phận công tác"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            Số tiền
          </label>
          <div className="relative">
            <input 
              type="number" 
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              disabled={isViewOnly || totalAmount !== undefined}
              placeholder="0"
              className="w-full p-3 pr-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              VNĐ
            </span>
          </div>
          {totalAmount !== undefined && (
            <p className="text-[10px] text-slate-400 italic">
              * Số tiền được tính tự động từ danh sách mặt hàng
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Type size={16} className="text-purple-500" />
            Số tiền bằng chữ
          </label>
          <input 
            type="text" 
            value={formData.amountInWords}
            onChange={(e) => handleChange('amountInWords', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Năm triệu đồng chẵn"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500" />
          Lý do tạm ứng
        </label>
        <textarea 
          rows={2}
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          disabled={isViewOnly}
          placeholder="VD: Đi công tác TP.HCM từ ngày..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Clock size={16} className="text-slate-500" />
          Thời hạn thanh toán
        </label>
        <input 
          type="text" 
          value={formData.deadline}
          onChange={(e) => handleChange('deadline', e.target.value)}
          disabled={isViewOnly}
          placeholder="VD: Ngày 30/04/2026"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default AdvanceRequestForm;
