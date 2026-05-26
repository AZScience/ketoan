import React, { useState, useEffect } from 'react';
import { User, FileText, Warehouse, MapPin, Type, List, Hash, MessageSquare } from 'lucide-react';

import AttachmentField from './AttachmentField';

interface GoodsDeliveredFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const GoodsDeliveredForm: React.FC<GoodsDeliveredFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    receiver: metadata?.receiver || '',
    reason: metadata?.reason || '',
    warehouse: metadata?.warehouse || '',
    location: metadata?.location || '',
    amountInWords: metadata?.amountInWords || '',
    attachments: metadata?.attachments || '',
    attachmentFiles: metadata?.attachmentFiles || [],
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Họ và tên người nhận hàng
          </label>
          <input 
            type="text" 
            value={formData.receiver}
            onChange={(e) => handleChange('receiver', e.target.value)}
            disabled={isViewOnly}
            placeholder="Nhập họ tên người nhận hàng"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MessageSquare size={16} className="text-emerald-500" />
            Lý do xuất kho
          </label>
          <input 
            type="text" 
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: Xuất bán cho khách hàng..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Warehouse size={16} className="text-indigo-500" />
            Xuất tại kho (ngăn lô)
          </label>
          <input 
            type="text" 
            value={formData.warehouse}
            onChange={(e) => handleChange('warehouse', e.target.value)}
            disabled={isViewOnly}
            placeholder="Tên kho/ngăn lô"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            Địa điểm
          </label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={isViewOnly}
            placeholder="Địa chỉ kho"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
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
          placeholder="VD: Mười triệu đồng chẵn"
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

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <List size={14} className="mt-0.5 shrink-0" />
          <span>Lưu ý: Các mặt hàng chi tiết sẽ được lấy từ phần <b>Chi tiết hạch toán</b> bên dưới. Vui lòng nhập đầy đủ Mã hàng, Đơn vị tính và Số lượng thực xuất vào cột Diễn giải hoặc ghi chú nếu cần.</span>
        </p>
      </div>
    </div>
  );
};

export default GoodsDeliveredForm;
