import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Plus, Trash2, Info } from 'lucide-react';
import { Autocomplete } from '../ui/Autocomplete';

interface InventorySummaryFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const InventorySummaryForm: React.FC<InventorySummaryFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    committee: metadata?.committee || [{ name: '', role: '' }],
    inspectionTime: metadata?.inspectionTime || '',
    location: metadata?.location || '',
    rows: metadata?.rows || [{
      itemName: '',
      itemCode: '',
      unit: '',
      bookQty: 0,
      bookPrice: 0,
      bookAmount: 0,
      actualQty: 0,
      actualPrice: 0,
      actualAmount: 0
    }]
  });

  useEffect(() => {
    const rowsWithDiff = formData.rows.map((row: any) => {
      const diffQty = Number(row.actualQty) - Number(row.bookQty);
      const diffAmount = Number(row.actualAmount) - Number(row.bookAmount);
      return {
        ...row,
        diffQtyPlus: diffQty > 0 ? diffQty : 0,
        diffQtyMinus: diffQty < 0 ? Math.abs(diffQty) : 0,
        diffAmountPlus: diffAmount > 0 ? diffAmount : 0,
        diffAmountMinus: diffAmount < 0 ? Math.abs(diffAmount) : 0
      };
    });

    onChange({ ...metadata, ...formData, rows: rowsWithDiff });
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
    const currentRow = { ...newRows[index], [field]: value };

    // Auto-calculate bookAmount
    if (field === 'bookQty' || field === 'bookPrice') {
      currentRow.bookAmount = Number(currentRow.bookQty || 0) * Number(currentRow.bookPrice || 0);
    }

    // Auto-calculate actualAmount
    if (field === 'actualQty' || field === 'actualPrice') {
      currentRow.actualAmount = Number(currentRow.actualQty || 0) * Number(currentRow.actualPrice || 0);
    }

    newRows[index] = currentRow;
    setFormData(prev => ({ ...prev, rows: newRows }));
  };

  const addRow = () => {
    setFormData(prev => ({
      ...prev,
      rows: [...prev.rows, {
        itemName: '',
        itemCode: '',
        unit: '',
        bookQty: 0,
        bookPrice: 0,
        bookAmount: 0,
        actualQty: 0,
        actualPrice: 0,
        actualAmount: 0
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-500" />
            Thời điểm kiểm kê
          </label>
          <input 
            type="datetime-local" 
            value={formData.inspectionTime}
            onChange={(e) => handleChange('inspectionTime', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Info size={16} className="text-emerald-500" />
            Địa điểm kiểm kê
          </label>
          <input 
            type="text" 
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={isViewOnly}
            placeholder="Kho / Bộ phận..."
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" />
            Ban kiểm kê gồm
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
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chi tiết kiểm kê</h3>
          {!isViewOnly && (
            <button onClick={addRow} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Thêm dòng
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-3 border-b border-slate-100">Tên hàng / Mã</th>
                <th className="p-3 border-b border-slate-100 w-16">ĐVT</th>
                <th className="p-3 border-b border-slate-100 w-20 text-center" colSpan={2}>Theo sổ kế toán</th>
                <th className="p-3 border-b border-slate-100 w-20 text-center" colSpan={3}>Theo kiểm kê</th>
                {!isViewOnly && <th className="p-3 border-b border-slate-100 w-10"></th>}
              </tr>
              <tr className="bg-slate-100/50 text-[9px]">
                <th className="p-1 border-b border-slate-100"></th>
                <th className="p-1 border-b border-slate-100"></th>
                <th className="p-1 border-b border-slate-100 text-center">SL</th>
                <th className="p-1 border-b border-slate-100 text-center">Thành tiền</th>
                <th className="p-1 border-b border-slate-100 text-center">SL</th>
                <th className="p-1 border-b border-slate-100 text-center">Đơn giá</th>
                <th className="p-1 border-b border-slate-100 text-center">Thành tiền</th>
                {!isViewOnly && <th className="p-1 border-b border-slate-100"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.rows.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="p-2">
                    <div className="space-y-1">
                      <Autocomplete 
                        collectionName="products"
                        searchField="name"
                        displayField="name"
                        valueField="name"
                        placeholder="Tên hàng"
                        value={row.itemName}
                        onChange={(val, prod) => {
                          handleRowChange(index, 'itemName', val);
                          if (prod) {
                            handleRowChange(index, 'itemCode', prod.code);
                            handleRowChange(index, 'unit', prod.unit);
                            handleRowChange(index, 'actualPrice', prod.purchasePrice || 0);
                          }
                        }}
                        disabled={isViewOnly}
                        className="border-none p-0 font-bold"
                      />
                      <Autocomplete 
                        collectionName="products"
                        searchField="code"
                        displayField="code"
                        valueField="code"
                        placeholder="Mã số"
                        value={row.itemCode}
                        onChange={(val, prod) => {
                          handleRowChange(index, 'itemCode', val);
                          if (prod) {
                            handleRowChange(index, 'itemName', prod.name);
                            handleRowChange(index, 'unit', prod.unit);
                            handleRowChange(index, 'actualPrice', prod.purchasePrice || 0);
                          }
                        }}
                        disabled={isViewOnly}
                        className="border-none p-0 text-[10px] text-slate-500"
                      />
                    </div>
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
                  {/* Book Values */}
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.bookQty}
                      onChange={(e) => handleRowChange(index, 'bookQty', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.bookAmount}
                      onChange={(e) => handleRowChange(index, 'bookAmount', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                    />
                  </td>
                  {/* Actual Values */}
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.actualQty}
                      onChange={(e) => handleRowChange(index, 'actualQty', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right font-bold text-blue-600"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.actualPrice}
                      onChange={(e) => handleRowChange(index, 'actualPrice', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.actualAmount}
                      onChange={(e) => handleRowChange(index, 'actualAmount', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right font-bold text-emerald-600"
                    />
                  </td>
                  {!isViewOnly && (
                    <td className="p-2">
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

export default InventorySummaryForm;
