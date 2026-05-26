import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { FixedAsset, Account } from '../types/accounting';
import { Plus, Search, Filter, Edit, Trash2, X, Save, Landmark, Calculator, Calendar, Info, MoreVertical, Copy, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { logAudit } from '../lib/audit';

const FixedAssetList: React.FC = () => {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [type, setType] = useState('Máy móc thiết bị');
  const [department, setDepartment] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [originalCost, setOriginalCost] = useState(0);
  const [depreciationMethod, setDepreciationMethod] = useState<'StraightLine' | 'DecliningBalance'>('StraightLine');
  const [usefulLife, setUsefulLife] = useState(60); // 5 years
  const [accumulatedDepreciation, setAccumulatedDepreciation] = useState(0);
  const [residualValue, setResidualValue] = useState(0);
  const [assetAccount, setAssetAccount] = useState('211');
  const [depreciationAccount, setDepreciationAccount] = useState('214');
  const [expenseAccount, setExpenseAccount] = useState('642');

  // Auto-calculate residual value
  useEffect(() => {
    setResidualValue(originalCost - accumulatedDepreciation);
  }, [originalCost, accumulatedDepreciation]);

  useEffect(() => {
    const q = query(collection(db, 'fixed_assets'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FixedAsset)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'fixed_assets');
      setLoading(false);
    });

    const unsubscribeAcc = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => doc.data() as Account));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
    });

    return () => {
      unsubscribe();
      unsubscribeAcc();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        code,
        name,
        unit,
        type,
        department,
        purchaseDate,
        originalCost: Number(originalCost),
        depreciationMethod,
        usefulLife: Number(usefulLife),
        accumulatedDepreciation: Number(accumulatedDepreciation),
        residualValue: Number(residualValue),
        assetAccount,
        depreciationAccount,
        expenseAccount,
        updatedAt: serverTimestamp()
      };

      if (editingAssetId) {
        await updateDoc(doc(db, 'fixed_assets', editingAssetId), data);
        await logAudit('FixedAssets', 'Update', `Cập nhật tài sản: ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật tài sản thành công!' });
      } else {
        await addDoc(collection(db, 'fixed_assets'), {
          ...data,
          createdBy: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
        await logAudit('FixedAssets', 'Create', `Thêm tài sản mới: ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm tài sản mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving asset:", error);
      handleFirestoreError(error, editingAssetId ? OperationType.UPDATE : OperationType.CREATE, 'fixed_assets');
      setMessage({ type: 'error', text: error.message || "Có lỗi xảy ra khi lưu thông tin tài sản." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setAssetToDelete(id);
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!assetToDelete) return;
    setIsSubmitting(true);
    try {
      const assetDoc = await getDoc(doc(db, 'fixed_assets', assetToDelete));
      const assetData = assetDoc.data() as FixedAsset;
      
      await deleteDoc(doc(db, 'fixed_assets', assetToDelete));
      
      if (assetData) {
        await logAudit('FixedAssets', 'Delete', `Xóa tài sản: ${assetData.code} - ${assetData.name}`);
      }
      
      setIsConfirmOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
      handleFirestoreError(error, OperationType.DELETE, `fixed_assets/${assetToDelete}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (asset: FixedAsset) => {
    setEditingAssetId(asset.id!);
    setCode(asset.code);
    setName(asset.name);
    setUnit(asset.unit || 'Cái');
    setType(asset.type);
    setDepartment(asset.department || '');
    setPurchaseDate(asset.purchaseDate);
    setOriginalCost(asset.originalCost);
    setDepreciationMethod(asset.depreciationMethod);
    setUsefulLife(asset.usefulLife);
    setAccumulatedDepreciation(asset.accumulatedDepreciation);
    setResidualValue(asset.residualValue);
    setAssetAccount(asset.assetAccount);
    setDepreciationAccount(asset.depreciationAccount);
    setExpenseAccount(asset.expenseAccount);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setEditingAssetId(null);
    setIsSubmitting(false);
    setMessage(null);
    setCode('');
    setName('');
    setType('Máy móc thiết bị');
    setDepartment('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setOriginalCost(0);
    setDepreciationMethod('StraightLine');
    setUsefulLife(60);
    setAccumulatedDepreciation(0);
    setResidualValue(0);
    setAssetAccount('211');
    setDepreciationAccount('214');
    setExpenseAccount('642');
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'periods'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPeriods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const isPeriodClosed = (month: number, year: number) => {
    const period = periods.find(p => p.month === month && p.year === year);
    return period?.status === 'Closed';
  };

  const calculateMonthlyDepreciation = async () => {
    if (assets.length === 0) {
      alert('Không có tài sản nào để tính khấu hao.');
      return;
    }

    const monthStr = prompt('Nhập tháng cần tính khấu hao (1-12):', (new Date().getMonth() + 1).toString());
    if (!monthStr || isNaN(Number(monthStr)) || Number(monthStr) < 1 || Number(monthStr) > 12) return;
    const month = Number(monthStr);

    const yearStr = prompt('Nhập năm cần tính khấu hao:', new Date().getFullYear().toString());
    if (!yearStr || isNaN(Number(yearStr))) return;
    const year = Number(yearStr);

    if (isPeriodClosed(month, year)) {
      alert(`Kỳ kế toán tháng ${month}/${year} đã khóa sổ. Bạn không thể tính khấu hao.`);
      return;
    }

    if (!window.confirm(`Hệ thống sẽ tính khấu hao cho ${assets.length} tài sản trong tháng ${month}/${year} và tạo chứng từ kế toán. Bạn có chắc chắn?`)) return;

    try {
      const items = assets.map(asset => {
        const monthlyDepreciation = Math.round(asset.originalCost / asset.usefulLife);
        return {
          debitAccount: asset.expenseAccount,
          creditAccount: asset.depreciationAccount,
          amount: monthlyDepreciation,
          note: `Khấu hao ${asset.name} - Tháng ${month}/${year}`,
          itemCode: asset.code,
          itemName: asset.name
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      const voucherData = {
        date: `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
        number: `KH${year}${month.toString().padStart(2, '0')}`,
        description: `Khấu hao tài sản cố định tháng ${month}/${year}`,
        type: 'AssetDepreciation',
        totalAmount,
        items,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        status: 'PendingApproval'
      };

      await addDoc(collection(db, 'vouchers'), voucherData);
      await logAudit('FixedAssets', 'Depreciate', `Tính khấu hao tháng ${month}/${year}. Số tiền: ${totalAmount}`);
      
      // Update accumulated depreciation for each asset (simplified)
      for (const asset of assets) {
        const monthlyDepreciation = Math.round(asset.originalCost / asset.usefulLife);
        await updateDoc(doc(db, 'fixed_assets', asset.id!), {
          accumulatedDepreciation: (asset.accumulatedDepreciation || 0) + monthlyDepreciation,
          residualValue: asset.originalCost - ((asset.accumulatedDepreciation || 0) + monthlyDepreciation),
          updatedAt: serverTimestamp()
        });
      }

      alert(`Đã tính khấu hao thành công! Tổng số tiền: ${formatCurrency(totalAmount)}. Đã tạo chứng từ ${voucherData.number}`);
    } catch (error) {
      console.error("Error calculating depreciation:", error);
      alert('Có lỗi xảy ra khi tính khấu hao.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tài sản cố định</h1>
          <p className="text-slate-500">Quản lý danh mục và khấu hao tài sản cố định.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={calculateMonthlyDepreciation}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Calculator size={20} />
            Tính khấu hao
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Thêm tài sản
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài sản theo mã hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all">
          <Filter size={20} />
          Bộ lọc
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <th className="px-6 py-4 border-b border-slate-100">Mã tài sản</th>
                <th className="px-6 py-4 border-b border-slate-100">Tên tài sản</th>
                <th className="px-6 py-4 border-b border-slate-100">Ngày mua</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Nguyên giá</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Hao mòn lũy kế</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Giá trị còn lại</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">Chưa có tài sản nào.</td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{asset.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{asset.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">{formatCurrency(asset.originalCost)}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-500">{formatCurrency(asset.accumulatedDepreciation)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">{formatCurrency(asset.originalCost - asset.accumulatedDepreciation)}</td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === asset.id ? null : asset.id!)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === asset.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-full mr-2 top-0 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                            >
                              <button 
                                onClick={() => handleEdit(asset)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                              >
                                <Edit size={16} className="text-blue-500" />
                                <span>Sửa</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(asset.id!)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border-t border-slate-50"
                              >
                                <Trash2 size={16} className="text-red-500" />
                                <span>Xóa</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Landmark size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingAssetId ? 'Cập nhật tài sản' : 'Thêm tài sản mới'}
                  </h2>
                </div>
                <button 
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form id="fixed-asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
                        message.type === 'success' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : 'bg-red-50 border-red-100 text-red-700'
                      }`}
                    >
                      {message.type === 'success' ? <Save size={18} /> : <Info size={18} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">Thông tin cơ bản</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Mã tài sản *</label>
                        <input 
                          required
                          type="text" 
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="TS001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Loại tài sản</label>
                        <select 
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="Máy móc thiết bị">Máy móc thiết bị</option>
                          <option value="Phương tiện vận tải">Phương tiện vận tải</option>
                          <option value="Nhà cửa vật kiến trúc">Nhà cửa vật kiến trúc</option>
                          <option value="Thiết bị dụng cụ quản lý">Thiết bị dụng cụ quản lý</option>
                          <option value="Tài sản cố định khác">Tài sản cố định khác</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tên tài sản *</label>
                        <input 
                          required
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="Ví dụ: Xe tải Hino 5 tấn"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Đơn vị tính</label>
                        <input 
                          type="text" 
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="Cái, Bộ, Chiếc..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Bộ phận sử dụng</label>
                        <input 
                          type="text" 
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                          placeholder="Phòng kinh doanh"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Ngày mua *</label>
                        <input 
                          required
                          type="date" 
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">Thông tin tài chính</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nguyên giá *</label>
                        <input 
                          required
                          type="number" 
                          value={originalCost}
                          onChange={(e) => setOriginalCost(Number(e.target.value))}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-blue-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Thời gian sử dụng (tháng)</label>
                        <input 
                          type="number" 
                          value={usefulLife}
                          onChange={(e) => setUsefulLife(Number(e.target.value))}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Hao mòn lũy kế</label>
                        <input 
                          type="number" 
                          value={accumulatedDepreciation}
                          onChange={(e) => setAccumulatedDepreciation(Number(e.target.value))}
                          className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Giá trị còn lại</label>
                        <input 
                          type="number" 
                          readOnly
                          value={residualValue}
                          className="w-full p-3 rounded-xl bg-slate-100 border-transparent outline-none transition-all font-bold text-emerald-600 cursor-not-allowed"
                          placeholder="Tự động tính toán..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Phương pháp khấu hao</label>
                      <select 
                        value={depreciationMethod}
                        onChange={(e) => setDepreciationMethod(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="StraightLine">Đường thẳng</option>
                        <option value="DecliningBalance">Số dư giảm dần</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Accounting Config */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wider border-b border-purple-100 pb-2">Thiết lập hạch toán</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">TK Nguyên giá</label>
                      <select 
                        value={assetAccount}
                        onChange={(e) => setAssetAccount(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        {accounts.filter(a => a.code.startsWith('211')).map(a => (
                          <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                        ))}
                        <option value="211">211 - Tài sản cố định hữu hình</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">TK Khấu hao</label>
                      <select 
                        value={depreciationAccount}
                        onChange={(e) => setDepreciationAccount(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        {accounts.filter(a => a.code.startsWith('214')).map(a => (
                          <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                        ))}
                        <option value="214">214 - Hao mòn tài sản cố định</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">TK Chi phí</label>
                      <select 
                        value={expenseAccount}
                        onChange={(e) => setExpenseAccount(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        {accounts.filter(a => a.code.startsWith('6')).map(a => (
                          <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                        ))}
                        <option value="642">642 - Chi phí quản lý doanh nghiệp</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    form="fixed-asset-form"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                      isSubmitting 
                        ? 'bg-slate-400 cursor-not-allowed text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    {isSubmitting ? 'Đang lưu...' : 'Lưu tài sản'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
                <p className="text-slate-500 mb-6">
                  Bạn có chắc chắn muốn xóa tài sản này? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={isSubmitting}
                    onClick={() => { setIsConfirmOpen(false); setAssetToDelete(null); }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={executeDelete}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FixedAssetList;
