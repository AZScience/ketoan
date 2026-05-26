import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { logAudit } from '../lib/audit';
import { Warehouse } from '../types/accounting';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, Package, MapPin, User, Hash, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WarehouseList: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'warehouses'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWarehouses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching warehouses:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredWarehouses = warehouses.filter(wh => 
    wh.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredWarehouses.length / rowsPerPage);
  const paginatedWarehouses = filteredWarehouses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const generateDefaultCode = () => {
    const count = warehouses.length + 1;
    return `KHO${count.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    setCode(generateDefaultCode());
    setName('');
    setAddress('');
    setManager('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        code,
        name,
        address,
        manager,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'warehouses', editingId), data);
        await logAudit('Warehouses', 'Update', `Updated warehouse ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật kho thành công!' });
      } else {
        await addDoc(collection(db, 'warehouses'), {
          ...data,
          createdAt: serverTimestamp()
        });
        await logAudit('Warehouses', 'Create', `Created warehouse ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm kho mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving warehouse:", error);
      setMessage({ 
        type: 'error', 
        text: error.message || "Có lỗi xảy ra khi lưu thông tin kho." 
      });
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'warehouses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (wh: Warehouse) => {
    setEditingId(wh.id!);
    setIsViewOnly(false);
    setCode(wh.code);
    setName(wh.name);
    setAddress(wh.address || '');
    setManager(wh.manager || '');
    setIsModalOpen(true);
  };

  const handleView = (wh: Warehouse) => {
    setEditingId(wh.id!);
    setIsViewOnly(true);
    setCode(wh.code);
    setName(wh.name);
    setAddress(wh.address || '');
    setManager(wh.manager || '');
    setIsModalOpen(true);
  };

  const handleDelete = (wh: Warehouse) => {
    setWarehouseToDelete(wh);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!warehouseToDelete?.id) return;
    
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'warehouses', warehouseToDelete.id));
      await logAudit('Warehouses', 'Delete', `Deleted warehouse ${warehouseToDelete.code} - ${warehouseToDelete.name}`);
      setIsConfirmOpen(false);
      setWarehouseToDelete(null);
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      handleFirestoreError(error, OperationType.DELETE, `warehouses/${warehouseToDelete.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục Kho bãi</h1>
          <p className="text-slate-500">Quản lý các kho hàng, bãi chứa vật tư</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          <span>Thêm kho mới</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên hoặc địa chỉ..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã kho</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên kho</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quản lý kho</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ) : paginatedWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy kho nào
                  </td>
                </tr>
              ) : (
                paginatedWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {wh.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{wh.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {wh.address || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {wh.manager || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(wh)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(wh)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(wh)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredWarehouses.length)} trong tổng số {filteredWarehouses.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {isViewOnly ? 'Chi tiết kho' : editingId ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
                </h3>
                <button 
                  onClick={() => !isSubmitting && setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <form id="warehouse-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`${
                        message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                      } border p-4 rounded-2xl flex items-center gap-3 text-sm font-medium`}
                    >
                      {message.type === 'success' ? <Save size={18} /> : <Info size={18} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Hash size={16} className="text-slate-400" />
                      Mã kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      disabled={isViewOnly || !!editingId}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-all font-mono"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Package size={16} className="text-slate-400" />
                      Tên kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      Địa chỉ
                    </label>
                    <input
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      Quản lý kho
                    </label>
                    <input
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                    />
                  </div>
                </div>

                {!isViewOnly && (
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      form="warehouse-form"
                      disabled={isSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-lg ${
                        isSubmitting 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
              <p className="text-slate-500 mb-8">
                Bạn có chắc chắn muốn xóa kho <span className="font-bold text-slate-900">{warehouseToDelete?.name}</span>? 
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    'Xác nhận xóa'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarehouseList;
