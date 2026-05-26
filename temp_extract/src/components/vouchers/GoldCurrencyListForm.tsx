import React, { useState, useEffect } from 'react';
import { FileText, Book, Hash, User, Type, Building2, MapPin, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { Autocomplete } from '../ui/Autocomplete';

interface GoldCurrencyListFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
  totalAmount?: number;
}

const GoldCurrencyListForm: React.FC<GoldCurrencyListFormProps> = ({ metadata, onChange, isViewOnly, totalAmount }) => {
  const [formData, setFormData] = useState({
    companyName: metadata?.companyName || '',
    address: metadata?.address || '',
    attachedToVoucher: metadata?.attachedToVoucher || '',
    bookNumber: metadata?.bookNumber || '',
    department: metadata?.department || '',
    receiver: metadata?.receiver || '',
    receiverAddress: metadata?.receiverAddress || '',
    debitAccount: metadata?.debitAccount || '',
    creditAccount: metadata?.creditAccount || '',
    amountInWords: metadata?.amountInWords || '',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Đơn vị
            </label>
            <input 
              type="text" 
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={isViewOnly}
              placeholder="Tên đơn vị"
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
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
              placeholder="Địa chỉ đơn vị"
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Hash size={16} className="text-purple-500" />
                Bộ phận
              </label>
              <input 
                type="text" 
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={isViewOnly}
                placeholder="Bộ phận"
                className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Book size={16} className="text-emerald-500" />
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
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Autocomplete 
                collectionName="accounts"
                searchField="code"
                displayField="name"
                valueField="code"
                label="Tài khoản Nợ"
                placeholder="111"
                value={formData.debitAccount}
                onChange={(val) => handleChange('debitAccount', val)}
                disabled={isViewOnly}
              />
            </div>
            <div className="space-y-2">
              <Autocomplete 
                collectionName="accounts"
                searchField="code"
                displayField="name"
                valueField="code"
                label="Tài khoản Có"
                placeholder="112"
                value={formData.creditAccount}
                onChange={(val) => handleChange('creditAccount', val)}
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              Đính kèm phiếu số
            </label>
            <input 
              type="text" 
              value={formData.attachedToVoucher}
              onChange={(e) => handleChange('attachedToVoucher', e.target.value)}
              disabled={isViewOnly}
              placeholder="VD: PT001"
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-indigo-500" />
              Họ tên người nộp (nhận)
            </label>
            <input 
              type="text" 
              value={formData.receiver}
              onChange={(e) => handleChange('receiver', e.target.value)}
              disabled={isViewOnly}
              placeholder="Họ và tên người nộp/nhận"
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <MapPin size={16} className="text-slate-500" />
            Địa chỉ người nộp (nhận)
          </label>
          <input 
            type="text" 
            value={formData.receiverAddress}
            onChange={(e) => handleChange('receiverAddress', e.target.value)}
            disabled={isViewOnly}
            placeholder="Địa chỉ người nộp/nhận..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Type size={16} className="text-amber-500" />
            Số tiền bằng chữ
          </label>
          <input 
            type="text" 
            value={formData.amountInWords}
            onChange={(e) => handleChange('amountInWords', e.target.value)}
            disabled={isViewOnly}
            placeholder="Nhập số tiền bằng chữ..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default GoldCurrencyListForm;
