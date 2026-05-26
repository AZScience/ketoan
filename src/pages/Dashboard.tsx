import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, Account } from '../types/accounting';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  FileDown,
  PlusCircle,
  FileText,
  Users,
  Package,
  Settings,
  Plus,
  Trash2,
  Check,
  X,
  Layout,
  RotateCcw,
  GripVertical,
  PlusSquare,
  Building,
  PieChart,
  Filter,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { safeFormat } from '../utils/dateUtils';
import { useWorkingContext } from '../context/WorkingContext';
import { exportSystemAnalysisToWord } from '../utils/exportSystemAnalysis';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Legend
} from 'recharts';
import { logAudit } from '../lib/audit';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface SortableWidgetProps {
  id: string;
  isEditing: boolean;
  onRemove: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ id, isEditing, onRemove, children, className }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${className}`}
    >
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 cursor-grab active:cursor-grabbing hover:text-blue-600 hover:border-blue-200 shadow-sm"
            title="Kéo để sắp xếp"
          >
            <GripVertical size={18} />
          </div>
          <button
            onClick={() => onRemove(id)}
            className="p-2 bg-white border border-slate-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-200 shadow-sm"
            title="Gỡ bỏ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

const ALL_ACTIONS = [
  { id: 'vouchers', label: 'Lập chứng từ', icon: PlusCircle, path: '/vouchers?tab=templates', color: 'blue' },
  { id: 'ledger', label: 'Sổ cái', icon: FileText, path: '/reports?tab=general_ledger', color: 'indigo' },
  { id: 'warehouse', label: 'Nhập kho', icon: Package, path: '/vouchers?type=01 - VT', color: 'amber' },
  { id: 'employees', label: 'Nhân viên', icon: Users, path: '/employees', color: 'purple' },
  { id: 'tax', label: 'Báo cáo thuế', icon: FileText, path: '/reports?tab=vat_report', color: 'emerald' },
  { id: 'config', label: 'Cấu hình', icon: Settings, path: '/business-info', color: 'slate' },
  { id: 'partners', label: 'Đối tác', icon: Users, path: '/partners', color: 'orange' },
  { id: 'products', label: 'Sản phẩm', icon: Package, path: '/products', color: 'pink' },
  { id: 'accounts', label: 'Tài khoản', icon: FileText, path: '/accounts', color: 'cyan' },
  { id: 'projects', label: 'Dự án', icon: Layout, path: '/projects', color: 'rose' },
];

const ALL_WIDGETS = [
  { id: 'stats', label: 'Chỉ số chính', description: 'Doanh thu, chi phí, số dư' },
  { id: 'quick_actions', label: 'Truy cập nhanh', description: 'Các phím tắt chức năng' },
  { id: 'business_chart', label: 'Biểu đồ kết quả', description: 'Phân tích doanh thu & chi phí' },
  { id: 'expense_pie', label: 'Cơ cấu chi phí', description: 'Phân tích chi phí theo nhóm tài khoản' },
  { id: 'recent_transactions', label: 'Giao dịch gần đây', description: '5 chứng từ mới nhất' },
  { id: 'account_balances', label: 'Số dư tài khoản', description: 'Chi tiết số dư các tài khoản' },
  { id: 'business_info', label: 'Thông tin đơn vị', description: 'Thông tin cơ bản của doanh nghiệp' },
  { id: 'management_report', label: 'Báo cáo quản trị', description: 'Báo cáo tùy chỉnh theo chỉ tiêu' },
];

const Dashboard: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [openingBalances, setOpeningBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { workingYear, workingMonth } = useWorkingContext();

  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : ['stats', 'quick_actions', 'business_chart', 'recent_transactions'];
  });

  const [activeActions, setActiveActions] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_actions');
    return saved ? JSON.parse(saved) : ['vouchers', 'ledger', 'warehouse', 'employees', 'tax', 'config'];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [reportConfig, setReportConfig] = useState(() => {
    const saved = localStorage.getItem('dashboard_report_config');
    return saved ? JSON.parse(saved) : {
      metric: 'revenue',
      period: 'current_month',
      filter: 'all'
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_report_config', JSON.stringify(reportConfig));
  }, [reportConfig]);

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    localStorage.setItem('dashboard_actions', JSON.stringify(activeActions));
  }, [activeActions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setActiveWidgets((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        logAudit('Dashboard', 'Reorder', `Sắp xếp lại các widget: ${newOrder.join(', ')}`);
        return newOrder;
      });
    }
  };

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter(w => w !== id) : [...prev, id];
      logAudit('Dashboard', isRemoving ? 'RemoveWidget' : 'AddWidget', `${isRemoving ? 'Gỡ bỏ' : 'Thêm'} widget: ${id}`);
      return next;
    });
  };

  const toggleAction = (id: string) => {
    setActiveActions(prev => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter(a => a !== id) : [...prev, id];
      logAudit('Dashboard', isRemoving ? 'RemoveAction' : 'AddAction', `${isRemoving ? 'Gỡ bỏ' : 'Thêm'} phím tắt: ${id}`);
      return next;
    });
  };

  const resetDashboard = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục giao diện mặc định?')) {
      setActiveWidgets(['stats', 'quick_actions', 'business_chart', 'recent_transactions']);
      setActiveActions(['vouchers', 'ledger', 'warehouse', 'employees', 'tax', 'config']);
      logAudit('Dashboard', 'Reset', 'Khôi phục giao diện mặc định');
    }
  };

  const handleExportDoc = async () => {
    try {
      await exportSystemAnalysisToWord();
    } catch (error) {
      console.error("Lỗi khi xuất Word:", error);
    }
  };

  useEffect(() => {
    // Filter vouchers by workingYear and workingMonth
    const monthStr = workingMonth.toString().padStart(2, '0');
    const startOfPeriod = `${workingYear}-${monthStr}-01`;
    const lastDay = new Date(workingYear, workingMonth, 0).getDate();
    const endOfPeriod = `${workingYear}-${monthStr}-${lastDay}`;

    const q = query(
      collection(db, 'vouchers'), 
      orderBy('date', 'desc')
    );
    
    const unsubscribeVouchers = onSnapshot(q, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      // Client-side filter for the selected working period and Posted status
      const filtered = allVouchers.filter(v => 
        v.date >= startOfPeriod && 
        v.date <= endOfPeriod && 
        v.status === 'Posted'
      );
      setVouchers(filtered);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
    });

    const unsubscribeAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => doc.data() as Account));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
    });

    const unsubscribeOB = onSnapshot(query(collection(db, 'opening_balances'), where('year', '==', workingYear)), (snapshot) => {
      setOpeningBalances(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'opening_balances');
      setLoading(false);
    });

    return () => {
      unsubscribeVouchers();
      unsubscribeAccounts();
      unsubscribeOB();
    };
  }, [workingYear, workingMonth]);

  const calculateAccountBalance = (accountCode: string) => {
    let balance = 0;
    
    // Opening balance
    openingBalances.forEach(ob => {
      if (ob.accountCode.startsWith(accountCode)) {
        balance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

    // Transactions
    vouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.debitAccount?.startsWith(accountCode)) {
          balance += item.amount || 0;
        }
        if (item.creditAccount?.startsWith(accountCode)) {
          balance -= item.amount || 0;
        }
      });
    });
    return balance;
  };

  const cashBalance = calculateAccountBalance('111') + calculateAccountBalance('112');

  const totalRevenue = vouchers
    .filter(v => v.type === 'Sales' || v.type === 'Receipt')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const totalExpense = vouchers
    .filter(v => v.type === 'Purchase' || v.type === 'Payment' || v.type === 'Payroll')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const recentTransactions = vouchers.slice(0, 5);

  const expenseByGroup = vouchers
    .filter(v => v.type === 'Purchase' || v.type === 'Payment' || v.type === 'Payroll')
    .reduce((acc: any[], v) => {
      v.items?.forEach(item => {
        if (item.debitAccount?.startsWith('6')) {
          const group = item.debitAccount.substring(0, 3);
          const existing = acc.find(a => a.name === group);
          if (existing) {
            existing.value += item.amount || 0;
          } else {
            acc.push({ name: group, value: item.amount || 0 });
          }
        }
      });
      return acc;
    }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const chartData = [
    { name: 'Doanh thu', value: totalRevenue, color: '#3b82f6' },
    { name: 'Chi phí', value: totalExpense, color: '#ef4444' },
    { name: 'Lợi nhuận', value: totalRevenue - totalExpense, color: '#10b981' },
  ];

  const formatCurrency = (val: number) => {
    if (isNaN(val) || val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tổng quan tài chính</h1>
            <p className="text-slate-500">Chào mừng bạn trở lại với hệ thống kế toán VAS.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <button 
              onClick={resetDashboard}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all"
              title="Khôi phục mặc định"
            >
              <RotateCcw size={20} />
              Mặc định
            </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              isEditing ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layout size={20} />
            {isEditing ? 'Hoàn tất' : 'Tùy chỉnh'}
          </button>
          <button 
            onClick={handleExportDoc}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all"
          >
            <FileDown size={20} className="text-blue-600" />
            Xuất Word
          </button>
        </div>
      </header>

      {isEditing && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-blue-50 border border-blue-100 p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Chế độ tùy chỉnh</h3>
              <p className="text-sm text-blue-700">Chọn các khối và chức năng bạn muốn hiển thị trên trang tổng quan.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                <Plus size={20} />
                Thêm khối
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_WIDGETS.map(widget => (
              <div 
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  activeWidgets.includes(widget.id) 
                    ? 'border-blue-500 bg-white shadow-md' 
                    : 'border-slate-200 bg-slate-50 opacity-60 grayscale'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900">{widget.label}</p>
                  <p className="text-xs text-slate-500">{widget.description}</p>
                </div>
                {activeWidgets.includes(widget.id) ? (
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    <Check size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider">Chức năng truy cập nhanh</h4>
            <div className="flex flex-wrap gap-3">
              {ALL_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    activeActions.includes(action.id)
                      ? 'bg-white text-blue-600 border-2 border-blue-500 shadow-sm'
                      : 'bg-slate-100 text-slate-400 border-2 border-transparent'
                  }`}
                >
                  <action.icon size={16} />
                  {action.label}
                  {activeActions.includes(action.id) && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={activeWidgets}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeWidgets.map((widgetId) => {
              const spanClass = ['stats', 'quick_actions', 'account_balances', 'business_info'].includes(widgetId) ? 'lg:col-span-2' : '';
              
              return (
                <SortableWidget 
                  key={widgetId} 
                  id={widgetId} 
                  isEditing={isEditing} 
                  onRemove={toggleWidget}
                  className={spanClass}
                >
                  {widgetId === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Tổng doanh thu', value: totalRevenue, icon: TrendingUp, color: 'blue', iconColor: 'text-blue-600', trend: '+12%' },
                        { label: 'Tổng chi phí', value: totalExpense, icon: TrendingDown, color: 'red', iconColor: 'text-red-600', trend: '+5%' },
                        { label: 'Số dư tiền mặt & TG', value: cashBalance, icon: Wallet, color: 'emerald', iconColor: 'text-emerald-600', trend: '-2%' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group h-full"
                        >
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
                          <div className="relative z-10">
                            <div className={`w-12 h-12 bg-${stat.color}-100 ${stat.iconColor} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                              <stat.icon size={24} />
                            </div>
                            <p className="text-slate-500 font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stat.value)}</h3>
                            <div className="mt-4 flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${stat.color}-50 ${stat.iconColor}`}>
                                {stat.trend}
                              </span>
                              <span className="text-xs text-slate-400">so với tháng trước</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {widgetId === 'quick_actions' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {ALL_ACTIONS.filter(a => activeActions.includes(a.id)).map((action, i) => (
                        <Link 
                          to={action.path} 
                          key={i}
                          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col items-center gap-3 text-center group h-full"
                        >
                          <div className={`w-10 h-10 bg-${action.color}-50 text-${action.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <action.icon size={20} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {widgetId === 'business_chart' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Biểu đồ kết quả kinh doanh</h3>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}M`} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              formatter={(val: number) => formatCurrency(val)}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}

                  {widgetId === 'expense_pie' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Cơ cấu chi phí</h3>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={expenseByGroup}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {expenseByGroup.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(val: number) => formatCurrency(val)}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  )}

                  {widgetId === 'recent_transactions' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Giao dịch gần đây</h3>
                        <Link to="/vouchers?tab=list" className="text-blue-600 text-sm font-bold hover:underline">Xem tất cả</Link>
                      </div>
                      <div className="space-y-4">
                        {recentTransactions.length > 0 ? (
                          recentTransactions.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  v.type === 'Sales' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {v.type === 'Sales' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{v.number}</p>
                                  <p className="text-xs text-slate-500">{v.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold ${v.type === 'Sales' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {v.type === 'Sales' ? '+' : '-'}{formatCurrency(v.totalAmount)}
                                </p>
                                <p className="text-xs text-slate-400">{safeFormat(v.date, 'dd/MM/yyyy')}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-slate-400">Chưa có giao dịch nào phát sinh.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {widgetId === 'account_balances' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Số dư tài khoản tiêu biểu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {accounts.filter(a => a.code.startsWith('111') || a.code.startsWith('112') || a.code.startsWith('131') || a.code.startsWith('331')).map((acc, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                {acc.code}
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tài khoản</p>
                                <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{acc.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-slate-900">{formatCurrency(calculateAccountBalance(acc.code))}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {widgetId === 'business_info' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Thông tin đơn vị</h3>
                        <Link to="/business-info" className="text-blue-600 text-sm font-bold hover:underline">Cấu hình</Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                            <Building size={32} />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tên đơn vị</p>
                            <p className="text-lg font-bold text-slate-900">Công ty TNHH Giải pháp VAS</p>
                            <p className="text-sm text-slate-500">Hệ thống kế toán chuẩn mực Việt Nam</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Mã số thuế</p>
                            <p className="text-lg font-bold text-slate-700">0123456789</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Kỳ kế toán</p>
                            <p className="text-lg font-bold text-slate-700">{workingMonth}/{workingYear}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {widgetId === 'management_report' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                            <PieChart size={20} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">Báo cáo quản trị tùy chỉnh</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select 
                              value={reportConfig.metric}
                              onChange={(e) => setReportConfig({...reportConfig, metric: e.target.value})}
                              className="pl-3 pr-8 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 appearance-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                              <option value="revenue">Doanh thu</option>
                              <option value="expense">Chi phí</option>
                              <option value="profit">Lợi nhuận</option>
                              <option value="cash">Dòng tiền</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          </div>
                          <div className="relative">
                            <select 
                              value={reportConfig.period}
                              onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})}
                              className="pl-3 pr-8 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 appearance-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                              <option value="current_month">Tháng này</option>
                              <option value="last_month">Tháng trước</option>
                              <option value="current_year">Năm nay</option>
                            </select>
                            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                              <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(val: number) => formatCurrency(val)}
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Chỉ tiêu phân tích</p>
                            <p className="text-lg font-bold text-purple-900">
                              {reportConfig.metric === 'revenue' ? 'Doanh thu thuần' : 
                               reportConfig.metric === 'expense' ? 'Tổng chi phí' : 
                               reportConfig.metric === 'profit' ? 'Lợi nhuận gộp' : 'Dòng tiền thuần'}
                            </p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Giá trị thực hiện</p>
                            <p className="text-lg font-bold text-slate-900">
                              {reportConfig.metric === 'revenue' ? formatCurrency(totalRevenue) : 
                               reportConfig.metric === 'expense' ? formatCurrency(totalExpense) : 
                               reportConfig.metric === 'profit' ? formatCurrency(totalRevenue - totalExpense) : formatCurrency(cashBalance)}
                            </p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tỷ lệ so với kế hoạch</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: '85%' }} />
                              </div>
                              <span className="text-sm font-bold text-slate-700">85%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Dashboard;
