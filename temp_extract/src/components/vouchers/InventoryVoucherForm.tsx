import React from 'react';
import { Package, FileText, ClipboardList } from 'lucide-react';

interface InventoryVoucherFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const InventoryVoucherForm: React.FC<InventoryVoucherFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Package size={16} className="text-blue-600" />
          Kho (Ngăn lô)
        </label>
        <input
          type="text"
          value={metadata?.warehouse || ''}
          onChange={(e) => handleChange('warehouse', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Nhập tên kho..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FileText size={16} className="text-emerald-600" />
          Địa điểm
        </label>
        <input
          type="text"
          value={metadata?.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Nhập địa điểm..."
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <ClipboardList size={16} className="text-amber-600" />
          Ghi chú / Diễn giải
        </label>
        <textarea
          value={metadata?.note || ''}
          onChange={(e) => handleChange('note', e.target.value)}
          disabled={isViewOnly}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-20"
          placeholder="Nhập ghi chú hoặc diễn giải chi tiết..."
        />
      </div>
    </div>
  );
};

export default InventoryVoucherForm;
