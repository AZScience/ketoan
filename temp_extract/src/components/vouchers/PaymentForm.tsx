import React, { useState, useEffect } from 'react';
import { Book, User, MapPin, MessageSquare, Type, Paperclip, RefreshCw, Coins, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { Autocomplete } from '../ui/Autocomplete';

import AttachmentField from './AttachmentField';

interface PaymentFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
  totalAmount?: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ metadata, onChange, isViewOnly, totalAmount }) => {
  const [formData, setFormData] = useState({
    receiver: metadata?.receiver || '',
    address: metadata?.address || '',
    reason: metadata?.reason || '',
    bookNumber: metadata?.bookNumber || '',
    debitAccount: metadata?.debitAccount || '',
    creditAccount: metadata?.creditAccount || '',
    attachments: metadata?.attachments || '',
    attachmentFiles: metadata?.attachmentFiles || [],
    exchangeRate: metadata?.exchangeRate || '',
    convertedAmount: metadata?.convertedAmount || '',
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
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Book size={16} className="text-blue-500" />
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
        <div className="space-y-2">
          <Autocomplete 
            collectionName="partners"
            searchField="name"
            displayField="name"
            valueField="name"
            label="Người nhận tiền"
            placeholder="Họ và tên người nhận"
            value={formData.receiver}
            onChange={(val, partner) => {
              handleChange('receiver', val);
              if (partner && partner.address) {
                handleChange('address', partner.address);
              }
            }}
            disabled={isViewOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Autocomplete 
            collectionName="accounts"
            searchField="code"
            displayField="name"
            valueField="code"
            label="Tài khoản Nợ"
            placeholder="331"
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
            placeholder="1111"
            value={formData.creditAccount}
            onChange={(val) => handleChange('creditAccount', val)}
            disabled={isViewOnly}
          />
        </div>
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
          placeholder="Địa chỉ người nhận"
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500" />
          Lý do chi
        </label>
        <textarea 
          rows={2}
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          disabled={isViewOnly}
          placeholder="VD: Chi tiền mua văn phòng phẩm..."
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
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <RefreshCw size={16} className="text-indigo-500" />
            Tỷ giá ngoại tệ (nếu có)
          </label>
          <input 
            type="text" 
            value={formData.exchangeRate}
            onChange={(e) => handleChange('exchangeRate', e.target.value)}
            disabled={isViewOnly}
            placeholder="VD: 25.000"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Coins size={16} className="text-yellow-500" />
            Số tiền quy đổi
          </label>
          <input 
            type="text" 
            value={formData.convertedAmount}
            onChange={(e) => handleChange('convertedAmount', e.target.value)}
            disabled={isViewOnly}
            placeholder="Số tiền sau quy đổi"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
