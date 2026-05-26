import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  BarChart3,
  Users,
  UserCircle,
  Package,
  Building2,
  Shield,
  RefreshCw,
  Landmark,
  Activity,
  Briefcase,
  Calendar,
  Settings,
  Calculator,
  Wallet,
  CreditCard,
  Home
} from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Bàn làm việc', path: '/', icon: LayoutDashboard, group: 'Tổng quan', color: 'text-blue-500' },
  
  { name: 'Thông tin Doanh nghiệp', path: '/business-info', icon: Settings, group: 'Hệ thống & Thiết lập', color: 'text-cyan-500' },
  { name: 'Hệ thống tài khoản', path: '/accounts', icon: BookOpen, group: 'Hệ thống & Thiết lập', color: 'text-indigo-500' },
  { name: 'Kỳ kế toán & Khóa sổ', path: '/periods', icon: Calendar, group: 'Hệ thống & Thiết lập', color: 'text-rose-500' },
  { name: 'Cài đặt người dùng', path: '/user-settings', icon: Shield, group: 'Hệ thống & Thiết lập', color: 'text-blue-500' },
  { name: 'Nhật ký đăng nhập', path: '/login-logs', icon: Activity, group: 'Hệ thống & Thiết lập', color: 'text-blue-400' },
  { name: 'Nhật ký hoạt động', path: '/audit-logs', icon: Activity, group: 'Hệ thống & Thiết lập', color: 'text-slate-500' },

  { name: 'Số dư đầu kỳ', path: '/opening-balances', icon: Calculator, group: 'Danh mục & Số dư', color: 'text-emerald-500' },
  { name: 'Đối tác (KH/NCC)', path: '/partners', icon: Users, group: 'Danh mục & Số dư', color: 'text-rose-500' },
  { name: 'Nhân viên', path: '/employees', icon: UserCircle, group: 'Danh mục & Số dư', color: 'text-purple-500' },
  { name: 'Phòng ban', path: '/departments', icon: Building2, group: 'Danh mục & Số dư', color: 'text-indigo-500' },
  { name: 'Vật tư hàng hóa', path: '/products', icon: Package, group: 'Danh mục & Số dư', color: 'text-orange-500' },
  { name: 'Kho bãi', path: '/warehouses', icon: Home, group: 'Danh mục & Số dư', color: 'text-amber-500' },
  { name: 'Tài sản cố định', path: '/fixed-assets', icon: Landmark, group: 'Danh mục & Số dư', color: 'text-red-500' },
  { name: 'Tài khoản ngân hàng', path: '/bank-accounts', icon: CreditCard, group: 'Danh mục & Số dư', color: 'text-blue-400' },
  { name: 'Dự án / Công trình', path: '/projects', icon: Briefcase, group: 'Danh mục & Số dư', color: 'text-emerald-500' },
  
  { name: 'Chứng từ kế toán', path: '/vouchers', icon: FileText, group: 'Nghiệp vụ Kế toán', color: 'text-emerald-500' },
  { name: 'Hóa đơn bán hàng', path: '/vouchers?type=Sales', icon: FileText, group: 'Nghiệp vụ Kế toán', color: 'text-blue-500' },
  { name: 'Hóa đơn mua hàng', path: '/vouchers?type=Purchase', icon: FileText, group: 'Nghiệp vụ Kế toán', color: 'text-rose-500' },
  { name: 'Tính giá vốn hàng bán', path: '/cogs', icon: Calculator, group: 'Nghiệp vụ Kế toán', color: 'text-orange-500' },
  { name: 'Kết chuyển cuối kỳ', path: '/closing-entries', icon: RefreshCw, group: 'Nghiệp vụ Kế toán', color: 'text-indigo-500' },
  
  { name: 'Báo cáo tài chính', path: '/reports', icon: BarChart3, group: 'Báo cáo & Phân tích', color: 'text-amber-500' },
  { name: 'Báo cáo Nhập - Xuất - Tồn', path: '/inventory-report', icon: Package, group: 'Báo cáo & Phân tích', color: 'text-emerald-500' },
  { name: 'Lưu chuyển tiền tệ', path: '/cash-flow', icon: Wallet, group: 'Báo cáo & Phân tích', color: 'text-blue-500' },
];
