import React, { useState, useEffect } from 'react';
import { User, FileText, CreditCard, MapPin, Type, List, Hash, Calendar, Tag } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';

interface PurchaseFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: metadata?.invoiceNumber || '',
    invoiceDate: metadata?.invoiceDate || '',
    invoiceSerial: metadata?.invoiceSerial || '',
    supplierCode: metadata?.supplierCode || '',
    supplierName: metadata?.supplierName || '',
    supplierTaxCode: metadata?.supplierTaxCode || '',
    supplierAddress: metadata?.supplierAddress || '',
    paymentMethod: metadata?.paymentMethod || 'Chuyển khoản',
    amountInWords: metadata?.amountInWords || '',
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Hash size={16} className="text-blue-500" />
            Số hóa đơn mua vào
          </label>
          <input 
            type="text" 
            value={formData.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: 0001234"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-indigo-500" />
            Ký hiệu
          </label>
          <input 
            type="text" 
            value={formData.invoiceSerial}
            onChange={(e) => handleChange('invoiceSerial', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: C23TBB"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-500" />
            Ngày hóa đơn
          </label>
          <input 
            type="date" 
            value={formData.invoiceDate}
            onChange={(e) => handleChange('invoiceDate', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Autocomplete 
            collectionName="partners"
            searchField="code"
            displayField="name"
            valueField="code"
            label="Mã nhà cung cấp"
            placeholder="Tìm theo mã hoặc tên..."
            value={formData.supplierCode}
            onChange={(val, partner) => {
              handleChange('supplierCode', val);
              if (partner) {
                handleChange('supplierName', partner.name);
                handleChange('supplierTaxCode', partner.taxId || '');
                handleChange('supplierAddress', partner.address || '');
              }
            }}
            disabled={isViewOnly}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Tên nhà cung cấp
          </label>
          <input 
            type="text" 
            value={formData.supplierName}
            onChange={(e) => handleChange('supplierName', e.target.value)}
            disabled={isViewOnly}
            placeholder="Tên đơn vị bán hàng"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Hash size={16} className="text-slate-500" />
            Mã số thuế NCC
          </label>
          <input 
            type="text" 
            value={formData.supplierTaxCode}
            onChange={(e) => handleChange('supplierTaxCode', e.target.value)}
            disabled={isViewOnly}
            placeholder="Mã số thuế nhà cung cấp"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <CreditCard size={16} className="text-amber-500" />
            Hình thức thanh toán
          </label>
          <select 
            value={formData.paymentMethod}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          >
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Đối trừ công nợ">Đối trừ công nợ</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          Địa chỉ NCC
        </label>
        <input 
          type="text" 
          value={formData.supplierAddress}
          onChange={(e) => handleChange('supplierAddress', e.target.value)}
          disabled={isViewOnly}
          placeholder="Địa chỉ nhà cung cấp"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
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
          placeholder="VD: Năm triệu đồng chẵn"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <List size={14} className="mt-0.5 shrink-0" />
          <span>Lưu ý: Chi tiết hàng hóa mua vào sẽ được nhập ở phần <b>Chi tiết hạch toán</b> bên dưới. Hệ thống sẽ tự động tính toán Thuế GTGT đầu vào được khấu trừ.</span>
        </p>
      </div>
    </div>
  );
};

export default PurchaseForm;
