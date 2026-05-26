import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AuditLog } from '../types/accounting';
import { 
  History, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

const AuditLogList: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [limitCount, setLimitCount] = useState(50);

  useEffect(() => {
    let q = query(
      collection(db, 'audit_logs'), 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (moduleFilter !== 'All') {
      q = query(q, where('module', '==', moduleFilter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'audit_logs');
      setLoading(false);
    });

    return unsubscribe;
  }, [moduleFilter, limitCount]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const modules = ['All', 'ChartOfAccounts', 'Vouchers', 'Partners', 'Products', 'Employees', 'BankAccounts', 'Warehouses'];
  const actions = ['All', 'Create', 'Update', 'Delete', 'StatusUpdate', 'Copy', 'Init'];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create': return 'text-emerald-600 bg-emerald-50';
      case 'Update': return 'text-amber-600 bg-amber-50';
      case 'Delete': return 'text-rose-600 bg-rose-50';
      case 'StatusUpdate': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <History className="text-blue-600" size={28} />
            Nhật ký truy cập
          </h1>
          <p className="text-slate-500">Theo dõi các thay đổi và hoạt động trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLoading(true)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Làm mới"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo người dùng, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none min-w-[160px]"
                >
                  {modules.map(m => (
                    <option key={m} value={m}>{m === 'All' ? 'Tất cả phân hệ' : m}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none min-w-[140px]"
                >
                  {actions.map(a => (
                    <option key={a} value={a}>{a === 'All' ? 'Tất cả thao tác' : a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phân hệ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw size={24} className="animate-spin" />
                      <span>Đang tải nhật ký...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {log.timestamp ? format((log.timestamp as Timestamp).toDate(), 'dd/MM/yyyy HH:mm:ss', { locale: vi }) : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {log.timestamp ? format((log.timestamp as Timestamp).toDate(), 'p', { locale: vi }) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.userId.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Info size={32} />
                      <span>Không tìm thấy nhật ký nào phù hợp.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="text-sm text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{filteredLogs.length}</span> bản ghi gần nhất
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Số lượng:</span>
            <select
              value={limitCount}
              onChange={(e) => setLimitCount(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogList;
