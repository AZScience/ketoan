import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  History, 
  Search, 
  RefreshCw,
  Clock,
  Info,
  Monitor,
  Globe,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface LoginLog {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  workingMonth: number;
  workingYear: number;
  timestamp: any;
  userAgent: string;
  ipAddress?: string;
}

const LoginLogList: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [limitCount, setLimitCount] = useState(50);

  useEffect(() => {
    const q = query(
      collection(db, 'login_logs'), 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoginLog[];
      setLogs(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'login_logs');
      setLoading(false);
    });

    return unsubscribe;
  }, [limitCount]);

  const filteredLogs = logs.filter(log => {
    return (
      log.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress || '').includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <History className="text-blue-600" size={28} />
            Nhật ký đăng nhập
          </h1>
          <p className="text-slate-500">Theo dõi lịch sử truy cập hệ thống của người dùng</p>
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
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, IP..."
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ IP</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kỳ làm việc</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trình duyệt</th>
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
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{log.displayName}</span>
                          <span className="text-[10px] text-slate-400">{log.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Globe size={14} className="text-slate-400" />
                        <span className="text-sm font-mono">{log.ipAddress || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {log.workingMonth}/{log.workingYear}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 max-w-xs">
                        <Monitor size={14} className="shrink-0" />
                        <span className="text-[10px] truncate" title={log.userAgent}>
                          {log.userAgent}
                        </span>
                      </div>
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

export default LoginLogList;
