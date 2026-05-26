import React, { useState, useEffect } from 'react';
import { User, FileText, Warehouse, MapPin, Type, List, Hash, MessageSquare } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';

import AttachmentField from './AttachmentField';

interface GoodsIssuedFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const GoodsIssuedForm: React.FC<GoodsIssuedFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    receiver: metadata?.receiver || '',
    reason: metadata?.reason || '',
    warehouse: metadata?.warehouse || '',
    location: metadata?.location || '',
    amountInWords: metadata?.amountInWords || '',
    originalDocsCount: metadata?.originalDocsCount || '',
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
          <Autocomplete 
            collectionName="partners"
            searchField="name"
            displayField="name"
            valueField="name"
            label="Họ và tên người nhận hàng"
            placeholder="Nhập họ tên người nhận hàng"
            value={formData.receiver}
            onChange={(val) => handleChange('receiver', val)}
            disabled={isViewOnly}
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
            placeholder="VD: Xuất cho sản xuất, xuất chuyển kho..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Autocomplete 
            collectionName="warehouses"
            searchField="name"
            displayField="name"
            valueField="name"
            label="Xuất tại kho (ngăn lô)"
            placeholder="Tên kho/ngăn lô"
            value={formData.warehouse}
            onChange={(val, wh) => {
              handleChange('warehouse', val);
              if (wh) {
                handleChange('location', wh.address || '');
              }
            }}
            disabled={isViewOnly}
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
          attachments={formData.originalDocsCount}
          attachmentFiles={formData.attachmentFiles}
          onAttachmentsChange={(val) => handleChange('originalDocsCount', val)}
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

export default GoodsIssuedForm;
