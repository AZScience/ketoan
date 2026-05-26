import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Project } from '../types/accounting';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, Briefcase, Calendar, DollarSign, Info, Hash, CheckCircle2, Clock, AlertCircle, Settings, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logAudit } from '../lib/audit';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'Completed' | 'OnHold'>('Active');
  const [budget, setBudget] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredProjects = projects.filter(proj => 
    proj.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    proj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proj.customerCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const generateDefaultCode = () => {
    const count = projects.length + 1;
    return `DA${count.toString().padStart(3, '0')}`;
  };

  const resetForm = () => {
    setEditingId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    setCode(generateDefaultCode());
    setName('');
    setCustomerCode('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setStatus('Active');
    setBudget(0);
    setDescription('');
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
        customerCode,
        startDate,
        endDate,
        status,
        budget,
        description,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'projects', editingId), data);
        await logAudit('Projects', 'Update', `Cập nhật dự án: ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật dự án thành công!' });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...data,
          createdBy: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
        await logAudit('Projects', 'Create', `Thêm dự án mới: ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm dự án mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving project:", error);
      setMessage({ type: 'error', text: error.message || "Có lỗi xảy ra khi lưu thông tin dự án." });
      try {
        handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'projects');
      } catch (e) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (proj: Project) => {
    setEditingId(proj.id!);
    setIsViewOnly(false);
    setCode(proj.code);
    setName(proj.name);
    setCustomerCode(proj.customerCode || '');
    setStartDate(proj.startDate || '');
    setEndDate(proj.endDate || '');
    setStatus(proj.status || 'Active');
    setBudget(proj.budget || 0);
    setDescription(proj.description || '');
    setCreatedBy(proj.createdBy || '');
    setCreatedAt(proj.createdAt);
    setUpdatedAt(proj.updatedAt);
    setIsModalOpen(true);
  };

  const handleView = (proj: Project) => {
    setEditingId(proj.id!);
    setIsViewOnly(true);
    setCode(proj.code);
    setName(proj.name);
    setCustomerCode(proj.customerCode || '');
    setStartDate(proj.startDate || '');
    setEndDate(proj.endDate || '');
    setStatus(proj.status || 'Active');
    setBudget(proj.budget || 0);
    setDescription(proj.description || '');
    setCreatedBy(proj.createdBy || '');
    setCreatedAt(proj.createdAt);
    setUpdatedAt(proj.updatedAt);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;
    setIsSubmitting(true);
    try {
      const projDoc = await getDoc(doc(db, 'projects', projectToDelete));
      const projData = projDoc.data() as Project;
      
      await deleteDoc(doc(db, 'projects', projectToDelete));
      
      if (projData) {
        await logAudit('Projects', 'Delete', `Xóa dự án: ${projData.code} - ${projData.name}`);
      }
      
      setIsConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      handleFirestoreError(error, OperationType.DELETE, `projects/${projectToDelete}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Clock size={12} /> Đang thực hiện</span>;
      case 'Completed':
        return <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full"><CheckCircle2 size={12} /> Đã hoàn thành</span>;
      case 'OnHold':
        return <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><AlertCircle size={12} /> Tạm dừng</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh mục Dự án / Công trình</h1>
          <p className="text-slate-500">Quản lý các dự án, công trình và trung tâm chi phí</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          <span>Thêm dự án mới</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên hoặc khách hàng..."
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã dự án</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên dự án</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngân sách</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy dự án nào
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {proj.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{proj.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {proj.customerCode || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(proj.status || 'Active')}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      {proj.budget?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(proj)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(proj)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id!)}
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
              Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredProjects.length)} trong tổng số {filteredProjects.length}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {isViewOnly ? 'Chi tiết dự án' : editingId ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
                </h3>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      {message.type === 'success' ? <Save size={18} /> : <AlertCircle size={18} />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Hash size={16} className="text-slate-400" />
                      Mã dự án <span className="text-red-500">*</span>
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
                      <Briefcase size={16} className="text-slate-400" />
                      Tên dự án <span className="text-red-500">*</span>
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
                      <Hash size={16} className="text-slate-400" />
                      Mã khách hàng
                    </label>
                    <input
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Settings size={16} className="text-slate-400" />
                      Trạng thái
                    </label>
                    <select
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="Active">Đang thực hiện</option>
                      <option value="Completed">Đã hoàn thành</option>
                      <option value="OnHold">Tạm dừng</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <DollarSign size={16} className="text-slate-400" />
                      Ngân sách
                    </label>
                    <input
                      type="number"
                      disabled={isViewOnly}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Info size={16} className="text-slate-400" />
                    Mô tả dự án
                  </label>
                  <textarea
                    disabled={isViewOnly}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50 transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* System Information Group */}
                {(createdBy || createdAt || updatedAt) && (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 mb-2">
                      <Activity size={18} className="text-slate-400" />
                      <span className="font-bold text-sm uppercase tracking-wider">Thông tin hệ thống</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người thực hiện</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {createdBy ? createdBy.substring(0, 2).toUpperCase() : '??'}
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate" title={createdBy}>
                            {createdBy || 'Không xác định'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock size={14} className="text-slate-400" />
                          <p className="text-sm font-medium">
                            {createdAt ? (createdAt.toDate ? createdAt.toDate().toLocaleString('vi-VN') : new Date(createdAt).toLocaleString('vi-VN')) : '---'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật cuối</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <RefreshCw size={14} className="text-slate-400" />
                          <p className="text-sm font-medium">
                            {updatedAt ? (updatedAt.toDate ? updatedAt.toDate().toLocaleString('vi-VN') : new Date(updatedAt).toLocaleString('vi-VN')) : '---'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      form="project-form"
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 mb-8">
                Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={executeDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  {isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectList;
