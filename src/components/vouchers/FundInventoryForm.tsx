import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Plus, Trash2, Clock, FileText, Building2, Hash } from 'lucide-react';
import { VoucherType } from '../../types/accounting';

interface FundInventoryFormProps {
  type: VoucherType;
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const FundInventoryForm: React.FC<FundInventoryFormProps> = ({ type, metadata, onChange, isViewOnly }) => {
  const isForeign = type === 'FundInventoryForeign';
  const [formData, setFormData] = useState({
    companyName: metadata?.companyName || '',
    department: metadata?.department || '',
    voucherNumber: metadata?.voucherNumber || '',
    hour: metadata?.hour || '',
    minute: metadata?.minute || '',
    committee: metadata?.committee || [
      { name: '', role: 'Kế toán' },
      { name: '', role: 'Thủ quỹ' },
      { name: '', role: 'Đại diện' }
    ],
    bookBalance: metadata?.bookBalance || 0,
    actualInventory: metadata?.actualInventory || 0,
    rows: metadata?.rows || Array.from({ length: 5 }).map(() => ({
      type: '',
      unit: '',
      quantity: 0,
      price: 0,
      exchangeRate: 0,
      amount: 0,
      note: ''
    })),
    surplusReason: metadata?.surplusReason || '',
    shortageReason: metadata?.shortageReason || '',
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

  const handleRowChange = (index: number, field: string, value: any) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    
    // Auto calculate amount
    if (!isForeign) {
      if (field === 'type' || field === 'quantity') {
        const typeNum = parseFloat(newRows[index].type.replace(/[^0-9.]/g, '')) || 0;
        const qtyNum = parseFloat(newRows[index].quantity) || 0;
        if (typeNum && qtyNum) {
          newRows[index].amount = typeNum * qtyNum;
        }
      }
    } else {
      if (field === 'quantity' || field === 'price' || field === 'exchangeRate') {
        const qty = parseFloat(newRows[index].quantity) || 0;
        const price = parseFloat(newRows[index].price) || 0;
        const rate = parseFloat(newRows[index].exchangeRate) || 0;
        if (qty && price && rate) {
          newRows[index].amount = qty * price * rate;
        }
      }
    }
    
    setFormData(prev => ({ ...prev, rows: newRows }));
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg max-w-4xl mx-auto">
      {/* Document Header Mimic */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
        <div className="space-y-4 w-2/3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={14} /> Đơn vị
            </label>
            <input 
              type="text" 
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={isViewOnly}
              placeholder="Tên đơn vị..."
              className="w-full p-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Hash size={14} /> Bộ phận
            </label>
            <input 
              type="text" 
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              disabled={isViewOnly}
              placeholder="Tên bộ phận..."
              className="w-full p-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>
        <div className="text-right space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mẫu số {isForeign ? '08b' : '08a'} - TT</p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Số chứng từ</label>
            <input 
              type="text" 
              value={formData.voucherNumber}
              onChange={(e) => handleChange('voucherNumber', e.target.value)}
              disabled={isViewOnly}
              placeholder="Số: ...."
              className="w-32 p-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-right font-mono"
            />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">BẢNG KIỂM KÊ QUỸ</h2>
        <p className="text-xs text-slate-500 italic font-medium">
          (Dùng cho {isForeign ? 'ngoại tệ, vàng tiền tệ' : 'VNĐ'})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Clock size={14} className="text-blue-500" /> Giờ kiểm kê
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={formData.hour}
              onChange={(e) => handleChange('hour', e.target.value)}
              disabled={isViewOnly}
              placeholder="Giờ"
              className="w-full p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center font-bold"
            />
            <span className="text-slate-400 font-bold">:</span>
            <input 
              type="text" 
              value={formData.minute}
              onChange={(e) => handleChange('minute', e.target.value)}
              disabled={isViewOnly}
              placeholder="Phút"
              className="w-full p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center font-bold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Users size={14} className="text-indigo-500" /> Ban kiểm kê gồm
          </label>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {formData.committee.map((member, index) => (
            <div key={index} className="flex gap-3 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="flex-grow grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Họ và tên"
                  value={member.name}
                  onChange={(e) => handleCommitteeChange(index, 'name', e.target.value)}
                  disabled={isViewOnly}
                  className="p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Đại diện / Chức vụ"
                  value={member.role}
                  onChange={(e) => handleCommitteeChange(index, 'role', e.target.value)}
                  disabled={isViewOnly}
                  className="p-2 rounded-lg bg-white border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
              {index > 2 && !isViewOnly && (
                <button 
                  onClick={() => {
                    const newCommittee = formData.committee.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, committee: newCommittee }));
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {!isViewOnly && (
            <button 
              onClick={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  committee: [...prev.committee, { name: '', role: '' }] 
                }));
              }}
              className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all text-xs font-bold"
            >
              <Plus size={14} /> Thêm thành viên
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kết quả kiểm kê</h3>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Chênh lệch</p>
              <p className={`text-sm font-black ${(formData.bookBalance - formData.actualInventory) === 0 ? 'text-slate-400' : 'text-red-500'}`}>
                {(formData.bookBalance - formData.actualInventory).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">I. Số dư theo sổ quỹ</label>
            <div className="relative">
              <input 
                type="number" 
                value={formData.bookBalance}
                onChange={(e) => handleChange('bookBalance', Number(e.target.value))}
                disabled={isViewOnly}
                className="w-full p-4 rounded-2xl bg-blue-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-600 text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-300 uppercase">VNĐ</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">II. Số kiểm kê thực tế {isForeign ? '(*)' : ''}</label>
            <div className="relative">
              <input 
                type="number" 
                value={formData.actualInventory}
                onChange={(e) => handleChange('actualInventory', Number(e.target.value))}
                disabled={isViewOnly}
                className="w-full p-4 rounded-2xl bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-emerald-600 text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-300 uppercase">VNĐ</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 italic">Chi tiết các loại tiền:</label>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="p-3 border-b border-slate-100 w-10 text-center">STT</th>
                  <th className="p-3 border-b border-slate-100">Diễn giải</th>
                  {isForeign && <th className="p-3 border-b border-slate-100 w-16 text-center">ĐVT</th>}
                  <th className="p-3 border-b border-slate-100 w-20 text-center">Số lượng</th>
                  {isForeign && <th className="p-3 border-b border-slate-100 w-24 text-right">Đơn giá</th>}
                  {isForeign && <th className="p-3 border-b border-slate-100 w-24 text-right">Tỷ giá</th>}
                  <th className="p-3 border-b border-slate-100 w-32 text-right">{isForeign ? 'VNĐ' : 'Thành tiền'}</th>
                  {isForeign && <th className="p-3 border-b border-slate-100 w-20">Ghi chú</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-center text-slate-300 font-bold">{index + 1}</td>
                    <td className="p-1">
                      <input 
                        type="text" 
                        placeholder={isForeign ? "VD: USD" : "Mệnh giá..."}
                        value={row.type}
                        onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </td>
                    {isForeign && (
                      <td className="p-1">
                        <input 
                          type="text" 
                          placeholder="Tờ..."
                          value={row.unit}
                          onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                          disabled={isViewOnly}
                          className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-center"
                        />
                      </td>
                    )}
                    <td className="p-1">
                      <input 
                        type="number" 
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-center"
                      />
                    </td>
                    {isForeign && (
                      <>
                        <td className="p-1">
                          <input 
                            type="number" 
                            value={row.price}
                            onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                            disabled={isViewOnly}
                            className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                          />
                        </td>
                        <td className="p-1">
                          <input 
                            type="number" 
                            value={row.exchangeRate}
                            onChange={(e) => handleRowChange(index, 'exchangeRate', e.target.value)}
                            disabled={isViewOnly}
                            className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right"
                          />
                        </td>
                      </>
                    )}
                    <td className="p-1">
                      <input 
                        type="number" 
                        value={row.amount}
                        onChange={(e) => handleRowChange(index, 'amount', Number(e.target.value))}
                        disabled={isViewOnly}
                        className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500 text-right font-black text-slate-700"
                      />
                    </td>
                    {isForeign && (
                      <td className="p-1">
                        <input 
                          type="text" 
                          value={row.note}
                          onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                          disabled={isViewOnly}
                          className="w-full p-2 rounded bg-transparent border-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              Lý do thừa
            </label>
            <textarea 
              rows={2}
              value={formData.surplusReason}
              onChange={(e) => handleChange('surplusReason', e.target.value)}
              disabled={isViewOnly}
              placeholder="Nhập lý do nếu có thừa quỹ..."
              className="w-full p-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              Lý do thiếu
            </label>
            <textarea 
              rows={2}
              value={formData.shortageReason}
              onChange={(e) => handleChange('shortageReason', e.target.value)}
              disabled={isViewOnly}
              placeholder="Nhập lý do nếu có thiếu quỹ..."
              className="w-full p-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Kết luận sau khi kiểm kê quỹ</label>
          <textarea 
            rows={2}
            value={formData.conclusion}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            disabled={isViewOnly}
            placeholder="Ghi nhận kết luận cuối cùng..."
            className="w-full p-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-bold text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

export default FundInventoryForm;
