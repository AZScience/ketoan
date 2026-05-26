import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Partner, PartnerType } from '../types/accounting';
import { logAudit } from '../lib/audit';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, Building2, MapPin, Phone, Mail, User, Tag, Copy, Hash, Globe, Info, Settings, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PartnerList: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<PartnerType | 'All'>('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<PartnerType>('Customer');
  const [contactPerson, setContactPerson] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.taxId?.includes(searchTerm);
    const matchesType = filterType === 'All' || p.type === filterType || p.type === 'Both';
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredPartners.length / rowsPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const generateDefaultCode = (partnerType: PartnerType) => {
    const prefix = partnerType === 'Customer' ? 'KH' : partnerType === 'Supplier' ? 'NCC' : 'DT';
    const typePartners = partners.filter(p => p.type === partnerType);
    
    if (typePartners.length === 0) return `${prefix}001`;
    
    const codes = typePartners
      .map(p => {
        const match = p.code.match(/\d+$/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(n => n > 0);
      
    if (codes.length === 0) return `${prefix}001`;
    
    const maxCode = Math.max(...codes);
    return `${prefix}${(maxCode + 1).toString().padStart(3, '0')}`;
  };

  const resetForm = (initialType?: PartnerType) => {
    setEditingPartnerId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    const defaultType = initialType || (filterType !== 'All' ? filterType : 'Customer');
    setType(defaultType);
    setCode(generateDefaultCode(defaultType));
    setName('');
    setTaxId('');
    setAddress('');
    setPhone('');
    setEmail('');
    setContactPerson('');
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
        taxId,
        address,
        phone,
        email,
        type,
        contactPerson,
        updatedAt: serverTimestamp()
      };

      if (editingPartnerId) {
        await updateDoc(doc(db, 'partners', editingPartnerId), data);
        await logAudit('Partners', 'Update', `Updated partner ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật đối tác thành công!' });
      } else {
        await addDoc(collection(db, 'partners'), {
          ...data,
          createdAt: serverTimestamp()
        });
        await logAudit('Partners', 'Create', `Created partner ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm đối tác mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setIsSubmitting(false);
      }, 1000);
    } catch (error: any) {
      handleFirestoreError(error, editingPartnerId ? OperationType.UPDATE : OperationType.CREATE, 'partners');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thông tin đối tác.' });
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p: Partner) => {
    setEditingPartnerId(p.id!);
    setCode(p.code);
    setName(p.name);
    setTaxId(p.taxId || '');
    setAddress(p.address || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setType(p.type);
    setContactPerson(p.contactPerson || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCopy = (p: Partner) => {
    setEditingPartnerId(null);
    setCode(`${p.code}-COPY`);
    setName(p.name);
    setTaxId(p.taxId || '');
    setAddress(p.address || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setType(p.type);
    setContactPerson(p.contactPerson || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleView = (p: Partner) => {
    setEditingPartnerId(p.id!);
    setCode(p.code);
    setName(p.name);
    setTaxId(p.taxId || '');
    setAddress(p.address || '');
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setType(p.type);
    setContactPerson(p.contactPerson || '');
    setIsViewOnly(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setPartnerToDelete(id);
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!partnerToDelete) return;
    const partner = partners.find(p => p.id === partnerToDelete);
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'partners', partnerToDelete));
      if (partner) {
        await logAudit('Partners', 'Delete', `Deleted partner ${partner.code} - ${partner.name}`);
      }
      setIsConfirmOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `partners/${partnerToDelete}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Customer': return 'bg-emerald-100 text-emerald-700';
      case 'Supplier': return 'bg-amber-100 text-amber-700';
      case 'Both': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'Customer': return 'Khách hàng';
      case 'Supplier': return 'Nhà cung cấp';
      case 'Both': return 'Cả hai';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Khách hàng & Nhà cung cấp</h1>
          <p className="text-slate-500">Quản lý danh mục đối tác kinh doanh.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          Thêm đối tác
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm theo mã, tên hoặc MST..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-600"
            >
              <option value="All">Tất cả loại</option>
              <option value="Customer">Khách hàng</option>
              <option value="Supplier">Nhà cung cấp</option>
              <option value="Both">Cả hai</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Hiển thị</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-slate-50 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dòng</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#1877F2] text-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Hash size={14} className="text-blue-200" /> Mã đối tác</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><User size={14} className="text-emerald-200" /> Tên đối tượng</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Info size={14} className="text-amber-200" /> Loại</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Globe size={14} className="text-purple-200" /> MST</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-rose-200" /> Liên hệ</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border border-white/20">
                  <div className="flex items-center justify-center gap-2"><Settings size={14} className="text-slate-200" /> Thao tác</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 border border-slate-100">Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 border border-slate-100">Không tìm thấy đối tượng nào</td>
                </tr>
              ) : (
                paginatedPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 border border-slate-100">{p.code}</td>
                    <td className="px-6 py-4 border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{p.name}</span>
                        {p.address && <span className="text-xs text-slate-400 truncate max-w-xs">{p.address}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 border border-slate-100">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(p.type)}`}>
                        {getTypeText(p.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono border border-slate-100">{p.taxId || '-'}</td>
                    <td className="px-6 py-4 border border-slate-100">
                      <div className="space-y-1">
                        {p.phone && <div className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {p.phone}</div>}
                        {p.contactPerson && <div className="text-xs text-slate-500 flex items-center gap-1"><User size={12} /> {p.contactPerson}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center relative border border-slate-100">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id!)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === p.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-6 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden text-left"
                            >
                              <button onClick={() => handleView(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Eye size={16} className="text-blue-500" /> Xem chi tiết
                              </button>
                              <button onClick={() => handleEdit(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Edit size={16} className="text-amber-500" /> Chỉnh sửa
                              </button>
                              <button onClick={() => handleCopy(p)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Copy size={16} className="text-emerald-500" /> Sao chép
                              </button>
                              <div className="h-px bg-slate-50 my-1" />
                              <button onClick={() => handleDelete(p.id!)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                                <Trash2 size={16} /> Xóa đối tượng
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

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 order-2 sm:order-1">
            Hiển thị <span className="font-bold text-slate-700">{filteredPartners.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * rowsPerPage, filteredPartners.length)}</span> trong tổng số <span className="font-bold text-slate-700">{filteredPartners.length}</span> đối tác
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Trang đầu"
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-400"
              >
                <ChevronLeft size={20} className="-mr-3" />
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                title="Trang trước"
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-slate-300">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-600'}`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              
              <div className="md:hidden flex items-center px-4 font-bold text-sm text-slate-600">
                {currentPage} / {totalPages}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                title="Trang sau"
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-600"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Trang cuối"
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors text-slate-400"
              >
                <ChevronRight size={20} />
                <ChevronRight size={20} className="-ml-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isViewOnly ? 'Chi tiết đối tác' : editingPartnerId ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'}
                  </h2>
                  <p className="text-slate-500 text-sm">Vui lòng điền đầy đủ thông tin khách hàng/nhà cung cấp.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 shadow-sm disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="partner-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      Loại đối tác <span className="text-red-500">*</span>
                    </label>
                    <select 
                      required
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as PartnerType;
                        setType(newType);
                        if (!editingPartnerId && (code === '' || code === generateDefaultCode(type))) {
                          setCode(generateDefaultCode(newType));
                        }
                      }}
                      disabled={isViewOnly}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Customer">Khách hàng</option>
                      <option value="Supplier">Nhà cung cấp</option>
                      <option value="Both">Cả hai</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" />
                      Mã đối tác <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: KH001"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" />
                      Tên đối tác <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập tên công ty hoặc cá nhân"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Tag size={16} className="text-slate-500" />
                      Mã số thuế
                    </label>
                    <input 
                      type="text" 
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập mã số thuế"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-indigo-500" />
                      Người liên hệ
                    </label>
                    <input 
                      type="text" 
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Họ tên người liên hệ"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Phone size={16} className="text-purple-500" />
                      Số điện thoại
                    </label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập số điện thoại"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Mail size={16} className="text-red-500" />
                      Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập địa chỉ email"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-500" />
                    Địa chỉ
                  </label>
                  <textarea 
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isViewOnly}
                    placeholder="Nhập địa chỉ trụ sở..."
                    className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {!isViewOnly && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                      }`}
                    >
                      {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {isSubmitting ? 'Đang lưu...' : editingPartnerId ? 'Cập nhật' : 'Lưu đối tác'}
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
                Bạn có chắc chắn muốn xóa đối tác này? Hành động này không thể hoàn tác.
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

export default PartnerList;
