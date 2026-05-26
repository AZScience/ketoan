import React, { useState, useEffect } from 'react';
import { FileText, Calculator, Plus, Trash2, Info, LayoutGrid } from 'lucide-react';

interface AssetDepreciationFormProps {
  metadata: any;
  onChange: (metadata: any) => void;
  isViewOnly?: boolean;
}

const AssetDepreciationForm: React.FC<AssetDepreciationFormProps> = ({ metadata, onChange, isViewOnly }) => {
  const [formData, setFormData] = useState({
    unit: metadata?.unit || '',
    department: metadata?.department || '',
    month: metadata?.month || new Date().getMonth() + 1,
    year: metadata?.year || new Date().getFullYear(),
    rows: metadata?.rows || [
      { id: 'I', name: 'I. Số khấu hao trích tháng trước', rate: '', originalCost: 0, depAmount: 0, tk627_1: 0, tk627_2: 0, tk627_3: 0, tk627_4: 0, tk623: 0, tk641: 0, tk642: 0, tk241: 0, tk242: 0, tk335: 0 },
      { id: 'II', name: 'II. Số KH TSCĐ tăng trong tháng', rate: '', originalCost: 0, depAmount: 0, tk627_1: 0, tk627_2: 0, tk627_3: 0, tk627_4: 0, tk623: 0, tk641: 0, tk642: 0, tk241: 0, tk242: 0, tk335: 0 },
      { id: 'III', name: 'III. Số KH TSCĐ giảm trong tháng', rate: '', originalCost: 0, depAmount: 0, tk627_1: 0, tk627_2: 0, tk627_3: 0, tk627_4: 0, tk623: 0, tk641: 0, tk642: 0, tk241: 0, tk242: 0, tk335: 0 },
      { id: 'IV', name: 'IV. Số KH trích tháng này (I + II - III)', rate: '', originalCost: 0, depAmount: 0, tk627_1: 0, tk627_2: 0, tk627_3: 0, tk627_4: 0, tk623: 0, tk641: 0, tk642: 0, tk241: 0, tk242: 0, tk335: 0 }
    ]
  });

  useEffect(() => {
    // Auto calculate row IV
    const newRows = [...formData.rows];
    const rowI = newRows.find(r => r.id === 'I');
    const rowII = newRows.find(r => r.id === 'II');
    const rowIII = newRows.find(r => r.id === 'III');
    const rowIV = newRows.find(r => r.id === 'IV');

    if (rowI && rowII && rowIII && rowIV) {
      const fields = ['originalCost', 'depAmount', 'tk627_1', 'tk627_2', 'tk627_3', 'tk627_4', 'tk623', 'tk641', 'tk642', 'tk241', 'tk242', 'tk335'];
      fields.forEach(field => {
        rowIV[field] = Number(rowI[field] || 0) + Number(rowII[field] || 0) - Number(rowIII[field] || 0);
      });
    }

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
              <label className="text-xs font-bold text-slate-500 uppercase">Tháng</label>
              <input 
                type="number" 
                min="1" max="12"
                value={formData.month}
                onChange={(e) => handleChange('month', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Năm</label>
              <input 
                type="number" 
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                disabled={isViewOnly}
                className="w-full p-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
          <Calculator size={16} className="text-blue-500" />
          Bảng tính và phân bổ khấu hao
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-[10px] text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="p-2 border-b border-r border-slate-100 w-8 text-center" rowSpan={3}>STT</th>
                <th className="p-2 border-b border-r border-slate-100 min-w-[150px]" rowSpan={3}>Chỉ tiêu</th>
                <th className="p-2 border-b border-r border-slate-100 w-24 text-center" rowSpan={3}>Tỷ lệ KH (%) hoặc TG sử dụng</th>
                <th className="p-2 border-b border-r border-slate-100 text-center" colSpan={2}>Nơi sử dụng (Toàn DN)</th>
                <th className="p-2 border-b border-r border-slate-100 text-center" colSpan={4}>TK 627 - Chi phí SX chung</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={3}>TK 623 Chi phí sử dụng máy thi công</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={3}>TK 641 Chi phí bán hàng</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={3}>TK 642 Chi phí QLDN</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={3}>TK 241 XDCB dở dang</th>
                <th className="p-2 border-b border-r border-slate-100 w-20 text-center" rowSpan={3}>TK 242 Chi phí chờ phân bổ</th>
                <th className="p-2 border-b border-slate-100 w-20 text-center" rowSpan={3}>TK 335 Chi phí phải trả</th>
              </tr>
              <tr className="bg-slate-50/50">
                <th className="p-1 border-b border-r border-slate-100 w-24 text-center" rowSpan={2}>Nguyên giá TSCĐ</th>
                <th className="p-1 border-b border-r border-slate-100 w-24 text-center" rowSpan={2}>Số khấu hao</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Phân xưởng 1</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Phân xưởng 2</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Phân xưởng 3</th>
                <th className="p-1 border-b border-r border-slate-100 w-20 text-center">Phân xưởng 4</th>
              </tr>
              <tr className="bg-slate-50/30 text-[8px] italic text-slate-400">
                <th className="p-1 border-b border-r border-slate-100 text-center">(sản phẩm)</th>
                <th className="p-1 border-b border-r border-slate-100 text-center">(sản phẩm)</th>
                <th className="p-1 border-b border-r border-slate-100 text-center">(sản phẩm)</th>
                <th className="p-1 border-b border-r border-slate-100 text-center">(sản phẩm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formData.rows.map((row: any, index: number) => (
                <tr key={index} className={row.id === 'IV' ? 'bg-blue-50/30 font-bold' : ''}>
                  <td className="p-2 border-r border-slate-100 text-center text-slate-400">{index + 1}</td>
                  <td className="p-2 border-r border-slate-100">{row.name}</td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="text" 
                      value={row.rate}
                      onChange={(e) => handleRowChange(index, 'rate', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-center"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.originalCost}
                      onChange={(e) => handleRowChange(index, 'originalCost', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.depAmount}
                      onChange={(e) => handleRowChange(index, 'depAmount', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk627_1}
                      onChange={(e) => handleRowChange(index, 'tk627_1', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk627_2}
                      onChange={(e) => handleRowChange(index, 'tk627_2', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk627_3}
                      onChange={(e) => handleRowChange(index, 'tk627_3', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk627_4}
                      onChange={(e) => handleRowChange(index, 'tk627_4', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk623}
                      onChange={(e) => handleRowChange(index, 'tk623', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk641}
                      onChange={(e) => handleRowChange(index, 'tk641', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk642}
                      onChange={(e) => handleRowChange(index, 'tk642', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk241}
                      onChange={(e) => handleRowChange(index, 'tk241', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-100">
                    <input 
                      type="number" 
                      value={row.tk242}
                      onChange={(e) => handleRowChange(index, 'tk242', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="number" 
                      value={row.tk335}
                      onChange={(e) => handleRowChange(index, 'tk335', e.target.value)}
                      disabled={isViewOnly || row.id === 'IV'}
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded text-right"
                    />
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-100">
                <td className="p-2 border-r border-slate-100 text-center" colSpan={2}>Cộng</td>
                <td className="p-2 border-r border-slate-100 text-center">X</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.originalCost || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.depAmount || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk627_1 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk627_2 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk627_3 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk627_4 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk623 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk641 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk642 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk241 || 0), 0).toLocaleString()}</td>
                <td className="p-2 border-r border-slate-100 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk242 || 0), 0).toLocaleString()}</td>
                <td className="p-2 text-right">{formData.rows.reduce((sum, r) => sum + Number(r.tk335 || 0), 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetDepreciationForm;
