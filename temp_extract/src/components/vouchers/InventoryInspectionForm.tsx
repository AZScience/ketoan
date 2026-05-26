import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Plus, Trash2, Info, CheckCircle2, XCircle } from 'lucide-react';

interface InventoryInspectionFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const InventoryInspectionForm: React.FC<InventoryInspectionFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    basis: metadata?.basis || '',
    committee: metadata?.committee || [{ name: '', role: '' }],
    rows: metadata?.rows || [{
      itemName: '',
      itemCode: '',
      inspectionMethod: '',
      unit: '',
      documentQty: 0,
      isCorrect: true,
      note: ''
    }]
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

  const handleRowChange = (index: number, field: string, value: any) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData(prev => ({ ...prev, rows: newRows }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      rows: [...prev.rows, {
        itemName: '',
        itemCode: '',
        inspectionMethod: '',
        unit: '',
        documentQty: 0,
        isCorrect: true,
        note: ''
      }]
    }));
  };

  const removeRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <ClipboardList size={16} className="text-blue-500" />
          Căn cứ (Số, ngày, của đơn vị...)
        </label>
        <input 
          type="text" 
          value={formData.basis}
          onChange={(e) => handleChange('basis', e.target.value)}
          disabled={isViewOnly}
          placeholder="Căn cứ theo chứng từ nào..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            Ban kiểm nghiệm gồm
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Kết quả kiểm nghiệm</h3>
          {!isViewOnly && (
            <button onClick={addRow} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Thêm dòng
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-3 border-b border-slate-100">Tên hàng / Mã</th>
                <th className="p-3 border-b border-slate-100 w-24">Phương thức KN</th>
                <th className="p-3 border-b border-slate-100 w-16">ĐVT</th>
                <th className="p-3 border-b border-slate-100 w-24">SL theo CT</th>
                <th className="p-3 border-b border-slate-100 w-32 text-center">Kết quả</th>
                <th className="p-3 border-b border-slate-100 w-24">Ghi chú</th>
                {!isViewOnly && <th className="p-3 border-b border-slate-100 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.rows.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="p-2">
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="Tên hàng"
                        value={row.itemName}
                        onChange={(e) => handleRowChange(index, 'itemName', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                      <input 
                        type="text" 
                        placeholder="Mã số"
                        value={row.itemCode}
                        onChange={(e) => handleRowChange(index, 'itemCode', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-[10px] text-slate-500"
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.inspectionMethod}
                      onChange={(e) => handleRowChange(index, 'inspectionMethod', e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Cân/Đo..."
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.unit}
                      onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.documentQty}
                      onChange={(e) => handleRowChange(index, 'documentQty', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRowChange(index, 'isCorrect', true)}
                        disabled={isViewOnly}
                        className={`p-1 rounded-lg transition-all ${row.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRowChange(index, 'isCorrect', false)}
                        disabled={isViewOnly}
                        className={`p-1 rounded-lg transition-all ${!row.isCorrect ? 'bg-red-100 text-red-600' : 'text-slate-300 hover:text-slate-400'}`}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.note}
                      onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  {!isViewOnly && (
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryInspectionForm;
