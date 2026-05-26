import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, Account, OpeningBalance, Department, Project } from '../types/accounting';
import { FileText, Download, Printer, Filter, ChevronDown, Eye, X, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Landmark, Receipt, Package, User, Calendar, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { utils, writeFile } from 'xlsx';

import { useWorkingContext } from '../context/WorkingContext';
import { TrialBalance } from '../components/reports/TrialBalance';
import { GeneralJournal } from '../components/reports/GeneralJournal';
import { GeneralLedger } from '../components/reports/GeneralLedger';
import { DetailedInventoryLedger } from '../components/reports/DetailedInventoryLedger';
import { DetailedPartnerLedger } from '../components/reports/DetailedPartnerLedger';
import { CashBook } from '../components/reports/CashBook';
import { BankBook } from '../components/reports/BankBook';
import { InventorySummary } from '../components/reports/InventorySummary';
import { PartnerDebtSummary } from '../components/reports/PartnerDebtSummary';
import { BalanceSheet } from '../components/reports/BalanceSheet';
import { IncomeStatement } from '../components/reports/IncomeStatement';
import { VATReport } from '../components/reports/VATReport';
import { FixedAssetReport } from '../components/reports/FixedAssetReport';
import { AgingReport } from '../components/reports/AgingReport';
import { CashFlowStatement } from '../components/reports/CashFlowStatement';
import { PayrollReport } from '../components/reports/PayrollReport';
import { InventoryValuationReport } from '../components/reports/InventoryValuationReport';
import { ProfitAnalysis } from '../components/reports/ProfitAnalysis';
import { DetailedLedger } from '../components/reports/DetailedLedger';
import { NotesToFinancialStatements } from '../components/reports/NotesToFinancialStatements';
import { DepartmentExpenseReport } from '../components/reports/DepartmentExpenseReport';
import { ProjectRevenueReport } from '../components/reports/ProjectRevenueReport';

const FinancialReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<any>(tabParam || 'balance');
  const { workingYear, workingMonth } = useWorkingContext();

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  const [filters, setFilters] = useState({
    startDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-01`,
    endDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-${new Date(workingYear, workingMonth, 0).getDate()}`,
    accountCode: '',
    partnerId: '',
    productId: '',
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      startDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-01`,
      endDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-${new Date(workingYear, workingMonth, 0).getDate()}`,
    }));
  }, [workingYear, workingMonth]);

  const reportOptions = [
    { id: 'balance', name: 'Báo cáo tình hình tài chính', category: 'Báo cáo tài chính', icon: Landmark },
    { id: 'income', name: 'Báo cáo kết quả hoạt động kinh doanh', category: 'Báo cáo tài chính', icon: TrendingUp },
    { id: 'profit_analysis', name: 'Phân tích lợi nhuận (Gộp, Thuần, Sau thuế)', category: 'Báo cáo quản trị', icon: BarChart3 },
    { id: 'cashflow_direct', name: 'Báo cáo lưu chuyển tiền tệ\n(Trực tiếp)', category: 'Báo cáo tài chính', icon: Wallet },
    { id: 'cashflow_indirect', name: 'Báo cáo lưu chuyển tiền tệ\n(Gián tiếp)', category: 'Báo cáo tài chính', icon: PieChart },
    { id: 'trial_balance', name: 'Bảng cân đối số phát sinh', category: 'Báo cáo tổng hợp', icon: BarChart3 },
    { id: 'detailed_ledger', name: 'Sổ chi tiết tài khoản', category: 'Sổ kế toán', icon: FileText },
    { id: 'general_journal', name: 'Sổ nhật ký chung', category: 'Sổ kế toán', icon: FileText },
    { id: 'general_ledger', name: 'Sổ cái', category: 'Sổ kế toán', icon: Landmark },
    { id: 'notes', name: 'Bản thuyết minh BCTC', category: 'Báo cáo tài chính', icon: FileText },
    { id: 'inventory_ledger', name: 'Sổ chi tiết vật tư', category: 'Sổ kế toán', icon: Package },
    { id: 'partner_ledger', name: 'Sổ chi tiết công nợ', category: 'Sổ kế toán', icon: User },
    { id: 'cash_book', name: 'Sổ quỹ tiền mặt', category: 'Sổ kế toán', icon: Wallet },
    { id: 'bank_book', name: 'Sổ tiền gửi ngân hàng', category: 'Sổ kế toán', icon: Landmark },
    { id: 'inventory_summary', name: 'Báo cáo Tổng hợp Nhập - Xuất - Tồn', category: 'Báo cáo kho', icon: Package },
    { id: 'inventory_valuation', name: 'Báo cáo Tổng hợp Giá trị Tồn kho', category: 'Báo cáo kho', icon: Package },
    { id: 'dept_expense', name: 'Chi phí theo bộ phận', category: 'Báo cáo quản trị', icon: Building2 },
    { id: 'proj_revenue', name: 'Hiệu quả theo dự án', category: 'Báo cáo quản trị', icon: Briefcase },
    { id: 'partner_debt_summary', name: 'Tổng hợp công nợ', category: 'Báo cáo công nợ', icon: User },
    { id: 'receivable_aging', name: 'Tuổi nợ phải thu', category: 'Báo cáo công nợ', icon: Calendar },
    { id: 'payable_aging', name: 'Tuổi nợ phải trả', category: 'Báo cáo công nợ', icon: Calendar },
    { id: 'vat_report', name: 'Bảng kê thuế GTGT', category: 'Báo cáo thuế', icon: Receipt },
    { id: 'fixed_asset_report', name: 'Báo cáo tài sản cố định', category: 'Báo cáo tài sản', icon: Landmark },
    { id: 'payroll_report', name: 'Báo cáo tiền lương', category: 'Báo cáo nhân sự', icon: User },
  ];

  // View Details Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState<any>(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'vouchers'), 
      where('date', '>=', `${workingYear}-01-01`),
      where('date', '<=', filters.endDate),
      orderBy('date', 'desc')
    );
    const unsubscribeV = onSnapshot(q, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      const postedVouchers = allVouchers.filter(v => v.status === 'Posted');
      setVouchers(postedVouchers);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
    });

    const unsubscribeA = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => doc.data() as Account));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
    });

    const unsubscribeC = onSnapshot(doc(db, 'settings', 'company'), (snapshot) => {
      if (snapshot.exists()) {
        setCompanyInfo(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/company');
    });

    const unsubscribeP = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    const unsubscribePart = onSnapshot(collection(db, 'partners'), (snapshot) => {
      setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'partners');
    });

    const unsubscribeOB = onSnapshot(query(collection(db, 'opening_balances'), where('year', '==', workingYear)), (snapshot) => {
      setOpeningBalances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OpeningBalance)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'opening_balances');
    });

    const unsubscribeD = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'departments');
    });

    const unsubscribeProj = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    return () => {
      unsubscribeV();
      unsubscribeA();
      unsubscribeC();
      unsubscribeP();
      unsubscribePart();
      unsubscribeOB();
      unsubscribeD();
      unsubscribeProj();
    };
  }, [workingYear, filters.startDate, filters.endDate]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      startDate: `${workingYear}-01-01`,
      endDate: `${workingYear}-12-31`,
    }));
  }, [workingYear]);

  const calculateBalance = (accountCode: string) => {
    let balance = 0;
    
    // Add opening balances from DB
    openingBalances.forEach(ob => {
      if (ob.accountCode.startsWith(accountCode)) {
        balance += (ob.debit || 0) - (ob.credit || 0);
      }
    });

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

  const calculateIncome = (accountCode: string) => {
    let income = 0;
    vouchers.forEach(v => {
      v.items?.forEach(item => {
        if (item.creditAccount?.startsWith(accountCode)) {
          income += item.amount || 0;
        }
        if (item.debitAccount?.startsWith(accountCode)) {
          income -= item.amount || 0;
        }
      });
    });
    return income;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const reports = {
    balance: {
      title: 'Báo cáo tình hình tài chính',
      form: 'Mẫu số B01-DN / B01/BCTCNN',
      items: [
        { label: 'I. TÀI SẢN', code: '100', isHeader: true },
        { label: '1. Tiền và các khoản tương đương tiền', code: '110', accounts: ['111', '112'] },
        { label: '2. Các khoản phải thu', code: '120', accounts: ['131', '136', '138'] },
        { label: '3. Hàng tồn kho', code: '130', accounts: ['152', '153'] },
        { label: '4. Tài sản cố định', code: '140', accounts: ['211', '212', '213', '214'] },
        { label: '5. Tài sản khác', code: '150', accounts: ['133', '141'] },
        { label: 'II. NỢ PHẢI TRẢ', code: '200', isHeader: true },
        { label: '1. Nợ ngắn hạn', code: '210', accounts: ['331', '333', '334', '338'] },
        { label: '2. Nợ dài hạn', code: '220', accounts: ['341'] },
        { label: 'III. TÀI SẢN THUẦN', code: '300', isHeader: true },
        { label: '1. Nguồn vốn kinh doanh', code: '310', accounts: ['411'] },
        { label: '2. Thặng dư/thâm hụt lũy kế', code: '320', accounts: ['421'] },
      ]
    },
    income: {
      title: 'Báo cáo kết quả hoạt động kinh doanh',
      form: 'Mẫu số B02-DN / B02/BCTCNN',
      items: [
        { label: 'I. THU NHẬP', code: '01', isHeader: true },
        { label: '1. Doanh thu bán hàng / Thu hoạt động', code: '01.1', accounts: ['511'] },
        { label: '2. Doanh thu dịch vụ / Thu hoạt động SXKD', code: '01.2', accounts: ['531'] },
        { label: '3. Thu nhập khác', code: '01.3', accounts: ['711'] },
        { label: 'II. CHI PHÍ', code: '02', isHeader: true },
        { label: '1. Chi phí hoạt động / Giá vốn', code: '02.1', accounts: ['611'] },
        { label: '2. Chi phí bán hàng / Dự án', code: '02.2', accounts: ['612'] },
        { label: '3. Chi phí quản lý', code: '02.3', accounts: ['642'] },
        { label: '4. Chi phí khác', code: '02.4', accounts: ['811'] },
        { label: 'III. THẶNG DƯ/THÂM HỤT TRONG KỲ', code: '03', formula: '01.1 + 01.2 + 01.3 - 02.1 - 02.2 - 02.3 - 02.4' },
      ]
    },
    cashflow_direct: {
      title: 'Báo cáo lưu chuyển tiền tệ (Trực tiếp)',
      form: 'Mẫu số B03-DN / B03/BCTCNN',
      items: [
        { label: 'I. Lưu chuyển tiền từ hoạt động nghiệp vụ', code: '10', isHeader: true },
        { label: '1. Tiền thu từ hoạt động nghiệp vụ', code: '01', accounts: ['111', '112'] },
        { label: '2. Tiền chi cho hoạt động nghiệp vụ', code: '02', accounts: ['111', '112'] },
        { label: 'Lưu chuyển tiền thuần từ hoạt động nghiệp vụ', code: '10', formula: '01 - 02' },
        { label: 'II. Lưu chuyển tiền từ hoạt động đầu tư', code: '20', isHeader: true },
        { label: '1. Tiền chi mua sắm TSCĐ', code: '21', accounts: ['111', '112'] },
        { label: '2. Tiền thu từ thanh lý TSCĐ', code: '22', accounts: ['111', '112'] },
        { label: 'Lưu chuyển tiền thuần từ hoạt động đầu tư', code: '20', formula: '21 + 22' },
        { label: 'III. Lưu chuyển tiền từ hoạt động tài chính', code: '30', isHeader: true },
        { label: '1. Tiền thu từ vốn góp', code: '31', accounts: ['111', '112'] },
        { label: '2. Tiền trả nợ gốc vay', code: '32', accounts: ['111', '112'] },
        { label: 'Lưu chuyển tiền thuần từ hoạt động tài chính', code: '30', formula: '31 + 32' },
        { label: 'Lưu chuyển tiền thuần trong kỳ', code: '40', formula: '10 + 20 + 30' },
        { label: 'Tiền và tương đương tiền đầu kỳ', code: '50', accounts: ['111', '112'] },
        { label: 'Tiền và tương đương tiền cuối kỳ', code: '60', formula: '40 + 50' },
      ]
    },
    cashflow_indirect: {
      title: 'Báo cáo lưu chuyển tiền tệ (Gián tiếp)',
      form: 'Mẫu số B03-DN / B03/BCTCNN',
      items: [
        { label: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', code: '20', isHeader: true },
        { label: '1. Lợi nhuận trước thuế', code: '01', formula: 'income.50' },
        { label: '2. Điều chỉnh cho các khoản', code: '02', isHeader: true },
        { label: ' - Khấu hao TSCĐ và BĐSĐT', code: '02', accounts: ['214'] },
        { label: ' - Các khoản dự phòng', code: '03', accounts: ['129', '139', '159'] },
        { label: ' - Lãi, lỗ chênh lệch tỷ giá hối đoái', code: '04', accounts: ['413'] },
        { label: ' - Lãi, lỗ từ hoạt động đầu tư', code: '05', accounts: ['515', '635'] },
        { label: ' - Chi phí lãi vay', code: '06', accounts: ['635'] },
        { label: '3. Lợi nhuận từ hoạt động kinh doanh trước thay đổi vốn lưu động', code: '08', formula: '01+02+03+04+05+06' },
        { label: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', code: '20', formula: '08' },
        { label: 'II. Lưu chuyển tiền từ hoạt động đầu tư', code: '30', isHeader: true },
        { label: 'Lưu chuyển tiền thuần từ hoạt động đầu tư', code: '30', accounts: ['111', '112'] },
        { label: 'III. Lưu chuyển tiền từ hoạt động tài chính', code: '40', isHeader: true },
        { label: 'Lưu chuyển tiền thuần từ hoạt động tài chính', code: '40', accounts: ['111', '112'] },
        { label: 'Lưu chuyển tiền thuần trong kỳ', code: '50', formula: '20+30+40' },
        { label: 'Tiền và tương đương tiền đầu kỳ', code: '60', accounts: ['111', '112'] },
        { label: 'Tiền và tương đương tiền cuối kỳ', code: '70', formula: '50+60' },
      ]
    }
  };

  const getReportValue = (reportKey: keyof typeof reports, itemCode: string): number => {
    const report = reports[reportKey];
    const item = report.items.find(i => i.code === itemCode);
    if (!item) return 0;

    const anyItem = item as any;

    if (anyItem.formula) {
      // Simple formula evaluation (only supports + and - for now)
      const parts = anyItem.formula.split(/([+-])/);
      let total = 0;
      let currentOp = '+';
      
      parts.forEach((part: string) => {
        const trimmed = part.trim();
        if (trimmed === '+' || trimmed === '-') {
          currentOp = trimmed;
        } else if (trimmed) {
          let val = 0;
          if (trimmed.includes('.')) {
            const [otherReport, otherCode] = trimmed.split('.');
            val = getReportValue(otherReport as any, otherCode);
          } else {
            val = getReportValue(reportKey, trimmed);
          }
          total = currentOp === '+' ? total + val : total - val;
        }
      });
      return total;
    }

    if (anyItem.accounts) {
      return anyItem.accounts.reduce((sum: number, code: string) => {
        const balance = calculateBalance(code);
        // For Balance Sheet: Assets (1xx, 2xx) are usually Debit, Liabilities/Equity (3xx, 4xx) are Credit
        if (reportKey === 'balance') {
          if (code.startsWith('3') || code.startsWith('4')) return sum - balance;
          return sum + balance;
        }
        // For Income Statement: Revenue (5xx, 7xx) are Credit, Expenses (6xx, 8xx) are Debit
        if (code.startsWith('5') || code.startsWith('7')) return sum - balance;
        return sum + balance;
      }, 0);
    }

    return 0;
  };

  const handleViewDetails = (item: any) => {
    setSelectedReportItem(item);
    setIsViewModalOpen(true);
  };

  const getFilteredVouchers = (item: any) => {
    if (!item.accounts) return [];
    return vouchers.filter(v => 
      v.items?.some(ti => 
        item.accounts.some((accCode: string) => 
          ti.debitAccount?.startsWith(accCode) || ti.creditAccount?.startsWith(accCode)
        )
      ) || false
    );
  };

  const handlePrint = () => {
    setIsPrintPreviewOpen(true);
  };

  const executePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (activeTab === 'inventory_summary') {
      const summaryData = calculateInventorySummary();
      const data = summaryData.map(row => ({
        'Mã hàng': row.code,
        'Tên hàng': row.name,
        'ĐVT': row.unit,
        'Tồn đầu SL': row.openingQty,
        'Tồn đầu Giá trị': row.openingValue,
        'Nhập SL': row.importQty,
        'Nhập Giá trị': row.importValue,
        'Xuất SL': row.exportQty,
        'Xuất Giá trị': row.exportValue,
        'Tồn cuối SL': row.closingQty,
        'Tồn cuối Giá trị': row.closingValue
      }));
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'NhapXuatTon');
      writeFile(wb, `BaoCao_NhapXuatTon_${workingYear}.xlsx`);
      return;
    }

    if (activeTab === 'inventory_valuation') {
      const valuationData = calculateInventoryValuation();
      const data = valuationData.map(row => ({
        'Mã hàng': row.code,
        'Tên hàng': row.name,
        'ĐVT': row.unit,
        'SL Tồn': row.closingQty,
        'Giá trị FIFO': row.fifoValue,
        'Giá trị LIFO': row.lifoValue,
        'Giá trị Bình quân': row.avgCostValue
      }));
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'GiaTriTonKho');
      writeFile(wb, `BaoCao_GiaTriTonKho_${workingYear}.xlsx`);
      return;
    }

    const report = reports[activeTab as keyof typeof reports];
    if (!report) {
      // Handle export for components that don't use the 'reports' object
      alert('Chức năng xuất Excel cho báo cáo này đang được cập nhật.');
      return;
    }
    const data = report.items.map(item => {
      const value = getReportValue(activeTab, item.code);
      return {
        'Chỉ tiêu': item.label,
        'Mã số': item.code,
        'Thuyết minh': '-',
        'Năm nay': value,
        'Năm trước': 0
      };
    });

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, activeTab);
    writeFile(wb, `${report.title}.xlsx`);
  };

  const calculateInventorySummary = () => {
    return products.map(product => {
      let openingQty = product.openingQty || 0;
      let openingValue = product.openingValue || 0;
      let importQty = 0;
      let importValue = 0;
      let exportQty = 0;
      let exportValue = 0;

      vouchers.forEach(v => {
        const isBeforeRange = v.date < filters.startDate;
        const isInRange = v.date >= filters.startDate && v.date <= filters.endDate;

        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            const isInventoryAccount = (acc?: string) => 
              acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

            if (isBeforeRange) {
              if (isInventoryAccount(item.debitAccount)) {
                openingQty += item.quantityActual || 0;
                openingValue += item.amount || 0;
              } else if (isInventoryAccount(item.creditAccount)) {
                openingQty -= item.quantityActual || 0;
                openingValue -= item.amount || 0;
              }
            } else if (isInRange) {
              if (isInventoryAccount(item.debitAccount)) {
                importQty += item.quantityActual || 0;
                importValue += item.amount || 0;
              } else if (isInventoryAccount(item.creditAccount)) {
                exportQty += item.quantityActual || 0;
                exportValue += item.amount || 0;
              }
            }
          }
        });
      });

      return {
        ...product,
        openingQty,
        openingValue,
        importQty,
        importValue,
        exportQty,
        exportValue,
        closingQty: openingQty + importQty - exportQty,
        closingValue: openingValue + importValue - exportValue
      };
    });
  };

  const calculateInventoryValuation = () => {
    const isInventoryAccount = (acc?: string) => 
      acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

    return products.map(product => {
      const productVouchers = vouchers
        .filter(v => v.date <= filters.endDate)
        .sort((a, b) => {
          const dateComp = a.date.localeCompare(b.date);
          if (dateComp !== 0) return dateComp;
          return 0;
        });

      const initialQty = product.openingQty || 0;
      const initialValue = product.openingValue || 0;
      const initialCost = initialQty > 0 ? initialValue / initialQty : 0;

      // Average Cost
      let totalImportQty = initialQty;
      let totalImportValue = initialValue;
      let totalExportQty = 0;

      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              totalImportQty += item.quantityActual || 0;
              totalImportValue += item.amount || 0;
            } else if (isInventoryAccount(item.creditAccount)) {
              totalExportQty += item.quantityActual || 0;
            }
          }
        });
      });

      const closingQty = totalImportQty - totalExportQty;
      const avgCost = totalImportQty > 0 ? totalImportValue / totalImportQty : 0;
      const avgCostValue = Math.max(0, closingQty * avgCost);

      // FIFO
      let fifoBatches: {qty: number, cost: number}[] = initialQty > 0 ? [{ qty: initialQty, cost: initialCost }] : [];
      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              const qty = item.quantityActual || 0;
              const amount = item.amount || 0;
              if (qty > 0) fifoBatches.push({ qty, cost: amount / qty });
            } else if (isInventoryAccount(item.creditAccount)) {
              let qtyToExport = item.quantityActual || 0;
              while (qtyToExport > 0 && fifoBatches.length > 0) {
                if (fifoBatches[0].qty <= qtyToExport) {
                  qtyToExport -= fifoBatches[0].qty;
                  fifoBatches.shift();
                } else {
                  fifoBatches[0].qty -= qtyToExport;
                  qtyToExport = 0;
                }
              }
            }
          }
        });
      });
      const fifoValue = fifoBatches.reduce((sum, b) => sum + (b.qty * b.cost), 0);

      // LIFO
      let lifoBatches: {qty: number, cost: number}[] = initialQty > 0 ? [{ qty: initialQty, cost: initialCost }] : [];
      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              const qty = item.quantityActual || 0;
              const amount = item.amount || 0;
              if (qty > 0) lifoBatches.push({ qty, cost: amount / qty });
            } else if (isInventoryAccount(item.creditAccount)) {
              let qtyToExport = item.quantityActual || 0;
              while (qtyToExport > 0 && lifoBatches.length > 0) {
                const lastIdx = lifoBatches.length - 1;
                if (lifoBatches[lastIdx].qty <= qtyToExport) {
                  qtyToExport -= lifoBatches[lastIdx].qty;
                  lifoBatches.pop();
                } else {
                  lifoBatches[lastIdx].qty -= qtyToExport;
                  qtyToExport = 0;
                }
              }
            }
          }
        });
      });
      const lifoValue = lifoBatches.reduce((sum, b) => sum + (b.qty * b.cost), 0);

      return {
        ...product,
        closingQty,
        fifoValue,
        lifoValue,
        avgCostValue
      };
    });
  };

  const ReportContent = ({ printMode = false }: { printMode?: boolean }) => {
    let content = null;
    
    if (activeTab === 'balance') {
      content = <BalanceSheet vouchers={vouchers} accounts={accounts} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'income') {
      content = <IncomeStatement vouchers={vouchers} accounts={accounts} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'trial_balance') {
      content = <TrialBalance vouchers={vouchers} accounts={accounts} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'detailed_ledger') {
      content = <DetailedLedger vouchers={vouchers} accounts={accounts} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'general_journal') {
      content = <GeneralJournal vouchers={vouchers} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'general_ledger') {
      content = <GeneralLedger vouchers={vouchers} accounts={accounts} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'notes') {
      content = <NotesToFinancialStatements workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'inventory_ledger') {
      content = <DetailedInventoryLedger vouchers={vouchers} products={products} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'partner_ledger') {
      content = <DetailedPartnerLedger vouchers={vouchers} partners={partners} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'cash_book') {
      content = <CashBook vouchers={vouchers} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'bank_book') {
      content = <BankBook vouchers={vouchers} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'inventory_summary') {
      content = <InventorySummary vouchers={vouchers} products={products} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'inventory_valuation') {
      content = <InventoryValuationReport vouchers={vouchers} products={products} openingBalances={openingBalances} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'partner_debt_summary') {
      content = <PartnerDebtSummary vouchers={vouchers} partners={partners} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'vat_report') {
      content = <VATReport vouchers={vouchers} partners={partners} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'fixed_asset_report') {
      content = <FixedAssetReport workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'receivable_aging') {
      content = <AgingReport vouchers={vouchers} partners={partners} openingBalances={openingBalances} workingYear={workingYear} filters={filters} type="receivable" />;
    } else if (activeTab === 'payable_aging') {
      content = <AgingReport vouchers={vouchers} partners={partners} openingBalances={openingBalances} workingYear={workingYear} filters={filters} type="payable" />;
    } else if (activeTab === 'cashflow_direct') {
      content = <CashFlowStatement vouchers={vouchers} openingBalances={openingBalances} workingYear={workingYear} filters={filters} method="direct" />;
    } else if (activeTab === 'cashflow_indirect') {
      content = <CashFlowStatement vouchers={vouchers} openingBalances={openingBalances} workingYear={workingYear} filters={filters} method="indirect" />;
    } else if (activeTab === 'payroll_report') {
      content = <PayrollReport vouchers={vouchers} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'dept_expense') {
      content = <DepartmentExpenseReport vouchers={vouchers} departments={departments} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'proj_revenue') {
      content = <ProjectRevenueReport vouchers={vouchers} projects={projects} workingYear={workingYear} filters={filters} />;
    } else if (activeTab === 'profit_analysis') {
      content = <ProfitAnalysis vouchers={vouchers} accounts={accounts} workingYear={workingYear} filters={filters} />;
    }

    if (!content) {
      const currentReport = reports[activeTab as keyof typeof reports];
      if (!currentReport) return null;

      content = (
        <>
          <div className="p-8 text-center relative">
            <div className="absolute top-8 right-8 text-right text-xs text-slate-400">
              <p className="font-bold">{currentReport.form}</p>
              <p>(Kèm theo Thông tư số 99/2018/TT-BTC)</p>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase whitespace-pre-line">
              {currentReport.title}
            </h2>
            <p className="text-slate-500 mt-2">Kỳ kế toán: Năm {workingYear}</p>
            <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#1877F2] text-white">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-200" />
                      Chỉ tiêu
                    </div>
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                    <div className="flex items-center gap-2">
                      <Landmark size={14} className="text-blue-200" />
                      Mã số
                    </div>
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                    <div className="flex items-center gap-2">
                      <Receipt size={14} className="text-blue-200" />
                      Thuyết minh
                    </div>
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-right border border-white/20">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingUp size={14} className="text-emerald-300" />
                      Năm nay
                    </div>
                  </th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-right border border-white/20">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingDown size={14} className="text-red-300" />
                      Năm trước
                    </div>
                  </th>
                  {!printMode && <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-center border border-white/20">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentReport.items.map((item, i) => {
                  const value = getReportValue(activeTab as keyof typeof reports, item.code);
                  const rowId = `${item.code}-${i}`;
                  return (
                    <tr key={rowId} className={`hover:bg-slate-50/50 transition-colors ${item.isHeader ? 'bg-slate-50/30' : ''}`}>
                      <td className={`px-8 py-4 border border-slate-100 ${item.isHeader ? 'font-bold text-slate-900' : 'text-slate-700 pl-12'}`}>
                        {item.label}
                      </td>
                      <td className="px-8 py-4 text-slate-500 font-mono text-sm border border-slate-100">{item.code}</td>
                      <td className="px-8 py-4 text-slate-400 text-sm border border-slate-100">-</td>
                      <td className={`px-8 py-4 text-right font-bold border border-slate-100 ${value < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatCurrency(Math.abs(value))}
                      </td>
                      <td className="px-8 py-4 text-right text-slate-400 border border-slate-100">0</td>
                      {!printMode && (
                        <td className="px-8 py-4 text-center border border-slate-100">
                            <button 
                              onClick={() => handleViewDetails(item)}
                              title="Xem chi tiết"
                              className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                              <Eye size={18} />
                            </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    return (
      <div className={`${printMode ? 'bg-white p-0' : 'bg-white overflow-hidden print-report'}`}>
        {content}
        
        {printMode && (
          <>
            {activeTab === 'balance' && (
              <div className="p-12 pt-0 text-[10px] text-slate-500 italic space-y-1">
                <p>Ghi chú:</p>
                <p>(1) Những chỉ tiêu không có số liệu được miễn trình bày nhưng không được đánh lại "Mã số" chỉ tiêu.</p>
                <p>(2) Số liệu trong các chỉ tiêu có dấu (*) được ghi bằng số âm dưới hình thức ghi trong ngoặc đơn (...).</p>
                <p>(3) Đối với doanh nghiệp có kỳ kế toán năm là năm dương lịch (X) thì "Số cuối năm" có thể ghi là "31.12.X"; "Số đầu năm" có thể ghi là "01.01.X".</p>
              </div>
            )}

            {activeTab === 'income' && (
              <div className="p-12 pt-0 flex justify-between items-end">
                <div className="text-[10px] text-slate-500 italic">
                  <p>(*) Chỉ tiêu này không áp dụng đối với doanh nghiệp không có cổ phiếu phổ thông.</p>
                </div>
                <div className="text-right text-xs italic text-slate-500">
                  <p>Lập, ngày ...... tháng ...... năm .........</p>
                </div>
              </div>
            )}

            {(activeTab === 'cashflow_direct' || activeTab === 'cashflow_indirect') && (
              <div className="p-12 pt-0 flex justify-end items-end">
                <div className="text-right text-xs italic text-slate-500">
                  <p>Lập, ngày ...... tháng ...... năm .........</p>
                </div>
              </div>
            )}

            <div className="px-12 pt-8 border-t border-slate-100 mt-8">
              <p className="font-bold text-center text-slate-900 text-xs">PHÊ DUYỆT CỦA CƠ QUAN QUẢN LÝ CẤP TRÊN (NẾU CÓ)</p>
            </div>
            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="font-bold text-slate-900 uppercase">Người lập biểu</p>
                <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên)</p>
                <div className="h-24"></div>
                <p className="font-bold text-slate-900">............................</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 uppercase">Kế toán trưởng</p>
                <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên)</p>
                <div className="h-24"></div>
                <p className="font-bold text-slate-900">............................</p>
              </div>
              <div>
                <p className="italic text-xs text-slate-400 mb-1">Ngày .... tháng .... năm ....</p>
                <p className="font-bold text-slate-900 uppercase">Người đại diện theo pháp luật</p>
                <p className="text-slate-400 text-xs italic mt-1">(Ký, họ tên, đóng dấu)</p>
                <div className="h-24"></div>
                <p className="font-bold text-slate-900">............................</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Báo cáo tài chính</h1>
          </div>
          <p className="text-slate-500 ml-13">Hệ thống báo cáo chuẩn theo Thông tư 99/2018/TT-BTC.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all"
          >
            <Printer size={18} className="text-blue-600" /> In báo cáo
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Download size={18} className="text-white" /> Xuất Excel
          </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              Loại báo cáo
            </label>
            <div className="relative">
              <select 
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold text-slate-700"
              >
                {Array.from(new Set(reportOptions.map(o => o.category))).map(cat => (
                  <optgroup key={cat} label={cat}>
                    {reportOptions.filter(o => o.category === cat).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Từ ngày
            </label>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Đến ngày
            </label>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            />
          </div>

          {/* Dynamic Filters based on Report Type */}
          {(activeTab === 'general_ledger' || activeTab === 'trial_balance') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Landmark size={14} className="text-blue-500" />
                Tài khoản
              </label>
              <select 
                value={filters.accountCode}
                onChange={(e) => setFilters(prev => ({ ...prev, accountCode: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-sm"
              >
                <option value="">Tất cả tài khoản</option>
                {accounts.map(acc => (
                  <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
                ))}
              </select>
            </div>
          )}

          {(activeTab === 'inventory_ledger' || activeTab === 'inventory_summary') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Package size={14} className="text-blue-500" />
                Vật tư / Hàng hóa
              </label>
              <select 
                value={filters.productId}
                onChange={(e) => setFilters(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-sm"
              >
                <option value="">Tất cả vật tư</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          )}

          {(activeTab === 'partner_ledger' || activeTab === 'partner_debt_summary' || activeTab === 'receivable_aging' || activeTab === 'payable_aging') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-blue-500" />
                Đối tác
              </label>
              <select 
                value={filters.partnerId}
                onChange={(e) => setFilters(prev => ({ ...prev, partnerId: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-sm"
              >
                <option value="">Tất cả đối tác</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ReportContent />
      </motion.div>

      {/* Modal Xem chi tiết chỉ tiêu */}
      <AnimatePresence>
        {isViewModalOpen && selectedReportItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Chi tiết chỉ tiêu</h2>
                    <p className="text-sm text-slate-500">{selectedReportItem.label} ({selectedReportItem.code})</p>
                  </div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <p className="text-blue-900 font-bold">Tài khoản liên quan:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedReportItem.accounts?.map((acc: string) => (
                      <span key={acc} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold">
                        {acc}
                      </span>
                    )) || <span className="text-slate-400 italic text-sm">Chỉ tiêu tính toán theo công thức</span>}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <th className="px-4 py-3 border-b border-slate-100">Ngày</th>
                        <th className="px-4 py-3 border-b border-slate-100">Số hiệu</th>
                        <th className="px-4 py-3 border-b border-slate-100">Diễn giải</th>
                        <th className="px-4 py-3 border-b border-slate-100 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getFilteredVouchers(selectedReportItem).length > 0 ? (
                        getFilteredVouchers(selectedReportItem).map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-600">{v.date}</td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-900">{v.number}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{v.description}</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-slate-900">
                              {formatCurrency(v.totalAmount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">
                            Không có dữ liệu phát sinh cho chỉ tiêu này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Xem bản in */}
      <AnimatePresence>
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Printer size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Xem bản in báo cáo</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={executePrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Printer size={18} /> Thực hiện in
                  </button>
                  <button onClick={() => setIsPrintPreviewOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 bg-slate-100">
                <div className="bg-white shadow-2xl mx-auto p-12 min-h-[1123px] w-[794px] print-report">
                  <ReportContent printMode={true} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4 no-print">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Ghi chú báo cáo</h4>
          <p className="text-blue-700 text-sm mt-1">
            Báo cáo được tự động tổng hợp từ các chứng từ đã hạch toán. Vui lòng kiểm tra kỹ các bút toán điều chỉnh cuối kỳ trước khi xuất bản chính thức.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
