import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, DollarSign, User, MapPin, Briefcase } from 'lucide-react';

import AttachmentField from './AttachmentField';

interface PaymentListFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const PaymentListForm: React.FC<PaymentListFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    unit: metadata?.unit || '',
    department: metadata?.department || '',
    payerName: metadata?.payerName || '',
    payerAddress: metadata?.payerAddress || '',
    purpose: metadata?.purpose || '',
    amountInWords: metadata?.amountInWords || '',
    originalVouchers: metadata?.originalVouchers || '',
    attachmentFiles: metadata?.attachmentFiles || [],
    rows: metadata?.rows || [{
      voucherNumber: '',
      voucherDate: '',
      description: '',
      amount: 0
    }]
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData(prev => ({ ...prev, rows: newRows }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      rows: [...prev.rows, {
        voucherNumber: '',
        voucherDate: '',
        description: '',
        amount: 0
      }]
    }));
  };

  const removeRow = (index: number) => {
    if (formData.rows.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }));
  };

  const totalAmount = formData.rows.reduce((sum: number, row: any) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Đơn vị
          </label>
          <input 
            type="text" 
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            disabled={isViewOnly}
            placeholder="Tên đơn vị..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Bộ phận
          </label>
          <input 
            type="text" 
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            disabled={isViewOnly}
            placeholder="Tên bộ phận..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Payer Info */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Họ và tên người chi
            </label>
            <input 
              type="text" 
              value={formData.payerName}
              onChange={(e) => handleChange('payerName', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              Bộ phận (hoặc địa chỉ)
            </label>
            <input 
              type="text" 
              value={formData.payerAddress}
              onChange={(e) => handleChange('payerAddress', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Briefcase size={16} className="text-emerald-500" />
            Chi cho công việc
          </label>
          <input 
            type="text" 
            value={formData.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ClipboardList size={16} className="text-orange-500" />
            Chi tiết các khoản chi
          </h3>
          {!isViewOnly && (
            <button onClick={addRow} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Thêm khoản chi
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-3 border-b border-slate-100 w-12 text-center">STT</th>
                <th className="p-3 border-b border-slate-100 w-32">Số hiệu CT</th>
                <th className="p-3 border-b border-slate-100 w-32">Ngày, tháng CT</th>
                <th className="p-3 border-b border-slate-100">Nội dung chi</th>
                <th className="p-3 border-b border-slate-100 w-40 text-right">Số tiền</th>
                {!isViewOnly && <th className="p-3 border-b border-slate-100 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.rows.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="p-3 text-center text-slate-500 font-medium">{index + 1}</td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.voucherNumber}
                      onChange={(e) => handleRowChange(index, 'voucherNumber', e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Số hiệu..."
                      className="w-full p-2 rounded-lg bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.voucherDate}
                      onChange={(e) => handleRowChange(index, 'voucherDate', e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Ngày/tháng..."
                      className="w-full p-2 rounded-lg bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.description}
                      onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nội dung chi tiết..."
                      className="w-full p-2 rounded-lg bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.amount}
                      onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right font-bold text-blue-600"
                    />
                  </td>
                  {!isViewOnly && (
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-slate-50/50 font-bold">
                <td colSpan={4} className="p-3 text-right text-slate-700 uppercase text-[10px] tracking-wider">Tổng cộng</td>
                <td className="p-3 text-right text-blue-700 text-sm">
                  {totalAmount.toLocaleString()}
                </td>
                {!isViewOnly && <td></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            Số tiền bằng chữ
          </label>
          <input 
            type="text" 
            value={formData.amountInWords}
            onChange={(e) => handleChange('amountInWords', e.target.value)}
            disabled={isViewOnly}
            placeholder="Viết bằng chữ..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all italic font-medium"
          />
        </div>
        <div className="space-y-2">
          <AttachmentField 
            attachments={formData.originalVouchers}
            attachmentFiles={formData.attachmentFiles}
            onAttachmentsChange={(val) => handleChange('originalVouchers', val)}
            onFilesChange={(files) => handleChange('attachmentFiles', files)}
            isViewOnly={isViewOnly}
            label="Số chứng từ gốc"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentListForm;
