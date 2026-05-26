import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, Calendar, Lock, Unlock, CheckCircle2, AlertCircle, Hash, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountingPeriod {
  id?: string;
  year: number;
  month: number;
  status: 'Open' | 'Closed';
  closedAt?: any;
  closedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

const PeriodList: React.FC = () => {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'toggle' | 'delete', period?: AccountingPeriod, id?: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open');

  useEffect(() => {
    const q = query(collection(db, 'periods'), orderBy('year', 'desc'), orderBy('month', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPeriods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountingPeriod)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'periods');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredPeriods = periods.filter(p => 
    p.year.toString().includes(searchTerm) || 
    p.month.toString().includes(searchTerm)
  );

  const resetForm = () => {
    setEditingId(null);
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    setStatus('Open');
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = {
        year,
        month,
        status,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'periods', editingId), data);
        setMessage({ type: 'success', text: 'Cập nhật kỳ kế toán thành công!' });
      } else {
        // Check if period already exists
        const exists = periods.find(p => p.year === year && p.month === month);
        if (exists) {
          setMessage({ type: 'error', text: 'Kỳ kế toán này đã tồn tại!' });
          setIsSubmitting(false);
          return;
        }
        await addDoc(collection(db, 'periods'), {
          ...data,
          createdAt: serverTimestamp()
        });
        setMessage({ type: 'success', text: 'Thêm kỳ kế toán mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'periods');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu kỳ kế toán.' });
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (period: AccountingPeriod) => {
    setConfirmAction({ type: 'toggle', period });
    setIsConfirmOpen(true);
  };

  const executeToggleStatus = async () => {
    if (!confirmAction?.period) return;
    const period = confirmAction.period;
    const newStatus = period.status === 'Open' ? 'Closed' : 'Open';
    setIsSubmitting(true);
    
    try {
      await updateDoc(doc(db, 'periods', period.id!), {
        status: newStatus,
        closedAt: newStatus === 'Closed' ? serverTimestamp() : null,
        updatedAt: serverTimestamp()
      });
      setIsConfirmOpen(false);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `periods/${period.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'delete', id });
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmAction?.id) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'periods', confirmAction.id));
      setIsConfirmOpen(false);
      setConfirmAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `periods/${confirmAction.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kỳ kế toán & Khóa sổ</h1>
          <p className="text-slate-500">Quản lý các kỳ kế toán và trạng thái đóng/mở sổ</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          <span>Thêm kỳ kế toán</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo năm hoặc tháng..."
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kỳ kế toán</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày khóa sổ</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ) : filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Chưa có kỳ kế toán nào được thiết lập
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${period.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Tháng {period.month} / {period.year}</div>
                          <div className="text-xs text-slate-500">Kỳ kế toán định kỳ</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {period.status === 'Open' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                          <Unlock size={12} /> Đang mở
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <Lock size={12} /> Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {period.closedAt ? (period.closedAt.toDate ? period.closedAt.toDate().toLocaleDateString('vi-VN') : period.closedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(period)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            period.status === 'Open' 
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {period.status === 'Open' ? <Lock size={16} /> : <Unlock size={16} />}
                          <span>{period.status === 'Open' ? 'Khóa sổ' : 'Mở sổ'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(period.id!)}
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
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Chỉnh sửa kỳ kế toán' : 'Thêm kỳ kế toán mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tháng</label>
                    <select
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Năm</label>
                    <input
                      type="number"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Trạng thái ban đầu</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        className="hidden"
                        disabled={isSubmitting}
                        checked={status === 'Open'}
                        onChange={() => setStatus('Open')}
                      />
                      <Unlock size={18} className={status === 'Open' ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-sm font-medium ${status === 'Open' ? 'text-blue-700' : 'text-slate-600'}`}>Mở sổ</span>
                    </label>
                    <label className={`flex-1 flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-slate-500 has-[:checked]:bg-slate-50 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        className="hidden"
                        disabled={isSubmitting}
                        checked={status === 'Closed'}
                        onChange={() => setStatus('Closed')}
                      />
                      <Lock size={18} className={status === 'Closed' ? 'text-slate-600' : 'text-slate-400'} />
                      <span className={`text-sm font-medium ${status === 'Closed' ? 'text-slate-700' : 'text-slate-600'}`}>Khóa sổ</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thiết lập'}</span>
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
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  confirmAction?.type === 'delete' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {confirmAction?.type === 'delete' ? <Trash2 size={32} /> : <AlertCircle size={32} />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {confirmAction?.type === 'delete' ? 'Xác nhận xóa' : 'Xác nhận thay đổi'}
                </h3>
                <p className="text-slate-500 mb-6">
                  {confirmAction?.type === 'delete' 
                    ? 'Bạn có chắc chắn muốn xóa kỳ kế toán này? Hành động này không thể hoàn tác.'
                    : confirmAction?.period?.status === 'Open'
                      ? `Bạn có chắc chắn muốn khóa sổ kỳ ${confirmAction.period.month}/${confirmAction.period.year}? Sau khi khóa sổ, bạn sẽ không thể thêm hoặc sửa chứng từ trong kỳ này.`
                      : `Bạn có chắc chắn muốn mở lại kỳ ${confirmAction?.period?.month}/${confirmAction?.period?.year}?`
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setIsConfirmOpen(false); setConfirmAction(null); }}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmAction?.type === 'delete' ? executeDelete : executeToggleStatus}
                    className={`flex-1 px-4 py-2 rounded-xl text-white font-semibold transition-all shadow-lg ${
                      confirmAction?.type === 'delete' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    Xác nhận
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

export default PeriodList;
