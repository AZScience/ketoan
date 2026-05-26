import React, { useState, useEffect } from 'react';
import { FileText, Type, List, Plus, Trash2, Calculator } from 'lucide-react';

interface AgencySettlementFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AgencySettlementForm: React.FC<AgencySettlementFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    contractNo: metadata?.contractNo || '',
    contractDate: metadata?.contractDate || '',
    commission: metadata?.commission || 0,
    taxDeduction: metadata?.taxDeduction || 0,
    rows: metadata?.rows || [{
      itemName: '',
      unit: '',
      openingStock: 0,
      receivedQty: 0,
      soldQty: 0,
      soldPrice: 0,
      closingStock: 0
    }]
  });

  useEffect(() => {
    const rowsWithTotals = formData.rows.map((row: any) => ({
      ...row,
      totalQty: Number(row.openingStock) + Number(row.receivedQty),
      soldAmount: Number(row.soldQty) * Number(row.soldPrice),
      closingStock: (Number(row.openingStock) + Number(row.receivedQty)) - Number(row.soldQty)
    }));

    const totalSoldAmount = rowsWithTotals.reduce((sum: number, row: any) => sum + row.soldAmount, 0);
    const finalPayment = totalSoldAmount - Number(formData.commission) - Number(formData.taxDeduction);

    onChange({ 
      ...metadata, 
      ...formData, 
      rows: rowsWithTotals,
      totalSoldAmount,
      finalPayment
    });
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
        itemName: '',
        unit: '',
        openingStock: 0,
        receivedQty: 0,
        soldQty: 0,
        soldPrice: 0,
        closingStock: 0
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
            <FileText size={16} className="text-blue-500" />
            Căn cứ Hợp đồng số
          </label>
          <input 
            type="text" 
            value={formData.contractNo}
            onChange={(e) => handleChange('contractNo', e.target.value)}
            disabled={isViewOnly}
            placeholder="Số hợp đồng"
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calculator size={16} className="text-emerald-500" />
            Ngày hợp đồng
          </label>
          <input 
            type="date" 
            value={formData.contractDate}
            onChange={(e) => handleChange('contractDate', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">I. Chi tiết hàng hóa đại lý</h3>
          {!isViewOnly && (
            <button onClick={addRow} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Thêm hàng hóa
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-3 border-b border-slate-100">Tên hàng</th>
                <th className="p-3 border-b border-slate-100 w-20">ĐVT</th>
                <th className="p-3 border-b border-slate-100 w-24">Tồn đầu</th>
                <th className="p-3 border-b border-slate-100 w-24">Nhận</th>
                <th className="p-3 border-b border-slate-100 w-24">Đã bán</th>
                <th className="p-3 border-b border-slate-100 w-32">Đơn giá bán</th>
                <th className="p-3 border-b border-slate-100 w-32 text-right">Thành tiền</th>
                {!isViewOnly && <th className="p-3 border-b border-slate-100 w-12"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.rows.map((row: any, index: number) => (
                <tr key={index}>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.itemName}
                      onChange={(e) => handleRowChange(index, 'itemName', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="text" 
                      value={row.unit}
                      onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.openingStock}
                      onChange={(e) => handleRowChange(index, 'openingStock', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.receivedQty}
                      onChange={(e) => handleRowChange(index, 'receivedQty', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.soldQty}
                      onChange={(e) => handleRowChange(index, 'soldQty', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right font-bold text-blue-600"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={row.soldPrice}
                      onChange={(e) => handleRowChange(index, 'soldPrice', e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right"
                    />
                  </td>
                  <td className="p-2 text-right font-bold text-slate-900">
                    {(Number(row.soldQty) * Number(row.soldPrice)).toLocaleString()}
                  </td>
                  {!isViewOnly && (
                    <td className="p-2">
                      <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calculator size={16} className="text-indigo-500" />
            II. Hoa hồng đại lý được hưởng
          </label>
          <input 
            type="number" 
            value={formData.commission}
            onChange={(e) => handleChange('commission', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-emerald-600"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calculator size={16} className="text-red-500" />
            III. Thuế khấu trừ (nếu có)
          </label>
          <input 
            type="number" 
            value={formData.taxDeduction}
            onChange={(e) => handleChange('taxDeduction', e.target.value)}
            disabled={isViewOnly}
            className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-red-600"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <List size={14} className="mt-0.5 shrink-0" />
          <span>Lưu ý: Tổng số tiền phải thanh toán cho bên giao hàng (IV) sẽ được tự động tính toán dựa trên doanh số bán trừ đi hoa hồng và thuế.</span>
        </p>
      </div>
    </div>
  );
};

export default AgencySettlementForm;
