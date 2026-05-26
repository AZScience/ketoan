import React, { useState, useEffect } from 'react';
import { User, Building2, Type, List, FileText, ClipboardList } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToWords';

import AttachmentField from './AttachmentField';

interface PaymentRequestFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
  totalAmount?: number;
}

const PaymentRequestForm: React.FC<PaymentRequestFormProps> = ({ metadata, onChange, isViewOnly, totalAmount }) => {
  const [formData, setFormData] = useState({
    recipient: metadata?.recipient || '',
    requesterName: metadata?.requesterName || '',
    department: metadata?.department || '',
    reason: metadata?.reason || '',
    amountInWords: metadata?.amountInWords || '',
    attachments: metadata?.attachments || '',
    attachmentFiles: metadata?.attachmentFiles || [],
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
          <FileText size={16} className="text-blue-500" />
          Kính gửi
        </label>
        <input 
          type="text" 
          value={formData.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          disabled={isViewOnly}
          placeholder="VD: Ban Giám đốc Công ty..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-emerald-500" />
            Họ và tên người đề nghị
          </label>
          <input 
            type="text" 
            value={formData.requesterName}
            onChange={(e) => handleChange('requesterName', e.target.value)}
            disabled={isViewOnly}
            placeholder="Nhập họ tên người đề nghị"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 size={16} className="text-indigo-500" />
            Bộ phận (Hoặc địa chỉ)
          </label>
          <input 
            type="text" 
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Phòng Kế hoạch"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <ClipboardList size={16} className="text-amber-500" />
          Nội dung thanh toán
        </label>
        <textarea 
          rows={3}
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          disabled={isViewOnly}
          placeholder="Nhập chi tiết nội dung đề nghị thanh toán..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="space-y-2">
          <AttachmentField 
            attachments={formData.attachments}
            attachmentFiles={formData.attachmentFiles}
            onAttachmentsChange={(val) => handleChange('attachments', val)}
            onFilesChange={(files) => handleChange('attachmentFiles', files)}
            isViewOnly={isViewOnly}
            label="Số chứng từ gốc"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestForm;
