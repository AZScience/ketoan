import React, { useState, useEffect } from 'react';
import { FileText, Users, Calendar, Plus, Trash2, Info, ClipboardList, RefreshCw } from 'lucide-react';

interface AssetRevaluationFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AssetRevaluationForm: React.FC<AssetRevaluationFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    unit: metadata?.unit || '',
    department: metadata?.department || '',
    debit: metadata?.debit || '',
    credit: metadata?.credit || '',
    decisionNo: metadata?.decisionNo || '',
    decisionDate: metadata?.decisionDate || '',
    decisionBy: metadata?.decisionBy || '',
    committee: metadata?.committee || [
      { name: '', role: '', representative: '', title: 'Chủ tịch Hội đồng' },
      { name: '', role: '', representative: '', title: 'Ủy viên' },
      { name: '', role: '', representative: '', title: 'Ủy viên' }
    ],
    revaluationDetails: metadata?.revaluationDetails || [{
      name: '',
      code: '',
      cardNo: '',
      bookOriginal: 0,
      bookDepreciation: 0,
      bookRemaining: 0,
      revaluedOriginal: 0,
      revaluedDepreciation: 0,
      revaluedRemaining: 0
    }],
    conclusion: metadata?.conclusion || ''
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
      committee: [...prev.committee, { name: '', role: '', representative: '', title: 'Ủy viên' }]
    }));
  };

  const removeCommitteeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      committee: prev.committee.filter((_, i) => i !== index)
    }));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...formData.revaluationDetails];
    const detail = { ...newDetails[index], [field]: value };
    
    // Auto-calculate remaining values
    if (['bookOriginal', 'bookDepreciation'].includes(field)) {
      const original = Number(detail.bookOriginal) || 0;
      const depreciation = Number(detail.bookDepreciation) || 0;
      detail.bookRemaining = original - depreciation;
    }
    
    if (['revaluedOriginal', 'revaluedDepreciation'].includes(field)) {
      const original = Number(detail.revaluedOriginal) || 0;
      const depreciation = Number(detail.revaluedDepreciation) || 0;
      detail.revaluedRemaining = original - depreciation;
    }

    newDetails[index] = detail;
    setFormData(prev => ({ ...prev, revaluationDetails: newDetails }));
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      revaluationDetails: [...prev.revaluationDetails, {
        name: '',
        code: '',
        cardNo: '',
        bookOriginal: 0,
        bookDepreciation: 0,
        bookRemaining: 0,
        revaluedOriginal: 0,
        revaluedDepreciation: 0,
        revaluedRemaining: 0
      }]
    }));
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      revaluationDetails: prev.revaluationDetails.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Đơn vị</label>
            <input 
              type="text" 
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              disabled={isViewOnly}
              placeholder="Tên đơn vị..."
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Bộ phận</label>
            <input 
              type="text" 
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              disabled={isViewOnly}
              placeholder="Tên bộ phận..."
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nợ</label>
              <input 
                type="text" 
                value={formData.debit}
                onChange={(e) => handleChange('debit', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Có</label>
              <input 
                type="text" 
                value={formData.credit}
                onChange={(e) => handleChange('credit', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Basis Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <FileText size={16} className="text-blue-500" />
          Căn cứ đánh giá lại
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Quyết định số</label>
            <input 
              type="text" 
              value={formData.decisionNo}
              onChange={(e) => handleChange('decisionNo', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Ngày quyết định</label>
            <input 
              type="date" 
              value={formData.decisionDate}
              onChange={(e) => handleChange('decisionDate', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Của (Đơn vị/Cá nhân)</label>
            <input 
              type="text" 
              value={formData.decisionBy}
              onChange={(e) => handleChange('decisionBy', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Committee Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <Users size={16} className="text-indigo-500" />
            Hội đồng đánh giá lại TSCĐ
          </h3>
          {!isViewOnly && (
            <button onClick={addCommitteeMember} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm thành viên
            </button>
          )}
        </div>
        <div className="space-y-3">
          {formData.committee.map((member: any, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-50/50 p-3 rounded-2xl relative group">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Ông/Bà</label>
                <input 
                  type="text" 
                  value={member.name}
                  onChange={(e) => handleCommitteeChange(index, 'name', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Chức vụ</label>
                <input 
                  type="text" 
                  value={member.role}
                  onChange={(e) => handleCommitteeChange(index, 'role', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Đại diện</label>
                <input 
                  type="text" 
                  value={member.representative}
                  onChange={(e) => handleCommitteeChange(index, 'representative', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vai trò</label>
                <input 
                  type="text" 
                  value={member.title}
                  onChange={(e) => handleCommitteeChange(index, 'title', e.target.value)}
                  disabled={isViewOnly}
                  className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              {!isViewOnly && formData.committee.length > 1 && (
                <button 
                  onClick={() => removeCommitteeMember(index)} 
                  className="absolute -right-2 -top-2 bg-white text-red-400 hover:text-red-600 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revaluation Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <RefreshCw size={16} className="text-emerald-500" />
            Chi tiết đánh giá lại TSCĐ
          </h3>
          {!isViewOnly && (
            <button onClick={addDetail} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm tài sản
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-2 border-b border-r border-slate-100 w-8 text-center" rowSpan={2}>STT</th>
                <th className="p-2 border-b border-r border-slate-100 min-w-[150px]" rowSpan={2}>Tên, ký hiệu quy cách TSCĐ</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={2}>Số hiệu</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={2}>Số thẻ</th>
                <th className="p-2 border-b border-r border-slate-100 text-center" colSpan={3}>Giá trị đang ghi sổ</th>
                <th className="p-2 border-b border-r border-slate-100 text-center" colSpan={3}>Giá trị theo đánh giá lại</th>
                <th className="p-2 border-b border-slate-100 text-center" colSpan={3}>Chênh lệch</th>
                {!isViewOnly && <th className="p-2 border-b border-l border-slate-100 w-8" rowSpan={2}></th>}
              </tr>
              <tr className="bg-slate-50/50 text-[9px]">
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Nguyên giá</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Hao mòn</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Còn lại</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Nguyên giá</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Hao mòn</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Còn lại</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Nguyên giá</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Hao mòn</th>
                <th className="p-1 border-b border-slate-100 w-20 text-center">Còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.revaluationDetails.map((detail: any, index: number) => {
                const diffOriginal = Number(detail.revaluedOriginal || 0) - Number(detail.bookOriginal || 0);
                const diffDepreciation = Number(detail.revaluedDepreciation || 0) - Number(detail.bookDepreciation || 0);
                const diffRemaining = Number(detail.revaluedRemaining || 0) - Number(detail.bookRemaining || 0);

                return (
                  <tr key={index}>
                    <td className="p-2 border-r border-slate-100 text-center text-slate-400">{index + 1}</td>
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={detail.name}
                        onChange={(e) => handleDetailChange(index, 'name', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={detail.code}
                        onChange={(e) => handleDetailChange(index, 'code', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-center"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={detail.cardNo}
                        onChange={(e) => handleDetailChange(index, 'cardNo', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-center"
                      />
                    </td>
                    {/* Book Values */}
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={detail.bookOriginal}
                        onChange={(e) => handleDetailChange(index, 'bookOriginal', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={detail.bookDepreciation}
                        onChange={(e) => handleDetailChange(index, 'bookDepreciation', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100 text-right bg-slate-50/30">
                      {Number(detail.bookRemaining || 0).toLocaleString()}
                    </td>
                    {/* Revalued Values */}
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={detail.revaluedOriginal}
                        onChange={(e) => handleDetailChange(index, 'revaluedOriginal', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100">
                      <input 
                        type="number" 
                        value={detail.revaluedDepreciation}
                        onChange={(e) => handleDetailChange(index, 'revaluedDepreciation', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                      />
                    </td>
                    <td className="p-1 border-r border-slate-100 text-right bg-slate-50/30">
                      {Number(detail.revaluedRemaining || 0).toLocaleString()}
                    </td>
                    {/* Differences */}
                    <td className={`p-1 border-r border-slate-100 text-right font-medium ${diffOriginal > 0 ? 'text-emerald-600' : diffOriginal < 0 ? 'text-red-600' : ''}`}>
                      {diffOriginal.toLocaleString()}
                    </td>
                    <td className={`p-1 border-r border-slate-100 text-right font-medium ${diffDepreciation > 0 ? 'text-emerald-600' : diffDepreciation < 0 ? 'text-red-600' : ''}`}>
                      {diffDepreciation.toLocaleString()}
                    </td>
                    <td className={`p-1 text-right font-bold ${diffRemaining > 0 ? 'text-blue-600' : diffRemaining < 0 ? 'text-amber-600' : ''}`}>
                      {diffRemaining.toLocaleString()}
                    </td>
                    {!isViewOnly && (
                      <td className="p-1 text-center border-l border-slate-100">
                        <button onClick={() => removeDetail(index)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conclusion Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Info size={16} className="text-amber-500" />
          Kết luận
        </label>
        <textarea 
          value={formData.conclusion}
          onChange={(e) => handleChange('conclusion', e.target.value)}
          disabled={isViewOnly}
          rows={3}
          placeholder="Nhập kết luận của hội đồng..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none text-sm"
        />
      </div>
    </div>
  );
};

export default AssetRevaluationForm;
