import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Employee } from '../types/accounting';
import { logAudit } from '../lib/audit';
import { Search, Plus, MoreVertical, ChevronRight, ChevronLeft, Eye, Edit, Trash2, X, Save, User, Phone, Mail, MapPin, Briefcase, Building2, Copy, Hash, Settings, Info, Calculator, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

import { useWorkingContext } from '../context/WorkingContext';

const EmployeeList: React.FC = () => {
  const { workingYear, workingMonth } = useWorkingContext();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('code', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'employees');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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

  const calculateMonthlyPayroll = async () => {
    if (employees.length === 0) {
      alert('Không có nhân viên nào để tính lương.');
      return;
    }

    const monthStr = prompt('Nhập tháng cần tính lương (1-12):', workingMonth.toString());
    if (!monthStr || isNaN(Number(monthStr)) || Number(monthStr) < 1 || Number(monthStr) > 12) return;
    const month = Number(monthStr);

    const yearStr = prompt('Nhập năm cần tính lương:', workingYear.toString());
    if (!yearStr || isNaN(Number(yearStr))) return;
    const year = Number(yearStr);

    if (isPeriodClosed(month, year)) {
      alert(`Kỳ kế toán tháng ${month}/${year} đã khóa sổ. Bạn không thể tính lương.`);
      return;
    }

    if (!window.confirm(`Hệ thống sẽ tính lương cho ${employees.length} nhân viên trong tháng ${month}/${year} và tạo chứng từ kế toán. Bạn có chắc chắn?`)) return;

    try {
      const payrollRows = employees.map(emp => ({
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.name,
        salary: 10000000, // Default base salary
        allowances: {
          position: 1000000,
          responsibility: 500000,
          toxic: 0,
          other: 0
        },
        deductions: {
          insurance: 1050000,
          union: 100000,
          thueTNCN: 0
        },
        period1Amount: 5000000,
        period2Amount: 5350000,
        totalAmount: 11500000
      }));

      const totalAmount = payrollRows.reduce((sum, row) => sum + row.totalAmount, 0);

      const voucherData = {
        date: `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
        number: `BL${year}${month.toString().padStart(2, '0')}`,
        description: `Bảng lương tháng ${month}/${year}`,
        type: 'Payroll',
        totalAmount,
        items: [
          {
            debitAccount: '6421',
            creditAccount: '334',
            amount: totalAmount,
            note: `Chi phí lương tháng ${month}/${year}`
          }
        ],
        metadata: {
          payrollRows
        },
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        status: 'PendingApproval'
      };

      await addDoc(collection(db, 'vouchers'), voucherData);
      alert(`Đã tính lương thành công! Tổng số tiền: ${totalAmount.toLocaleString()} VND. Đã tạo chứng từ ${voucherData.number}`);
    } catch (error) {
      console.error("Error calculating payroll:", error);
      alert('Có lỗi xảy ra khi tính lương.');
    }
  };

  const generateDefaultCode = () => {
    const count = employees.length + 1;
    return `NV${count.toString().padStart(3, '0')}`;
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    setCode(generateDefaultCode());
    setName('');
    setPosition('');
    setDepartment('');
    setPhone('');
    setEmail('');
    setAddress('');
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
        position,
        department,
        phone,
        email,
        address,
        updatedAt: serverTimestamp()
      };

      if (editingEmployeeId) {
        await updateDoc(doc(db, 'employees', editingEmployeeId), data);
        await logAudit('Employees', 'Update', `Updated employee ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Cập nhật nhân viên thành công!' });
      } else {
        await addDoc(collection(db, 'employees'), {
          ...data,
          createdAt: serverTimestamp()
        });
        await logAudit('Employees', 'Create', `Created employee ${code} - ${name}`);
        setMessage({ type: 'success', text: 'Thêm nhân viên mới thành công!' });
      }
      
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
        setIsSubmitting(false);
      }, 1000);
    } catch (error: any) {
      handleFirestoreError(error, editingEmployeeId ? OperationType.UPDATE : OperationType.CREATE, 'employees');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thông tin nhân viên.' });
      setIsSubmitting(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.id!);
    setCode(emp.code);
    setName(emp.name);
    setPosition(emp.position || '');
    setDepartment(emp.department || '');
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setAddress(emp.address || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCopy = (emp: Employee) => {
    setEditingEmployeeId(null);
    setCode(`${emp.code}-COPY`);
    setName(emp.name);
    setPosition(emp.position || '');
    setDepartment(emp.department || '');
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setAddress(emp.address || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleView = (emp: Employee) => {
    setEditingEmployeeId(emp.id!);
    setCode(emp.code);
    setName(emp.name);
    setPosition(emp.position || '');
    setDepartment(emp.department || '');
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setAddress(emp.address || '');
    setIsViewOnly(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!employeeToDelete) return;
    const emp = employees.find(e => e.id === employeeToDelete);
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'employees', employeeToDelete));
      if (emp) {
        await logAudit('Employees', 'Delete', `Deleted employee ${emp.code} - ${emp.name}`);
      }
      setIsConfirmOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `employees/${employeeToDelete}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Danh mục nhân viên</h1>
          <p className="text-slate-500">Quản lý thông tin nhân sự trong đơn vị.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={calculateMonthlyPayroll}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Calculator size={20} />
            Tính lương
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Thêm nhân viên
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên hoặc phòng ban..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
            />
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
                  <div className="flex items-center gap-2"><Hash size={14} className="text-blue-200" /> Mã NV</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><User size={14} className="text-emerald-200" /> Họ và tên</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Briefcase size={14} className="text-amber-200" /> Chức vụ</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                  <div className="flex items-center gap-2"><Building2 size={14} className="text-purple-200" /> Phòng ban</div>
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
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 border border-slate-100">Không tìm thấy nhân viên nào</td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-blue-600 border border-slate-100">{emp.code}</td>
                    <td className="px-6 py-4 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100">{emp.position || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 border border-slate-100">{emp.department || '-'}</td>
                    <td className="px-6 py-4 border border-slate-100">
                      <div className="space-y-1">
                        {emp.phone && <div className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {emp.phone}</div>}
                        {emp.email && <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} /> {emp.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center relative border border-slate-100">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id!)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {openMenuId === emp.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-6 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden"
                            >
                              <button onClick={() => handleView(emp)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Eye size={16} className="text-blue-500" /> Xem chi tiết
                              </button>
                              <button onClick={() => handleEdit(emp)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Edit size={16} className="text-amber-500" /> Chỉnh sửa
                              </button>
                              <button onClick={() => handleCopy(emp)} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                <Copy size={16} className="text-emerald-500" /> Sao chép
                              </button>
                              <div className="h-px bg-slate-50 my-1" />
                              <button onClick={() => handleDelete(emp.id!)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                                <Trash2 size={16} /> Xóa nhân viên
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

        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredEmployees.length)} trong tổng số {filteredEmployees.length} nhân viên
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
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
                    {isViewOnly ? 'Chi tiết nhân viên' : editingEmployeeId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                  </h2>
                  <p className="text-slate-500 text-sm">Vui lòng điền đầy đủ thông tin nhân sự.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={isSubmitting}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400 shadow-sm disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="employee-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                      <User size={16} className="text-blue-500" />
                      Mã nhân viên <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: NV001"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="Nhập họ tên đầy đủ"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Briefcase size={16} className="text-amber-500" />
                      Chức vụ
                    </label>
                    <input 
                      type="text" 
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: Kế toán trưởng"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-500" />
                      Phòng ban
                    </label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: Phòng Kế toán"
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
                    placeholder="Nhập địa chỉ thường trú..."
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
                      {isSubmitting ? 'Đang lưu...' : editingEmployeeId ? 'Cập nhật' : 'Lưu nhân viên'}
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
                Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.
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

export default EmployeeList;
