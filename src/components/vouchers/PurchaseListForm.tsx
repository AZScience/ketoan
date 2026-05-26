import React from 'react';
import { User, MapPin, Calendar, FileText } from 'lucide-react';

interface PurchaseListFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PurchaseListForm: React.FC<PurchaseListFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          Họ và tên người bán
        </label>
        <input
          type="text"
          value={metadata?.sellerName || ''}
          onChange={(e) => handleChange('sellerName', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Nhập họ tên người bán..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600" />
          Địa chỉ
        </label>
        <input
          type="text"
          value={metadata?.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Nhập địa chỉ người bán..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Calendar size={16} className="text-amber-600" />
          Thời gian mua
        </label>
        <input
          type="text"
          value={metadata?.purchaseTime || ''}
          onChange={(e) => handleChange('purchaseTime', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Ví dụ: 08:00 ngày 24/03/2026"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPin size={16} className="text-purple-600" />
          Địa điểm mua
        </label>
        <input
          type="text"
          value={metadata?.purchaseLocation || ''}
          onChange={(e) => handleChange('purchaseLocation', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Nhập địa điểm mua hàng..."
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FileText size={16} className="text-slate-600" />
          Ghi chú
        </label>
        <textarea
          value={metadata?.note || ''}
          onChange={(e) => handleChange('note', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-20"
          placeholder="Nhập ghi chú thêm..."
        />
      </div>
    </div>
  );
};

export default PurchaseListForm;
