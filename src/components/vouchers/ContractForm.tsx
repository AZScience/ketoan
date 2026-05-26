import React from 'react';
import { User, Briefcase, FileText, ShieldCheck, ListChecks } from 'lucide-react';

interface ContractFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const ContractForm: React.FC<ContractFormProps> = ({ metadata, onChange, isViewOnly }) => {
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Chức vụ</label>
            <input
              type="text"
              value={metadata?.giverPosition || ''}
              onChange={(e) => handleChange('giverPosition', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập chức vụ..."
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Chức vụ</label>
            <input
              type="text"
              value={metadata?.receiverPosition || ''}
              onChange={(e) => handleChange('receiverPosition', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập chức vụ..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-600" />
          I- Điều khoản chung
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Phương thức giao khoán</label>
            <textarea
              value={metadata?.method || ''}
              onChange={(e) => handleChange('method', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-20"
              placeholder="Nhập phương thức..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Điều kiện thực hiện</label>
            <textarea
              value={metadata?.conditions || ''}
              onChange={(e) => handleChange('conditions', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-20"
              placeholder="Nhập điều kiện..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Thời gian thực hiện</label>
            <input
              type="text"
              value={metadata?.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="VD: Từ 01/01/2026 đến 31/03/2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Các điều kiện khác</label>
            <input
              type="text"
              value={metadata?.otherTerms || ''}
              onChange={(e) => handleChange('otherTerms', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Nhập các điều kiện khác..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <ListChecks size={18} className="text-indigo-600" />
          II- Điều khoản cụ thể
        </h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">1. Nội dung công việc khoán</label>
            <textarea
              value={metadata?.jobContent || ''}
              onChange={(e) => handleChange('jobContent', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-24"
              placeholder="Nhập nội dung công việc..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">2. Trách nhiệm, quyền lợi và nghĩa vụ của người nhận khoán</label>
            <textarea
              value={metadata?.receiverRights || ''}
              onChange={(e) => handleChange('receiverRights', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-24"
              placeholder="Nhập trách nhiệm, quyền lợi..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">3. Trách nhiệm, quyền lợi và nghĩa vụ của bên giao khoán</label>
            <textarea
              value={metadata?.giverRights || ''}
              onChange={(e) => handleChange('giverRights', e.target.value)}
              disabled={isViewOnly}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white h-24"
              placeholder="Nhập trách nhiệm, quyền lợi..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;
