import React, { useState, useEffect } from 'react';
import { User, FileText, Warehouse, MapPin, Type, List, Hash } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';

import AttachmentField from './AttachmentField';

interface GoodsReceivedFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const GoodsReceivedForm: React.FC<GoodsReceivedFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    deliverer: metadata?.deliverer || '',
    referenceDoc: metadata?.referenceDoc || '',
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
          <Autocomplete 
            collectionName="partners"
            searchField="name"
            displayField="name"
            valueField="name"
            label="Họ và tên người giao"
            placeholder="Nhập họ tên người giao hàng"
            value={formData.deliverer}
            onChange={(val) => handleChange('deliverer', val)}
            disabled={isViewOnly}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-emerald-500" />
            Theo (Hợp đồng/Hóa đơn số...)
          </label>
          <input 
            type="text" 
            value={formData.referenceDoc}
            onChange={(e) => handleChange('referenceDoc', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: HĐ số 123 ngày 01/01/2026"
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
            label="Nhập tại kho"
            placeholder="Tên kho nhập"
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
          <span>Lưu ý: Các mặt hàng chi tiết sẽ được lấy từ phần <b>Chi tiết hạch toán</b> bên dưới. Vui lòng nhập đầy đủ Mã hàng, Đơn vị tính và Số lượng thực nhập vào cột Diễn giải hoặc ghi chú nếu cần.</span>
        </p>
      </div>
    </div>
  );
};

export default GoodsReceivedForm;
