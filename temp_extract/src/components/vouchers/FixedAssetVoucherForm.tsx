import React, { useState, useEffect } from 'react';
import { FileText, Users, Calendar, Plus, Trash2, Info } from 'lucide-react';

interface FixedAssetVoucherFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const FixedAssetVoucherForm: React.FC<FixedAssetVoucherFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    decisionNo: metadata?.decisionNo || '',
    decisionDate: metadata?.decisionDate || '',
    committee: metadata?.committee || [{ name: '', role: '' }],
    notes: metadata?.notes || '',
    assetDetails: metadata?.assetDetails || []
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCommitteeChange = (index: number, field: string, value: string) => {
    const newCommittee = [...formData.committee];
    newCommittee[index] = { ...newCommittee[index], [field]: value };
    setFormData(prev => ({ ...prev, committee: newCommittee }));
  };

  const addCommitteeMember = () => {
    setFormData(prev => ({
      ...prev,
      committee: [...prev.committee, { name: '', role: '' }]
    }));
  };

  const removeCommitteeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      committee: prev.committee.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            Căn cứ Quyết định số
          </label>
          <input 
            type="text" 
            value={formData.decisionNo}
            onChange={(e) => handleChange('decisionNo', e.target.value)}
            disabled={isViewOnly}
            placeholder="Số quyết định"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-500" />
            Ngày quyết định
          </label>
          <input 
            type="date" 
            value={formData.decisionDate}
            onChange={(e) => handleChange('decisionDate', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            Ban giao nhận / Hội đồng / Ban kiểm kê gồm
          </label>
          {!isViewOnly && (
            <button onClick={addCommitteeMember} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm thành viên
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {formData.committee.map((member: any, index: number) => (
            <div key={index} className="flex gap-3 items-center">
              <input 
                type="text" 
                placeholder="Họ và tên"
                value={member.name}
                onChange={(e) => handleCommitteeChange(index, 'name', e.target.value)}
                disabled={isViewOnly}
                className="flex-1 p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Chức vụ / Đại diện"
                value={member.role}
                onChange={(e) => handleCommitteeChange(index, 'role', e.target.value)}
                disabled={isViewOnly}
                className="flex-1 p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
              {!isViewOnly && formData.committee.length > 1 && (
                <button onClick={() => removeCommitteeMember(index)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Info size={16} className="text-amber-500" />
          Ghi chú / Nội dung khác
        </label>
        <textarea 
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          disabled={isViewOnly}
          rows={3}
          placeholder="Nhập ghi chú hoặc các thông tin bổ sung..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default FixedAssetVoucherForm;
