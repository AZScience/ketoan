import React, { useState, useEffect } from 'react';
import { FileText, Users, Calendar, Plus, Trash2, Info, ClipboardList, Wrench } from 'lucide-react';

interface AssetRepairFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AssetRepairForm: React.FC<AssetRepairFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    unit: metadata?.unit || '',
    department: metadata?.department || '',
    debit: metadata?.debit || '',
    credit: metadata?.credit || '',
    decisionNo: metadata?.decisionNo || '',
    decisionDate: metadata?.decisionDate || '',
    decisionBy: metadata?.decisionBy || '',
    repairParty: metadata?.repairParty || { name: '', role: '', representative: '' },
    ownerParty: metadata?.ownerParty || { name: '', role: '', representative: '' },
    assetName: metadata?.assetName || '',
    assetCode: metadata?.assetCode || '',
    assetCardNo: metadata?.assetCardNo || '',
    managementDept: metadata?.managementDept || '',
    startDate: metadata?.startDate || '',
    endDate: metadata?.endDate || '',
    repairDetails: metadata?.repairDetails || [{
      partName: '',
      content: '',
      estimatedCost: 0,
      actualCost: 0,
      testResult: ''
    }],
    conclusion: metadata?.conclusion || ''
  });

  useEffect(() => {
    onChange({ ...metadata, ...formData });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartyChange = (party: 'repairParty' | 'ownerParty', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [party]: { ...prev[party], [field]: value }
    }));
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...formData.repairDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData(prev => ({ ...prev, repairDetails: newDetails }));
  };

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      repairDetails: [...prev.repairDetails, {
        partName: '',
        content: '',
        estimatedCost: 0,
        actualCost: 0,
        testResult: ''
      }]
    }));
  };

  const removeDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repairDetails: prev.repairDetails.filter((_, i) => i !== index)
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
          Căn cứ quyết định
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

      {/* Parties Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Users size={16} className="text-indigo-500" />
          Đại diện các bên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repair Party */}
          <div className="p-4 bg-slate-50/50 rounded-2xl space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Đơn vị sửa chữa, bảo dưỡng...</label>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Ông/Bà"
                value={formData.repairParty.name}
                onChange={(e) => handlePartyChange('repairParty', 'name', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Chức vụ"
                value={formData.repairParty.role}
                onChange={(e) => handlePartyChange('repairParty', 'role', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Đại diện"
                value={formData.repairParty.representative}
                onChange={(e) => handlePartyChange('repairParty', 'representative', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          {/* Owner Party */}
          <div className="p-4 bg-slate-50/50 rounded-2xl space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Đơn vị có TSCĐ</label>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Ông/Bà"
                value={formData.ownerParty.name}
                onChange={(e) => handlePartyChange('ownerParty', 'name', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Chức vụ"
                value={formData.ownerParty.role}
                onChange={(e) => handlePartyChange('ownerParty', 'role', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
              <input 
                type="text" 
                placeholder="Đại diện"
                value={formData.ownerParty.representative}
                onChange={(e) => handlePartyChange('ownerParty', 'representative', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-white border-transparent focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Info Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <ClipboardList size={16} className="text-emerald-500" />
          Thông tin TSCĐ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tên, ký mã hiệu, quy cách TSCĐ</label>
            <input 
              type="text" 
              value={formData.assetName}
              onChange={(e) => handleChange('assetName', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Số hiệu TSCĐ</label>
              <input 
                type="text" 
                value={formData.assetCode}
                onChange={(e) => handleChange('assetCode', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Số thẻ TSCĐ</label>
              <input 
                type="text" 
                value={formData.assetCardNo}
                onChange={(e) => handleChange('assetCardNo', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Bộ phận quản lý, sử dụng</label>
            <input 
              type="text" 
              value={formData.managementDept}
              onChange={(e) => handleChange('managementDept', e.target.value)}
              disabled={isViewOnly}
              className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Từ ngày</label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Đến ngày</label>
              <input 
                type="date" 
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Repair Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <Wrench size={16} className="text-amber-500" />
            Chi tiết công việc
          </h3>
          {!isViewOnly && (
            <button onClick={addDetail} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
              <Plus size={14} /> Thêm dòng
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-2 border-b border-r border-slate-100 w-8 text-center">STT</th>
                <th className="p-2 border-b border-r border-slate-100">Tên bộ phận cần sửa chữa...</th>
                <th className="p-2 border-b border-r border-slate-100">Nội dung (mức độ) công việc</th>
                <th className="p-2 border-b border-r border-slate-100 w-24 text-right">Giá dự toán</th>
                <th className="p-2 border-b border-r border-slate-100 w-24 text-right">Chi phí thực tế</th>
                <th className="p-2 border-b border-r border-slate-100">Kết quả kiểm tra</th>
                {!isViewOnly && <th className="p-2 border-b border-slate-100 w-8"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.repairDetails.map((detail: any, index: number) => (
                <tr key={index}>
                  <td className="p-2 border-r border-slate-100 text-center text-slate-400">{index + 1}</td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="text" 
                      value={detail.partName}
                      onChange={(e) => handleDetailChange(index, 'partName', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="text" 
                      value={detail.content}
                      onChange={(e) => handleDetailChange(index, 'content', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={detail.estimatedCost}
                      onChange={(e) => handleDetailChange(index, 'estimatedCost', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={detail.actualCost}
                      onChange={(e) => handleDetailChange(index, 'actualCost', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right font-bold"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="text" 
                      value={detail.testResult}
                      onChange={(e) => handleDetailChange(index, 'testResult', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                    />
                  </td>
                  {!isViewOnly && (
                    <td className="p-1 text-center">
                      <button onClick={() => removeDetail(index)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
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
          placeholder="Nhập kết luận sau khi bàn giao..."
          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none text-sm"
        />
      </div>
    </div>
  );
};

export default AssetRepairForm;
