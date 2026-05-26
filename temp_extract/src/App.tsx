import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle,
  BarChart3,
  Users,
  UserCircle,
  Package,
  Building2,
  RefreshCw,
  Landmark,
  Activity,
  Briefcase,
  Calendar,
  Settings,
  Calculator,
  Wallet,
  CreditCard,
  Home,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDocs, where } from 'firebase/firestore';
import { CHART_OF_ACCOUNTS } from './constants/chartOfAccounts';
import { SAMPLE_EMPLOYEES, SAMPLE_PARTNERS, SAMPLE_PRODUCTS, SAMPLE_VOUCHERS } from './constants/sampleData';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { WorkingProvider, useWorkingContext } from './context/WorkingContext';
import { NAV_ITEMS } from './constants/navigation';

// Pages
import Dashboard from './pages/Dashboard';
import ChartOfAccounts from './pages/ChartOfAccounts';
import VoucherList from './pages/VoucherList';
import FinancialReports from './pages/FinancialReports';
import InventoryReport from './pages/InventoryReport';
import EmployeeList from './pages/EmployeeList';
import PartnerList from './pages/PartnerList';
import ProductList from './pages/ProductList';
import BusinessInfo from './pages/BusinessInfo';
import OpeningBalances from './pages/OpeningBalances';
import COGSCalculation from './pages/COGSCalculation';
import ClosingEntries from './pages/ClosingEntries';
import FixedAssetList from './pages/FixedAssetList';
import DepartmentList from './pages/DepartmentList';
import WarehouseList from './pages/WarehouseList';
import ProjectList from './pages/ProjectList';
import BankAccountList from './pages/BankAccountList';
import UserSettings from './pages/UserSettings';
import AuditLogList from './pages/AuditLogList';
import LoginLogList from './pages/LoginLogList';
import PeriodList from './pages/PeriodList';
import CashFlowReport from './pages/CashFlowReport';
import OpeningBalanceWarning from './components/OpeningBalanceWarning';
import Breadcrumbs from './components/ui/Breadcrumbs';

const GROUP_CONFIG: Record<string, { icon: any, color: string }> = {
  'Tổng quan': { icon: LayoutDashboard, color: 'text-blue-400' },
  'Hệ thống & Thiết lập': { icon: Settings, color: 'text-slate-400' },
  'Danh mục & Số dư': { icon: BookOpen, color: 'text-emerald-400' },
  'Nghiệp vụ Kế toán': { icon: Calculator, color: 'text-amber-400' },
  'Báo cáo & Phân tích': { icon: BarChart3, color: 'text-rose-400' },
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const location = useLocation();
  const user = auth.currentUser;
  const { loading: workingLoading } = useWorkingContext();

  const navItems = NAV_ITEMS;

  const standaloneItems = navItems.filter(item => !item.group);
  const groupedNavItems = navItems.filter(item => item.group).reduce((acc, item) => {
    const group = item.group!;
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const handleLogout = () => signOut(auth);

  const toggleGroup = (group: string) => {
    setExpandedGroup(prev => prev === group ? null : group);
  };

  const renderNavItem = (item: any) => {
    const isActive = location.pathname === item.path;
    return (
      <motion.div
        key={item.path}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <Link
          to={item.path}
          title={!isSidebarOpen ? item.name : ''}
          className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
            isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <item.icon 
            size={20} 
            className={`flex-shrink-0 transition-all ${isSidebarOpen ? 'mr-3' : 'mx-auto'} ${!isActive ? item.color : 'text-white'}`} 
          />
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-serif">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-white flex flex-col shadow-xl z-30 no-print"
      >
        <div className={`p-6 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-xl tracking-tight text-blue-400 whitespace-nowrap overflow-hidden"
            >
              VAS ACCOUNTING
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 ${!isSidebarOpen ? 'w-full flex justify-center' : ''}`}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-4 mt-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {standaloneItems.map(renderNavItem)}
          </div>

          {Object.entries(groupedNavItems).map(([group, items]) => {
            const isExpanded = expandedGroup === group;
            const config = GROUP_CONFIG[group];
            const GroupIcon = config?.icon || BookOpen;
            
            return (
              <div key={group} className="space-y-1">
                {isSidebarOpen ? (
                  <button 
                    onClick={() => toggleGroup(group)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all mb-1 mt-4 first:mt-0 rounded-xl ${
                      isExpanded 
                        ? 'bg-slate-800/50 text-blue-400' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon size={16} className={isExpanded ? 'text-blue-400' : 'text-slate-600'} />
                      <span>{group}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <div className="flex justify-center py-4">
                    <div className="h-px bg-slate-800/50 w-8" />
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {(isExpanded || !isSidebarOpen) && (
                    <motion.div 
                      initial={isSidebarOpen ? { height: 0, opacity: 0 } : undefined}
                      animate={isSidebarOpen ? { height: 'auto', opacity: 1 } : undefined}
                      exit={isSidebarOpen ? { height: 0, opacity: 0 } : undefined}
                      className="space-y-1 overflow-hidden"
                    >
                      {items.map(renderNavItem)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <motion.button 
            onClick={handleLogout}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`w-full mt-4 flex items-center justify-center p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${!isSidebarOpen ? 'px-0' : ''}`}
            title={!isSidebarOpen ? 'Đăng xuất' : ''}
          >
            <LogOut size={20} className={isSidebarOpen ? 'mr-2' : ''} />
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto pb-8">
            <Breadcrumbs />
            <OpeningBalanceWarning />
            {workingLoading ? (
              <div className="flex items-center justify-center h-64">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : children}
          </div>
        </div>
        <footer className="bg-white border-t border-slate-200 py-3 px-8 flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest z-20 no-print">
          <div className="flex items-center gap-4">
            <span>© 2026 VAS ACCOUNTING</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>PHIÊN BẢN 2.5.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-500" />
              HỆ THỐNG ĐANG HOẠT ĐỘNG
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{user?.email?.toUpperCase() || 'KHÔNG XÁC ĐỊNH'}</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const Auth: React.FC<{ error?: string | null }> = ({ error }) => {
  const [isEmbedded, setIsEmbedded] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isInsideApp = /FBAN|FBAV|Zalo|Instagram|Line|MicroMessenger/i.test(ua);
    setIsEmbedded(isInsideApp);

    // Pre-fill from localStorage if available
    const savedMonth = localStorage.getItem('lastSelectedWorkingMonth');
    const savedYear = localStorage.getItem('lastSelectedWorkingYear');
    if (savedMonth) setSelectedMonth(Number(savedMonth));
    if (savedYear) setSelectedYear(Number(savedYear));
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    // Store selected period in localStorage to be picked up after login
    localStorage.setItem('selectedWorkingMonth', selectedMonth.toString());
    localStorage.setItem('selectedWorkingYear', selectedYear.toString());
    
    // Also save as "last used" for future pre-filling
    localStorage.setItem('lastSelectedWorkingMonth', selectedMonth.toString());
    localStorage.setItem('lastSelectedWorkingYear', selectedYear.toString());
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
      setIsLoggingIn(false);
    }
  };

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center relative z-10 border border-slate-100"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-blue-200 transform -rotate-6">
          <BookOpen size={40} className="text-white" />
        </div>
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">VAS Accounting</h1>
          <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-4" />
          <p className="text-slate-500 text-sm leading-relaxed px-4">
            Giải pháp quản trị tài chính & kế toán chuyên nghiệp, 
            tuân thủ nghiêm ngặt chuẩn mực kế toán Việt Nam.
          </p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-8 text-left flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <X className="text-rose-600" size={16} />
            </div>
            <p className="text-rose-700 text-xs font-bold leading-tight">{error}</p>
          </motion.div>
        )}

        <div className="space-y-6 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Kỳ tháng</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm"
                >
                  {months.map(m => (
                    <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Kỳ năm</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm"
                >
                  {years.map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isEmbedded ? (
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Settings size={16} className="animate-spin-slow" />
              <p className="text-xs font-black uppercase tracking-wider">Yêu cầu trình duyệt ngoài</p>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed">
              Vui lòng nhấn vào <b>biểu tượng ba chấm (...)</b> và chọn <b>"Mở bằng trình duyệt"</b> để đăng nhập an toàn qua Google.
            </p>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full flex items-center justify-center gap-3 py-5 px-6 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] ${
              isLoggingIn 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isLoggingIn ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Đăng nhập hệ thống
              </>
            )}
          </button>
        )}

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-6 opacity-40">
          <Building2 size={16} />
          <Landmark size={16} />
          <Calculator size={16} />
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setAuthError(null);
        // Sync with employee record
        const employeesRef = collection(db, 'employees');
        
        // Seed employees if empty (first run)
        const empSnapshotAll = await getDocs(employeesRef);
        if (empSnapshotAll.empty) {
          const seedPromises = SAMPLE_EMPLOYEES.map(async (emp) => {
            return addDoc(employeesRef, { ...emp, createdAt: serverTimestamp() });
          });
          await Promise.all(seedPromises);
        }

        // Check if user is in employee list
        const qEmp = query(employeesRef, where('email', '==', u.email));
        const empSnapshot = await getDocs(qEmp);
        
        if (empSnapshot.empty) {
          // User not in employee list - sign out
          await signOut(auth);
          setAuthError('Email của bạn không tồn tại trong danh sách nhân viên. Vui lòng liên hệ quản trị viên.');
          setUser(null);
          setLoading(false);
          return;
        }

        const empDoc = empSnapshot.docs[0];
        const emp = empDoc.data();
        const employeeData = {
          employeeId: empDoc.id,
          employeeCode: emp.code,
          department: emp.department,
          position: emp.position,
          phone: emp.phone,
          employeeName: emp.name // Sync name from employee record
        };

        // Get selected period from localStorage
        const selectedMonth = localStorage.getItem('selectedWorkingMonth');
        const selectedYear = localStorage.getItem('selectedWorkingYear');
        
        const userDocRef = doc(db, 'users', u.uid);
        const userUpdateData: any = {
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          lastLogin: serverTimestamp(),
          ...employeeData
        };

        const workingMonth = selectedMonth ? Number(selectedMonth) : (new Date().getMonth() + 1);
        const workingYear = selectedYear ? Number(selectedYear) : new Date().getFullYear();

        userUpdateData.workingMonth = workingMonth;
        userUpdateData.workingYear = workingYear;

        await setDoc(userDocRef, userUpdateData, { merge: true });

        // Fetch IP address
        let ipAddress = 'Unknown';
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            ipAddress = ipData.ip;
          }
        } catch (e) {
          console.error("Failed to fetch IP:", e);
        }

        // Create Login Log
        await addDoc(collection(db, 'login_logs'), {
          userId: u.uid,
          email: u.email,
          displayName: u.displayName,
          workingMonth,
          workingYear,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          ipAddress
        });

        // Clear temporary localStorage items
        localStorage.removeItem('selectedWorkingMonth');
        localStorage.removeItem('selectedWorkingYear');

        // Seed other data if empty
        // Accounts
        const accountsRef = collection(db, 'accounts');
        const accSnapshot = await getDocs(accountsRef);
        if (accSnapshot.empty) {
          const accPromises = CHART_OF_ACCOUNTS.map(async (acc) => {
            return setDoc(doc(accountsRef, acc.code), acc);
          });
          await Promise.all(accPromises);
        }

        // Partners
        const partnersRef = collection(db, 'partners');
        const partnerSnapshot = await getDocs(partnersRef);
        if (partnerSnapshot.empty) {
          const partnerPromises = SAMPLE_PARTNERS.map(async (partner) => {
            return addDoc(partnersRef, { ...partner, createdAt: serverTimestamp() });
          });
          await Promise.all(partnerPromises);
        }

        // Products
        const productsRef = collection(db, 'products');
        const productSnapshot = await getDocs(productsRef);
        if (productSnapshot.empty) {
          const productPromises = SAMPLE_PRODUCTS.map(async (product) => {
            return addDoc(productsRef, { ...product, createdAt: serverTimestamp() });
          });
          await Promise.all(productPromises);
        }

        // Vouchers
        const vouchersRef = collection(db, 'vouchers');
        const voucherSnapshot = await getDocs(vouchersRef);
        if (voucherSnapshot.empty) {
          const voucherPromises = SAMPLE_VOUCHERS.map(async (voucher) => {
            return addDoc(vouchersRef, { 
              ...voucher, 
              createdBy: u.uid,
              createdAt: serverTimestamp() 
            });
          });
          await Promise.all(voucherPromises);
        }

        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) return <Auth error={authError} />;

  return (
    <WorkingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<ChartOfAccounts />} />
            <Route path="/vouchers" element={<VoucherList />} />
            <Route path="/cogs" element={<COGSCalculation />} />
            <Route path="/closing-entries" element={<ClosingEntries />} />
            <Route path="/cash-flow" element={<CashFlowReport />} />
            <Route path="/inventory-report" element={<InventoryReport />} />
            <Route path="/reports" element={<FinancialReports />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/partners" element={<PartnerList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/fixed-assets" element={<FixedAssetList />} />
            <Route path="/bank-accounts" element={<BankAccountList />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/warehouses" element={<WarehouseList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/periods" element={<PeriodList />} />
            <Route path="/audit-logs" element={<AuditLogList />} />
            <Route path="/login-logs" element={<LoginLogList />} />
            <Route path="/opening-balances" element={<OpeningBalances />} />
            <Route path="/business-info" element={<BusinessInfo />} />
            <Route path="/user-settings" element={<UserSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </WorkingProvider>
  );
}
