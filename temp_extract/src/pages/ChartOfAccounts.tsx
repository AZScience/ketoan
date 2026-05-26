import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Account } from '../types/accounting';
import { logAudit } from '../lib/audit';
import { Search, Plus, Filter, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Copy, Trash2, X, Save, Hash, BookOpen, Info, Layers, Settings, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'init', id?: string } | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('Asset');
  const [level, setLevel] = useState(1);
  const [parentCode, setParentCode] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'accounts'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredAccounts = accounts.filter(acc => 
    acc.code.includes(searchTerm) || acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAccounts.length / rowsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'bg-blue-100 text-blue-700';
      case 'Liability': return 'bg-red-100 text-red-700';
      case 'Equity': return 'bg-emerald-100 text-emerald-700';
      case 'Revenue': return 'bg-amber-100 text-amber-700';
      case 'Expense': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        code,
        name,
        type,
        level: Number(level),
        parentCode,
        updatedAt: serverTimestamp()
      };

      if (editingAccountId) {
        await updateDoc(doc(db, 'accounts', editingAccountId), data);
        await logAudit('Accounts', 'Update', `Updated account ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật tài khoản thành công!' });
      } else {
        await addDoc(collection(db, 'accounts'), {
          ...data,
          createdAt: serverTimestamp()
        });
        await logAudit('Accounts', 'Create', `Created account ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm tài khoản mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'accounts');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu tài khoản.' });
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'delete', id });
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!confirmAction?.id) return;
    const accountToDelete = accounts.find(a => a.id === confirmAction.id);
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'accounts', confirmAction.id));
      if (accountToDelete) {
        await logAudit('Accounts', 'Delete', `Deleted account ${accountToDelete.code} - ${accountToDelete.name}`);
      }
      setIsConfirmOpen(false);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accounts/${confirmAction.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccountId(account.id);
    setCode(account.code);
    setName(account.name);
    setType(account.type);
    setLevel(account.level);
    setParentCode(account.parentCode || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const handleView = (account: Account) => {
    setEditingAccountId(null);
    setCode(account.code);
    setName(account.name);
    setType(account.type);
    setLevel(account.level);
    setParentCode(account.parentCode || '');
    setIsViewOnly(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const handleCopy = (account: Account) => {
    setEditingAccountId(null);
    setCode(`${account.code}-COPY`);
    setName(account.name);
    setType(account.type);
    setLevel(account.level);
    setParentCode(account.parentCode || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const resetForm = () => {
    setEditingAccountId(null);
    setIsViewOnly(false);
    setCode('');
    setName('');
    setType('Asset');
    setLevel(1);
    setParentCode('');
    setMessage(null);
  };

  const handleInitDefault = () => {
    setConfirmAction({ type: 'init' });
    setIsConfirmOpen(true);
  };

  const executeInitDefault = async () => {
    const defaultAccounts: Partial<Account>[] = [
      { code: '111', name: 'Tiền mặt', type: 'Asset', level: 1 },
      { code: '112', name: 'Tiền gửi ngân hàng', type: 'Asset', level: 1 },
      { code: '131', name: 'Phải thu của khách hàng', type: 'Asset', level: 1 },
      { code: '133', name: 'Thuế GTGT được khấu trừ', type: 'Asset', level: 1 },
      { code: '1331', name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', type: 'Asset', level: 2, parentCode: '133' },
      { code: '152', name: 'Nguyên liệu, vật liệu', type: 'Asset', level: 1 },
      { code: '153', name: 'Công cụ, dụng cụ', type: 'Asset', level: 1 },
      { code: '156', name: 'Hàng hóa', type: 'Asset', level: 1 },
      { code: '211', name: 'Tài sản cố định hữu hình', type: 'Asset', level: 1 },
      { code: '214', name: 'Hao mòn tài sản cố định', type: 'Asset', level: 1 },
      { code: '331', name: 'Phải trả cho người bán', type: 'Liability', level: 1 },
      { code: '333', name: 'Thuế và các khoản phải nộp Nhà nước', type: 'Liability', level: 1 },
      { code: '3331', name: 'Thuế giá trị gia tăng phải nộp', type: 'Liability', level: 2, parentCode: '333' },
      { code: '334', name: 'Phải trả người lao động', type: 'Liability', level: 1 },
      { code: '411', name: 'Vốn góp của chủ sở hữu', type: 'Equity', level: 1 },
      { code: '421', name: 'Lợi nhuận sau thuế chưa phân phối', type: 'Equity', level: 1 },
      { code: '511', name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'Revenue', level: 1 },
      { code: '515', name: 'Doanh thu hoạt động tài chính', type: 'Revenue', level: 1 },
      { code: '632', name: 'Giá vốn hàng bán', type: 'Expense', level: 1 },
      { code: '635', name: 'Chi phí tài chính', type: 'Expense', level: 1 },
      { code: '641', name: 'Chi phí bán hàng', type: 'Expense', level: 1 },
      { code: '642', name: 'Chi phí quản lý doanh nghiệp', type: 'Expense', level: 1 },
      { code: '711', name: 'Thu nhập khác', type: 'Revenue', level: 1 },
      { code: '811', name: 'Chi phí khác', type: 'Expense', level: 1 },
      { code: '911', name: 'Xác định kết quả kinh doanh', type: 'Revenue', level: 1 },
    ];

    setIsSubmitting(true);
    try {
      for (const acc of defaultAccounts) {
        if (!accounts.some(a => a.code === acc.code)) {
          await addDoc(collection(db, 'accounts'), {
            ...acc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          await logAudit('Accounts', 'Create', `Initialized default account ${acc.code} - ${acc.name}`);
        }
      }
      setIsConfirmOpen(false);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'accounts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hệ thống tài khoản</h1>
          <p className="text-slate-500">Danh mục tài khoản kế toán theo Thông tư 200/2014/TT-BTC.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleInitDefault}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            {isSubmitting && confirmAction?.type === 'init' ? <RefreshCw size={20} className="text-blue-600 animate-spin" /> : <RefreshCw size={20} className="text-blue-600" />}
            Khởi tạo tài khoản mẫu
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} className="text-white" />
            Thêm tài khoản
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo số hiệu hoặc tên tài khoản..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">
          <Filter size={20} className="text-blue-600" />
          Bộ lọc
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#1877F2] text-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Hash size={14} className="text-blue-200" /> Số hiệu</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><BookOpen size={14} className="text-emerald-200" /> Tên tài khoản</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Info size={14} className="text-amber-200" /> Loại</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Layers size={14} className="text-purple-200" /> Cấp</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border border-white/20">
                  <div className="flex items-center justify-center gap-2"><Settings size={14} className="text-slate-200" /> Thao tác</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedAccounts.map((acc, i) => (
                <motion.tr 
                  key={acc.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 border border-slate-100">
                    <span className="font-mono font-bold text-slate-900">{acc.code}</span>
                  </td>
                  <td className="px-6 py-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                      {acc.level > 1 && <ChevronRight size={14} className="text-slate-300" style={{ marginLeft: (acc.level - 1) * 12 }} />}
                      <span className={`font-medium ${acc.level === 1 ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                        {acc.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border border-slate-100">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getBadgeColor(acc.type)}`}>
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm border border-slate-100">Cấp {acc.level}</td>
                  <td className="px-6 py-4 text-center border border-slate-100 relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === acc.code ? null : acc.code)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {openMenuId === acc.code && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-full mr-2 top-0 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden text-left"
                          >
                            <button 
                              onClick={() => handleView(acc)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                            >
                              <Eye size={16} className="text-blue-500" />
                              <span>Xem</span>
                            </button>
                            <button 
                              onClick={() => handleEdit(acc)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-all"
                            >
                              <Edit size={16} className="text-amber-500" />
                              <span>Sửa</span>
                            </button>
                            <button 
                              onClick={() => handleCopy(acc)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                            >
                              <Copy size={16} className="text-emerald-500" />
                              <span>Chép</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(acc.id)}
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Hiển thị</span>
            <select 
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border-transparent rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
            <span className="text-sm text-slate-500">
              trong tổng số <span className="font-bold text-slate-900">{filteredAccounts.length}</span> tài khoản
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
              title="Trang trước"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show a few pages if there are many
                if (
                  totalPages <= 7 || 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  (pageNum === currentPage - 2 && pageNum > 1) || 
                  (pageNum === currentPage + 2 && pageNum < totalPages)
                ) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
              title="Trang sau"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {filteredAccounts.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Không tìm thấy tài khoản nào phù hợp.</p>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa tài khoản */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <ChevronRight size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isViewOnly ? 'Chi tiết tài khoản' : editingAccountId ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                        message.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{message.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số hiệu tài khoản</label>
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isViewOnly || isSubmitting}
                      placeholder="VD: 1111"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Loại tài khoản</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as Account['type'])}
                      disabled={isViewOnly || isSubmitting}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    >
                      <option value="Asset">Tài sản</option>
                      <option value="Liability">Nợ phải trả</option>
                      <option value="Equity">Vốn chủ sở hữu</option>
                      <option value="Revenue">Doanh thu</option>
                      <option value="Expense">Chi phí</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên tài khoản</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isViewOnly || isSubmitting}
                    placeholder="VD: Tiền mặt tại quỹ"
                    className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Cấp tài khoản</label>
                    <input 
                      type="number" 
                      min={1}
                      max={5}
                      required
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      disabled={isViewOnly || isSubmitting}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tài khoản mẹ</label>
                    <input 
                      type="text" 
                      value={parentCode}
                      onChange={(e) => setParentCode(e.target.value)}
                      disabled={isViewOnly || isSubmitting}
                      placeholder="VD: 111"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Đóng
                  </button>
                  {!isViewOnly && (
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                      {editingAccountId ? 'Cập nhật' : 'Lưu tài khoản'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {confirmAction?.type === 'delete' ? 'Xác nhận xóa' : 'Khởi tạo tài khoản mẫu'}
                </h3>
                <p className="text-slate-600 mb-8">
                  {confirmAction?.type === 'delete' 
                    ? 'Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.' 
                    : 'Hệ thống sẽ thêm các tài khoản kế toán mặc định theo Thông tư 200. Bạn có chắc chắn muốn tiếp tục?'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirmOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmAction?.type === 'delete' ? executeDelete : executeInitDefault}
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                      confirmAction?.type === 'delete' 
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    {isSubmitting ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      confirmAction?.type === 'delete' ? <Trash2 size={20} /> : <CheckCircle2 size={20} />
                    )}
                    {confirmAction?.type === 'delete' ? 'Xóa ngay' : 'Khởi tạo'}
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

export default ChartOfAccounts;
