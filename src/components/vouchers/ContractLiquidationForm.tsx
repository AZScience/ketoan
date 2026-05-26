import React from 'react';
import { User, FileText, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

interface ContractLiquidationFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const ContractLiquidationForm: React.FC<ContractLiquidationFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
            <User size={16} className="text-blue-600" />
            Bên giao khoán
          </h4>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên đại diện</label>
            <input
              type="text"
              value={metadata?.giverName || ''}
              onChange={(e) => handleChange('giverName', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập tên..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
            <User size={16} className="text-emerald-600" />
            Bên nhận khoán
          </h4>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên đại diện</label>
            <input
              type="text"
              value={metadata?.receiverName || ''}
              onChange={(e) => handleChange('receiverName', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập tên..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <FileText size={18} className="text-amber-600" />
          Thông tin thanh lý
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Cùng thanh lý Hợp đồng số</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={metadata?.contractNumber || ''}
                onChange={(e) => handleChange('contractNumber', e.target.value)}
                disabled={isViewOnly}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Số hợp đồng..."
              />
              <input
                type="date"
                value={metadata?.contractDate || ''}
                onChange={(e) => handleChange('contractDate', e.target.value)}
                disabled={isViewOnly}
                className="w-48 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nội dung công việc đã thực hiện</label>
            <textarea
              value={metadata?.jobDone || ''}
              onChange={(e) => handleChange('jobDone', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-24"
              placeholder="Nhập nội dung..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <Wallet size={18} className="text-indigo-600" />
            Giá trị thanh toán
          </h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Giá trị hợp đồng đã thực hiện</label>
              <input
                type="number"
                value={metadata?.contractValue || 0}
                onChange={(e) => handleChange('contractValue', parseFloat(e.target.value))}
                disabled={isViewOnly}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Số tiền đã thanh toán</label>
              <input
                type="number"
                value={metadata?.paidAmount || 0}
                onChange={(e) => handleChange('paidAmount', parseFloat(e.target.value))}
                disabled={isViewOnly}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Số tiền bị phạt do vi phạm</label>
              <input
                type="number"
                value={metadata?.penaltyAmount || 0}
                onChange={(e) => handleChange('penaltyAmount', parseFloat(e.target.value))}
                disabled={isViewOnly}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Số tiền còn phải thanh toán</label>
              <input
                type="number"
                value={metadata?.remainingAmount || 0}
                onChange={(e) => handleChange('remainingAmount', parseFloat(e.target.value))}
                disabled={isViewOnly}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Kết luận
          </h4>
          <textarea
            value={metadata?.conclusion || ''}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            disabled={isViewOnly}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-full min-h-[200px]"
            placeholder="Nhập kết luận..."
          />
        </div>
      </div>
    </div>
  );
};

export default ContractLiquidationForm;
