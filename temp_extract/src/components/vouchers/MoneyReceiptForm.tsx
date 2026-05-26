import React, { useState, useEffect } from 'react';
import { User, MapPin, MessageSquare, Type } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToWords';

interface MoneyReceiptFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
  totalAmount?: number;
}

const MoneyReceiptForm: React.FC<MoneyReceiptFormProps> = ({ metadata, onChange, isViewOnly, totalAmount }) => {
  const [formData, setFormData] = useState({
    payer: metadata?.payer || '',
    address: metadata?.address || '',
    reason: metadata?.reason || '',
    amountInWords: metadata?.amountInWords || '',
    bookNumber: metadata?.bookNumber || '',
  });

  useEffect(() => {
    if (totalAmount !== undefined && !isViewOnly) {
      const words = numberToVietnameseWords(totalAmount);
      if (words !== formData.amountInWords) {
        setFormData(prev => ({ ...prev, amountInWords: words }));
      }
    }
  }, [totalAmount, isViewOnly]);

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <User size={16} className="text-emerald-500" />
          Họ và tên người nộp tiền
        </label>
        <input 
          type="text" 
          value={formData.payer}
          onChange={(e) => handleChange('payer', e.target.value)}
          disabled={isViewOnly}
          placeholder="Họ và tên người nộp"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Địa chỉ
          </label>
          <input 
            type="text" 
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isViewOnly}
            placeholder="Địa chỉ người nộp"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Type size={16} className="text-blue-500" />
            Quyển số
          </label>
          <input 
            type="text" 
            value={formData.bookNumber}
            onChange={(e) => handleChange('bookNumber', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: 01"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500" />
          Nội dung thu
        </label>
        <textarea 
          rows={2}
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          disabled={isViewOnly}
          placeholder="VD: Thu tiền học phí, thu tiền tạm ứng..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
        />
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
          placeholder="VD: Một triệu đồng chẵn"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default MoneyReceiptForm;
