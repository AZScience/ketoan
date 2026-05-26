import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { logAudit } from '../lib/audit';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Landmark,
  CreditCard,
  Building2,
  Globe,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Save,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  currency: string;
  ownerName: string;
  status: 'Active' | 'Inactive';
  createdAt: any;
}

const BankAccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: '',
    branch: '',
    currency: 'VND',
    ownerName: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  useEffect(() => {
    const q = query(collection(db, 'bank_accounts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BankAccount[];
      setAccounts(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bank_accounts');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingAccount) {
        await updateDoc(doc(db, 'bank_accounts', editingAccount.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        await logAudit('BankAccounts', 'Update', `Updated bank account ${formData.accountNumber} - ${formData.bankName}`);
        setMessage({ type: 'success', text: 'Cập nhật tài khoản ngân hàng thành công!' });
      } else {
        await addDoc(collection(db, 'bank_accounts'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        await logAudit('BankAccounts', 'Create', `Created bank account ${formData.accountNumber} - ${formData.bankName}`);
        setMessage({ type: 'success', text: 'Thêm tài khoản ngân hàng mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingAccount(null);
        setFormData({
          accountNumber: '',
          bankName: '',
          branch: '',
          currency: 'VND',
          ownerName: '',
          status: 'Active'
        });
        setIsSubmitting(false);
      }, 1000);
    } catch (error: any) {
      handleFirestoreError(error, editingAccount ? OperationType.UPDATE : OperationType.CREATE, 'bank_accounts');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thông tin tài khoản.' });
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!accountToDelete) return;
    const acc = accounts.find(a => a.id === accountToDelete);
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'bank_accounts', accountToDelete));
      if (acc) {
        await logAudit('BankAccounts', 'Delete', `Deleted bank account ${acc.accountNumber} - ${acc.bankName}`);
      }
      setIsConfirmOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bank_accounts/${accountToDelete}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tài khoản ngân hàng</h1>
          <p className="text-slate-500 text-sm">Quản lý danh sách tài khoản ngân hàng của doanh nghiệp</p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormData({
              accountNumber: '',
              bankName: '',
              branch: '',
              currency: 'VND',
              ownerName: '',
              status: 'Active'
            });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Thêm tài khoản
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo số tài khoản, ngân hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngân hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Số tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chủ tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tiền tệ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Landmark size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{acc.bankName}</p>
                          <p className="text-xs text-slate-500">{acc.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" />
                        <span className="font-mono font-medium text-slate-700">{acc.accountNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{acc.ownerName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {acc.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${
                        acc.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {acc.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {acc.status === 'Active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingAccount(acc);
                            setFormData({
                              accountNumber: acc.accountNumber,
                              bankName: acc.bankName,
                              branch: acc.branch,
                              currency: acc.currency,
                              ownerName: acc.ownerName,
                              status: acc.status
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy tài khoản ngân hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={24} />
                </button>
              </div>

              <form id="bank-account-form" onSubmit={handleSubmit} className="p-8 space-y-6">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                        message.type === 'success' 
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                          : 'bg-rose-50 border border-rose-100 text-rose-700'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Tên ngân hàng</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Ví dụ: Vietcombank, Techcombank..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Số tài khoản</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        placeholder="Nhập số tài khoản..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Chủ tài khoản</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        required
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Tên chủ tài khoản..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Chi nhánh</label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Tên chi nhánh..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tiền tệ</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <label className="text-sm font-bold text-slate-700">Trạng thái:</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.status === 'Active'}
                          onChange={() => setFormData({ ...formData, status: 'Active' })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Hoạt động</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.status === 'Inactive'}
                          onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">Ngừng</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="bank-account-form"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
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
                    {isSubmitting ? 'Đang lưu...' : editingAccount ? 'Cập nhật' : 'Lưu tài khoản'}
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
                <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
                <p className="text-slate-600 mb-8">
                  Bạn có chắc chắn muốn xóa tài khoản ngân hàng này? Hành động này không thể hoàn tác.
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
                    onClick={executeDelete}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    Xóa ngay
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

export default BankAccountList;
