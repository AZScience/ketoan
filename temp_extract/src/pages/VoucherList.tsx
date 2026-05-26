import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, where, setDoc, getDocs, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, VoucherType, TransactionItem, Department, Project } from '../types/accounting';
import { logAudit } from '../lib/audit';
import { VOUCHER_TEMPLATES, VoucherTemplate } from '../constants/voucherTemplates';
import { VOUCHER_DEFAULTS } from '../constants/voucherDefaults';
import { Plus, Search, Filter, Calendar, FileText, Trash2, Save, X, Eye, Download, Info, MoreVertical, Edit, Copy, Tag, Hash, AlignLeft, List, ArrowRightCircle, ArrowLeftCircle, DollarSign, StickyNote, Settings, Wallet, Receipt, Package, TrendingUp, Landmark, PieChart, Briefcase, Building2, Printer, CheckCircle, XCircle, Clock, Send, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { safeFormat } from '../utils/dateUtils';
import { useSearchParams } from 'react-router-dom';
import { useWorkingContext } from '../context/WorkingContext';
import PayrollForm from '../components/vouchers/PayrollForm';
import BonusForm from '../components/vouchers/BonusForm';
import ReceiptForm from '../components/vouchers/ReceiptForm';
import PaymentForm from '../components/vouchers/PaymentForm';
import AdvanceRequestForm from '../components/vouchers/AdvanceRequestForm';
import AdvanceSettlementForm from '../components/vouchers/AdvanceSettlementForm';
import GoodsReceivedForm from '../components/vouchers/GoodsReceivedForm';
import GoodsDeliveredForm from '../components/vouchers/GoodsDeliveredForm';
import GoodsIssuedForm from '../components/vouchers/GoodsIssuedForm';
import PurchaseListForm from '../components/vouchers/PurchaseListForm';
import AgencySettlementForm from '../components/vouchers/AgencySettlementForm';
import PaymentRequestForm from '../components/vouchers/PaymentRequestForm';
import FixedAssetVoucherForm from '../components/vouchers/FixedAssetVoucherForm';
import InventoryInspectionForm from '../components/vouchers/InventoryInspectionForm';
import InventorySummaryForm from '../components/vouchers/InventorySummaryForm';
import InventoryVoucherForm from '../components/vouchers/InventoryVoucherForm';
import MoneyReceiptForm from '../components/vouchers/MoneyReceiptForm';
import GoldCurrencyListForm from '../components/vouchers/GoldCurrencyListForm';
import FundInventoryForm from '../components/vouchers/FundInventoryForm';
import PaymentListForm from '../components/vouchers/PaymentListForm';
import AssetHandoverForm from '../components/vouchers/AssetHandoverForm';
import AssetLiquidationForm from '../components/vouchers/AssetLiquidationForm';
import AssetRepairForm from '../components/vouchers/AssetRepairForm';
import AssetRevaluationForm from '../components/vouchers/AssetRevaluationForm';
import AssetInventorySummaryForm from '../components/vouchers/AssetInventorySummaryForm';
import AssetDepreciationForm from '../components/vouchers/AssetDepreciationForm';
import OvertimeForm from '../components/vouchers/OvertimeForm';
import OutsourceForm from '../components/vouchers/OutsourceForm';
import ContractForm from '../components/vouchers/ContractForm';
import ContractLiquidationForm from '../components/vouchers/ContractLiquidationForm';
import PayrollDeductionForm from '../components/vouchers/PayrollDeductionForm';
import PayrollAllocationForm from '../components/vouchers/PayrollAllocationForm';
import SalesForm from '../components/vouchers/SalesForm';
import PurchaseForm from '../components/vouchers/PurchaseForm';
import VoucherPreview from '../components/vouchers/VoucherPreview';
import DigitalSignatureModal from '../components/vouchers/DigitalSignatureModal';

import { VoucherItemTable } from '../components/vouchers/VoucherItemTable';

const VoucherList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workingYear, workingMonth, role } = useWorkingContext();
  const [activeTab, setActiveTab] = useState<'list' | 'templates'>(
    (searchParams.get('tab') as 'list' | 'templates') || 'templates'
  );
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAutoSeeded, setHasAutoSeeded] = useState(false);

  const fixOpeningBalances = async () => {
    try {
      const q = query(collection(db, 'opening_balances'), where('year', '==', workingYear));
      const snapshot = await getDocs(q);
      const balances = snapshot.docs.map(doc => doc.data());
      
      const totalDebit = balances.reduce((sum: number, b: any) => sum + (Number(b.debit) || 0), 0);
      const totalCredit = balances.reduce((sum: number, b: any) => sum + (Number(b.credit) || 0), 0);
      const diff = totalDebit - totalCredit;

      if (Math.abs(diff) > 0.01) {
        const equityCode = '411';
        const equityRef = doc(db, 'opening_balances', `${workingYear}_${equityCode}`);
        const equitySnap = await getDoc(equityRef);
        
        let currentDebit = 0;
        let currentCredit = 0;
        
        if (equitySnap.exists()) {
          currentDebit = equitySnap.data().debit || 0;
          currentCredit = equitySnap.data().credit || 0;
        }

        if (diff > 0) {
          // Debit > Credit, add to Credit
          await setDoc(equityRef, {
            accountCode: equityCode,
            debit: currentDebit,
            credit: currentCredit + diff,
            year: workingYear
          });
        } else {
          // Credit > Debit, add to Debit
          await setDoc(equityRef, {
            accountCode: equityCode,
            debit: currentDebit + Math.abs(diff),
            credit: currentCredit,
            year: workingYear
          });
        }
        console.log(`Fixed opening balance discrepancy of ${diff}`);
      }
    } catch (error) {
      console.error("Error fixing opening balances:", error);
    }
  };

  useEffect(() => {
    // Also try to fix balances if they exist but are unbalanced
    if (!loading && role === 'admin') {
      fixOpeningBalances();
    }
  }, [loading, vouchers.length, role, workingYear]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [voucherToSign, setVoucherToSign] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [listSearch, setListSearch] = useState('');
  const [listTypeFilter, setListTypeFilter] = useState<VoucherType | 'All'>('All');
  const [listStatusFilter, setListStatusFilter] = useState<string>('All');

  // Template state
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<VoucherTemplate | null>(null);

  // Form state
  const [type, setType] = useState<VoucherType>('General');
  const [number, setNumber] = useState('');
  
  // Default date to current day in workingMonth/workingYear
  const getDefaultDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (currentMonth === workingMonth && currentYear === workingYear) {
      return now.toISOString().split('T')[0];
    } else {
      // Return 1st day of the working month
      return `${workingYear}-${workingMonth.toString().padStart(2, '0')}-01`;
    }
  };

  const [date, setDate] = useState(getDefaultDate());

  useEffect(() => {
    setDate(getDefaultDate());
  }, [workingYear, workingMonth]);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const validTypes: VoucherType[] = [
        'Receipt', 'Payment', 'AdvanceRequest', 'AdvanceSettlement', 'PaymentRequest', 
        'MoneyReceipt', 'GoldCurrencyList', 'FundInventoryVND', 'FundInventoryForeign', 'PaymentList',
        'Payroll', 'Bonus', 'Overtime', 'Outsource', 'Contract', 'ContractLiquidation', 'PayrollDeduction', 'PayrollAllocation',
        'GoodsReceived', 'GoodsDelivered', 'GoodsIssued', 'InventoryInspection', 'RemainingInventory', 'InventorySummary', 'Purchase', 'PurchaseList', 'MaterialAllocation',
        'Sales', 'AgencySettlement', 'CounterCard', 'AssetHandover', 'AssetLiquidation', 'AssetRepair', 'AssetRevaluation', 'AssetInventory', 'AssetDepreciation', 'General'
      ];
      
      if (validTypes.includes(typeParam as VoucherType)) {
        setType(typeParam as VoucherType);
        setIsModalOpen(true);
        // Clear param after opening
        setSearchParams({ tab: activeTab }, { replace: true });
      }
    }
  }, [searchParams]);

  const [description, setDescription] = useState('');
  const [metadata, setMetadata] = useState<any>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [createdBy, setCreatedBy] = useState('');
  const [createdAt, setCreatedAt] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<any>(null);
  const [items, setItems] = useState<TransactionItem[]>([
    { debitAccount: '', creditAccount: '', amount: 0, note: '' }
  ]);
  const [departmentId, setDepartmentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const seedAllData = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Bạn có chắc chắn muốn thêm dữ liệu mẫu (mỗi loại ~10 dòng) cho TẤT CẢ các chức năng (Tài khoản, Đối tác, Nhân viên, Chứng từ...) không?')) return;
    
    setIsSubmitting(true);
    try {
      // 1. Seed Accounts if empty
      const accountsRef = collection(db, 'accounts');
      const sampleAccounts = [
        { code: '1111', name: 'Tiền mặt tại quỹ', type: 'Asset', level: 1 },
        { code: '1113', name: 'Vàng bạc, kim khí quý', type: 'Asset', level: 1 },
        { code: '1121', name: 'Tiền gửi ngân hàng', type: 'Asset', level: 1 },
        { code: '131', name: 'Phải thu của khách hàng', type: 'Asset', level: 1 },
        { code: '141', name: 'Tạm ứng', type: 'Asset', level: 1 },
        { code: '152', name: 'Nguyên liệu, vật liệu', type: 'Asset', level: 1 },
        { code: '156', name: 'Hàng hóa', type: 'Asset', level: 1 },
        { code: '211', name: 'Tài sản cố định hữu hình', type: 'Asset', level: 1 },
        { code: '331', name: 'Phải trả cho người bán', type: 'Liability', level: 1 },
        { code: '334', name: 'Phải trả người lao động', type: 'Liability', level: 1 },
        { code: '411', name: 'Vốn đầu tư của chủ sở hữu', type: 'Equity', level: 1 },
        { code: '5111', name: 'Doanh thu bán hàng hóa', type: 'Revenue', level: 1 },
        { code: '632', name: 'Giá vốn hàng bán', type: 'Expense', level: 1 },
        { code: '6421', name: 'Chi phí bán hàng', type: 'Expense', level: 1 },
        { code: '6422', name: 'Chi phí quản lý doanh nghiệp', type: 'Expense', level: 1 }
      ];
      for (const acc of sampleAccounts) {
        await addDoc(accountsRef, { ...acc, createdAt: serverTimestamp() });
      }

      // 1b. Seed Opening Balances (Balanced)
      const openingBalancesRef = collection(db, 'opening_balances');
      const sampleOpeningBalances = [
        { accountCode: '1111', debit: 100000000, credit: 0, year: workingYear },
        { accountCode: '1121', debit: 500000000, credit: 0, year: workingYear },
        { accountCode: '156', debit: 200000000, credit: 0, year: workingYear },
        { accountCode: '211', debit: 1000000000, credit: 0, year: workingYear },
        { accountCode: '331', debit: 0, credit: 300000000, year: workingYear },
        { accountCode: '334', debit: 0, credit: 50000000, year: workingYear },
        { accountCode: '411', debit: 0, credit: 1450000000, year: workingYear }
      ];
      for (const ob of sampleOpeningBalances) {
        const obId = `${workingYear}_${ob.accountCode}`;
        await setDoc(doc(db, 'opening_balances', obId), ob);
      }

      // 2. Seed Partners
      const partnersRef = collection(db, 'partners');
      for (let i = 1; i <= 10; i++) {
        await addDoc(partnersRef, {
          code: `DT${i.toString().padStart(3, '0')}`,
          name: i <= 5 ? `Khách hàng ${i}` : `Nhà cung cấp ${i-5}`,
          type: i <= 5 ? 'Customer' : 'Supplier',
          taxId: `01012345${i}`,
          address: `Số ${i} Đường ABC, Hà Nội`,
          createdAt: serverTimestamp()
        });
      }

      // 3. Seed Employees
      const employeesRef = collection(db, 'employees');
      const positions = ['Giám đốc', 'Kế toán trưởng', 'Nhân viên kinh doanh', 'Nhân viên kỹ thuật', 'Thủ kho'];
      for (let i = 1; i <= 10; i++) {
        await addDoc(employeesRef, {
          code: `NV${i.toString().padStart(3, '0')}`,
          name: `Nhân viên ${i}`,
          position: positions[i % positions.length],
          department: i % 2 === 0 ? 'Phòng Kế hoạch' : 'Phòng Hành chính',
          createdAt: serverTimestamp()
        });
      }

      // 3b. Seed Products
      const productsRef = collection(db, 'products');
      const sampleProducts = [
        { code: 'HH001', name: 'Máy tính xách tay Dell Vostro', unit: 'Cái', type: 'Goods', purchasePrice: 12000000, salePrice: 15000000, inventoryAccount: '1561' },
        { code: 'HH002', name: 'Chuột không dây Logitech', unit: 'Cái', type: 'Goods', purchasePrice: 200000, salePrice: 350000, inventoryAccount: '1561' },
        { code: 'HH003', name: 'Bàn phím cơ Dareu', unit: 'Cái', type: 'Goods', purchasePrice: 500000, salePrice: 850000, inventoryAccount: '1561' },
        { code: 'HH004', name: 'Màn hình Samsung 24 inch', unit: 'Cái', type: 'Goods', purchasePrice: 2500000, salePrice: 3200000, inventoryAccount: '1561' },
        { code: 'HH005', name: 'Ổ cứng SSD Kingston 500GB', unit: 'Cái', type: 'Goods', purchasePrice: 800000, salePrice: 1200000, inventoryAccount: '1561' },
        { code: 'NVL001', name: 'Thép tấm 5mm', unit: 'Kg', type: 'Material', purchasePrice: 15000, salePrice: 0, inventoryAccount: '1521' },
        { code: 'NVL002', name: 'Sơn tĩnh điện màu đen', unit: 'Thùng', type: 'Material', purchasePrice: 500000, salePrice: 0, inventoryAccount: '1521' },
        { code: 'DV001', name: 'Dịch vụ bảo trì hệ thống', unit: 'Lần', type: 'Service', purchasePrice: 0, salePrice: 2000000, inventoryAccount: '' },
      ];
      for (const prod of sampleProducts) {
        await addDoc(productsRef, { ...prod, openingQty: 100, openingValue: 100 * prod.purchasePrice, createdAt: serverTimestamp() });
      }

      // 4. Seed Vouchers (10 for each major type)
      const voucherTypes = [
        { type: 'Receipt', prefix: 'PT', desc: 'Thu tiền bán hàng khách hàng', debit: '1111', credit: '131' },
        { type: 'Payment', prefix: 'PC', desc: 'Chi tiền mua vật tư', debit: '152', credit: '1111' },
        { type: 'AdvanceRequest', prefix: 'ĐNTU', desc: 'Đề nghị tạm ứng công tác', debit: '141', credit: '1111' },
        { type: 'GoodsReceived', prefix: 'PNK', desc: 'Nhập kho hàng hóa', debit: '156', credit: '331' },
        { type: 'GoodsIssued', prefix: 'PXK', desc: 'Xuất kho bán hàng', debit: '632', credit: '156' },
        { type: 'Sales', prefix: 'HĐ', desc: 'Bán hàng thành phẩm', debit: '131', credit: '5111' },
        { type: 'Payroll', prefix: 'BL', desc: 'Bảng lương nhân viên tháng', debit: '6421', credit: '334' },
        { type: 'MoneyReceipt', prefix: 'BLT', desc: 'Biên lai thu phí dịch vụ', debit: '1111', credit: '511' },
        { type: 'GoldCurrencyList', prefix: 'BK', desc: 'Bảng kê nhập kho kim khí', debit: '1111', credit: '1113' },
        { type: 'AssetHandover', prefix: 'GN', desc: 'Giao nhận tài sản cố định', debit: '211', credit: '331' },
        { type: 'InventoryInspection', prefix: 'KN', desc: 'Kiểm nghiệm vật tư nhập kho', debit: '152', credit: '331' }
      ];

      const batchSize = 10;
      let voucherCount = 0;

      for (const vt of voucherTypes) {
        for (let i = 1; i <= batchSize; i++) {
          const amount = Math.floor(Math.random() * 10000000) + 500000;
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));
          
          const v: any = {
            type: vt.type,
            number: `${vt.prefix}${i.toString().padStart(3, '0')}`,
            date: date.toISOString().split('T')[0],
            description: `${vt.desc} ${i}`,
            items: [{ 
              debitAccount: vt.debit, 
              creditAccount: vt.credit, 
              amount: amount, 
              note: `Nghiệp vụ mẫu số ${i}`,
              itemCode: vt.type.includes('Goods') || vt.type === 'Sales' ? `ITEM${i}` : undefined,
              itemName: vt.type.includes('Goods') || vt.type === 'Sales' ? `Sản phẩm mẫu ${i}` : undefined,
              unit: vt.type.includes('Goods') || vt.type === 'Sales' ? 'Cái' : undefined,
              quantityActual: vt.type.includes('Goods') || vt.type === 'Sales' ? i : undefined,
              price: vt.type.includes('Goods') || vt.type === 'Sales' ? amount / i : undefined,
            }],
            metadata: {
              amountInWords: 'Dữ liệu mẫu hệ thống',
              payerName: vt.type === 'Receipt' || vt.type === 'MoneyReceipt' ? `Khách hàng ${i}` : undefined,
              receiverName: vt.type === 'Payment' || vt.type === 'GoodsIssued' ? `Người nhận ${i}` : undefined,
              requesterName: vt.type === 'AdvanceRequest' ? `Nhân viên ${i}` : undefined,
              warehouse: vt.type.includes('Goods') ? 'Kho tổng' : undefined,
              month: vt.type === 'Payroll' ? '03' : undefined,
              year: vt.type === 'Payroll' ? '2026' : undefined,
            }
          };

          const totalAmount = v.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
          
          await addDoc(collection(db, 'vouchers'), {
            ...v,
            totalAmount,
            status: 'PendingApproval',
            createdBy: auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          voucherCount++;
        }
      }
      
      if (!isAuto) {
        alert(`Đã thêm thành công dữ liệu mẫu: 14 tài khoản, 10 đối tác, 10 nhân viên và ${voucherCount} chứng từ!`);
      }
    } catch (error) {
      console.error("Lỗi khi thêm dữ liệu mẫu:", error);
      if (!isAuto) {
        alert("Có lỗi xảy ra khi thêm dữ liệu mẫu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const typeParam = searchParams.get('type');
    const tabParam = searchParams.get('tab');
    
    if (tabParam === 'templates') {
      setActiveTab('templates');
    }

    if (typeParam) {
      const typeMap: Record<string, VoucherType> = {
        '01 - TT': 'Receipt',
        '02 - TT': 'Payment',
        '03 - TT': 'AdvanceRequest',
        '04 - TT': 'AdvanceSettlement',
        '05 - TT': 'PaymentRequest',
        '06 - TT': 'MoneyReceipt',
        '07 - TT': 'GoldCurrencyList',
        '08a - TT': 'FundInventoryVND',
        '08b - TT': 'FundInventoryForeign',
        '09 - TT': 'PaymentList',
        '01 - LĐTL': 'Payroll',
        '02 - LĐTL': 'Bonus',
        '03 - LĐTL': 'Overtime',
        '04 - LĐTL': 'Outsource',
        '05 - LĐTL': 'Contract',
        '06 - LĐTL': 'ContractLiquidation',
        '07 - LĐTL': 'PayrollDeduction',
        '08 - LĐTL': 'PayrollAllocation',
        '01 - VT': 'GoodsReceived',
        '02 - VT': 'GoodsDelivered',
        '02a - VT': 'GoodsIssued',
        '03 - VT': 'InventoryInspection',
        '04 - VT': 'RemainingInventory',
        '05 - VT': 'InventorySummary',
        '06 - VT': 'PurchaseList',
        '06a - VT': 'Purchase',
        '07 - VT': 'MaterialAllocation',
        '01 - BH': 'Sales',
        '02 - BH': 'CounterCard',
        '01 - TSCĐ': 'AssetHandover',
        '02 - TSCĐ': 'AssetLiquidation',
        '03 - TSCĐ': 'AssetRepair',
        '04 - TSCĐ': 'AssetRevaluation',
        '05 - TSCĐ': 'AssetInventory',
        '06 - TSCĐ': 'AssetDepreciation',
      };
      
      if (typeMap[typeParam]) {
        setType(typeMap[typeParam]);
        setIsModalOpen(true);
        setActiveTab('list');
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'list' | 'templates') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCreateFromTemplate = (template: VoucherTemplate) => {
    resetForm();
    const typeMap: Record<string, VoucherType> = {
      '01 - TT': 'Receipt',
      '02 - TT': 'Payment',
      '03 - TT': 'AdvanceRequest',
      '04 - TT': 'AdvanceSettlement',
      '05 - TT': 'PaymentRequest',
      '06 - TT': 'MoneyReceipt',
      '07 - TT': 'GoldCurrencyList',
      '08a - TT': 'FundInventoryVND',
      '08b - TT': 'FundInventoryForeign',
      '09 - TT': 'PaymentList',
      '01 - LĐTL': 'Payroll',
      '02 - LĐTL': 'Bonus',
      '03 - LĐTL': 'Overtime',
      '04 - LĐTL': 'Outsource',
      '05 - LĐTL': 'Contract',
      '06 - LĐTL': 'ContractLiquidation',
      '07 - LĐTL': 'PayrollDeduction',
      '08 - LĐTL': 'PayrollAllocation',
      '01 - VT': 'GoodsReceived',
      '02 - VT': 'GoodsDelivered',
      '02a - VT': 'GoodsIssued',
      '03 - VT': 'InventoryInspection',
      '04 - VT': 'RemainingInventory',
      '05 - VT': 'InventorySummary',
      '06 - VT': 'PurchaseList',
      '06a - VT': 'Purchase',
      '07 - VT': 'MaterialAllocation',
      '01 - BH': 'Sales',
      '02 - BH': 'CounterCard',
      '01 - TSCĐ': 'AssetHandover',
      '02 - TSCĐ': 'AssetLiquidation',
      '03 - TSCĐ': 'AssetRepair',
      '04 - TSCĐ': 'AssetRevaluation',
      '05 - TSCĐ': 'AssetInventory',
      '06 - TSCĐ': 'AssetDepreciation',
    };
    
    if (typeMap[template.id]) {
      setType(typeMap[template.id]);
    }
    setSelectedTemplate(null);
    setIsModalOpen(true);
    setActiveTab('list');
  };

  const categories = ['All', 'Payroll', 'Inventory', 'Sales', 'Cash', 'FixedAssets'];

  const filteredTemplates = VOUCHER_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
                          template.id.toLowerCase().includes(templateSearch.toLowerCase()) ||
                          template.code.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const monthStr = workingMonth.toString().padStart(2, '0');
    const startOfPeriod = `${workingYear}-${monthStr}-01`;
    const lastDay = new Date(workingYear, workingMonth, 0).getDate();
    const endOfPeriod = `${workingYear}-${monthStr}-${lastDay}`;

    const q = query(
      collection(db, 'vouchers'), 
      where('date', '>=', startOfPeriod),
      where('date', '<=', endOfPeriod),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVouchers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
      setLoading(false);
    });

    const unsubscribeDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'departments');
    });

    const unsubscribeProjs = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    const unsubscribeBusiness = onSnapshot(doc(db, 'settings', 'business_info'), (snapshot) => {
      if (snapshot.exists()) {
        setCompanySettings(snapshot.data());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeDepts();
      unsubscribeProjs();
      unsubscribeBusiness();
    };
  }, [workingYear, workingMonth]);

  const filteredVouchers = vouchers.filter(v => {
    const searchLower = listSearch.toLowerCase();
    
    // Check basic fields
    const matchesBasic = v.number.toLowerCase().includes(searchLower) || 
                         v.description.toLowerCase().includes(searchLower);
    
    // Check date
    const matchesDate = v.date.includes(listSearch) || 
                        new Date(v.date).toLocaleDateString('vi-VN').includes(listSearch);
    
    // Check amount
    const matchesAmount = v.totalAmount.toString().includes(listSearch) ||
                          v.totalAmount.toLocaleString('vi-VN').includes(listSearch);
    
    // Check accounts in items
    const matchesAccounts = v.items.some(item => 
      item.debitAccount.toLowerCase().includes(searchLower) || 
      item.creditAccount.toLowerCase().includes(searchLower)
    );

    const matchesSearch = matchesBasic || matchesDate || matchesAmount || matchesAccounts;
    const matchesType = listTypeFilter === 'All' || v.type === listTypeFilter;
    const matchesStatus = listStatusFilter === 'All' || v.status === listStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const isInventoryType = ['GoodsReceived', 'GoodsDelivered', 'GoodsIssued', 'InventoryInspection', 'RemainingInventory', 'InventorySummary', 'Purchase', 'PurchaseList', 'MaterialAllocation', 'GoldCurrencyList', 'Sales'].includes(type);

  useEffect(() => {
    if (type === 'GoldCurrencyList' && (metadata.debitAccount || metadata.creditAccount)) {
      const updatedItems = items.map(item => ({
        ...item,
        debitAccount: metadata.debitAccount || item.debitAccount,
        creditAccount: metadata.creditAccount || item.creditAccount
      }));
      
      // Only update if there's a difference to avoid infinite loop
      const hasChanged = updatedItems.some((item, index) => 
        item.debitAccount !== items[index].debitAccount || 
        item.creditAccount !== items[index].creditAccount
      );
      
      if (hasChanged) {
        setItems(updatedItems);
      }
    }
  }, [metadata.debitAccount, metadata.creditAccount, type]);

  useEffect(() => {
    if (!editingVoucherId && !isViewOnly && items.length === 1) {
      const firstItem = items[0];
      if (!firstItem.debitAccount && !firstItem.creditAccount && !firstItem.amount) {
        const defaults = VOUCHER_DEFAULTS[type];
        if (defaults) {
          setItems([{
            ...firstItem,
            debitAccount: defaults.debitAccount,
            creditAccount: defaults.creditAccount
          }]);
          
          if (!description) {
            setDescription(defaults.description || '');
          }
        }
      }
    }
  }, [type, editingVoucherId, isViewOnly, description]);

  const handleAddItem = () => {
    const defaults = VOUCHER_DEFAULTS[type];
    const newItem: TransactionItem = { 
      debitAccount: type === 'GoldCurrencyList' ? (metadata.debitAccount || '') : (defaults?.debitAccount || ''), 
      creditAccount: type === 'GoldCurrencyList' ? (metadata.creditAccount || '') : (defaults?.creditAccount || ''), 
      amount: 0, 
      note: '', 
      itemCode: '', 
      itemName: '', 
      unit: '', 
      quantityPlanned: 0, 
      quantityActual: 0, 
      price: 0 
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount if quantity or price changes for inventory types
    if (isInventoryType && (field === 'quantityActual' || field === 'quantityPlanned' || field === 'price')) {
      const qty = Number(currentItem.quantityActual) || Number(currentItem.quantityPlanned) || 0;
      const prc = Number(currentItem.price) || 0;
      currentItem.amount = qty * prc;
    }
    
    newItems[index] = currentItem;
    setItems(newItems);
  };

  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'periods'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPeriods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'periods');
    });
    return unsubscribe;
  }, []);

  const isPeriodClosed = (voucherDate: string) => {
    const d = new Date(voucherDate);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const period = periods.find(p => p.month === month && p.year === year);
    return period?.status === 'Closed';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly || isSubmitting) return;

    if (isPeriodClosed(date)) {
      setMessage({
        type: 'error',
        text: `Kỳ kế toán tháng ${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()} đã khóa sổ. Bạn không thể thêm hoặc sửa chứng từ.`
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);

    const subTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalVat = items.reduce((sum, item) => sum + (Number(item.vatAmount) || 0), 0);
    const totalAmount = subTotal + totalVat;
    
    try {
      const data = {
        type,
        number,
        date,
        description,
        totalAmount,
        items,
        metadata,
        departmentId,
        projectId,
        updatedAt: serverTimestamp(),
        status: editingVoucherId ? vouchers.find(v => v.id === editingVoucherId)?.status : 'PendingApproval'
      };

      if (editingVoucherId) {
        await updateDoc(doc(db, 'vouchers', editingVoucherId), data);
        await logAudit('Vouchers', 'Update', `Updated voucher ${number} (${type}) - ${description}`);
      } else {
        await addDoc(collection(db, 'vouchers'), {
          ...data,
          createdBy: auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
        await logAudit('Vouchers', 'Create', `Created voucher ${number} (${type}) - ${description}`);
      }
      
      setMessage({ type: 'success', text: 'Đã lưu chứng từ thành công!' });
      setTimeout(() => {
        setIsModalOpen(false);
        resetForm();
      }, 1000);
    } catch (error: any) {
      console.error("Lỗi khi lưu chứng từ:", error);
      setMessage({ type: 'error', text: error.message || "Có lỗi xảy ra khi lưu chứng từ." });
      try {
        handleFirestoreError(error, editingVoucherId ? OperationType.UPDATE : OperationType.CREATE, 'vouchers');
      } catch (e) {}
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const voucher = vouchers.find(v => v.id === id);
    if (!voucher) return;

    if (isPeriodClosed(voucher.date)) {
      alert(`Kỳ kế toán tháng ${new Date(voucher.date).getMonth() + 1}/${new Date(voucher.date).getFullYear()} đã khóa sổ. Bạn không thể xóa chứng từ.`);
      return;
    }

    if ((voucher.status === 'Approved' || voucher.status === 'Posted') && role !== 'admin') {
      alert(`Chứng từ đã ${voucher.status === 'Approved' ? 'phê duyệt' : 'đăng sổ'}. Bạn không thể xóa.`);
      return;
    }

    setVoucherToDelete(voucher);
    setIsConfirmOpen(true);
    setOpenMenuId(null);
  };

  const executeDelete = async () => {
    if (!voucherToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'vouchers', voucherToDelete.id));
      await logAudit('Vouchers', 'Delete', `Deleted voucher ${voucherToDelete.number} (${voucherToDelete.type}) - ${voucherToDelete.description}`);
      setIsConfirmOpen(false);
      setVoucherToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa chứng từ:", error);
      alert("Có lỗi xảy ra khi xóa chứng từ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (voucher: Voucher) => {
    if ((voucher.status === 'Approved' || voucher.status === 'Posted') && role !== 'admin') {
      alert(`Chứng từ đã ${voucher.status === 'Approved' ? 'phê duyệt' : 'đăng sổ'}. Bạn không thể sửa.`);
      return;
    }
    setEditingVoucherId(voucher.id);
    setType(voucher.type);
    setNumber(voucher.number);
    setDate(voucher.date);
    setDescription(voucher.description);
    setItems(voucher.items);
    setMetadata(voucher.metadata || {});
    setDepartmentId(voucher.departmentId || '');
    setProjectId(voucher.projectId || '');
    setCreatedBy(voucher.createdBy || '');
    setCreatedAt(voucher.createdAt);
    setUpdatedAt(voucher.updatedAt);
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const handleView = (voucher: Voucher) => {
    setEditingVoucherId(voucher.id);
    setType(voucher.type);
    setNumber(voucher.number);
    setDate(voucher.date);
    setDescription(voucher.description);
    setItems(voucher.items);
    setMetadata(voucher.metadata || {});
    setDepartmentId(voucher.departmentId || '');
    setProjectId(voucher.projectId || '');
    setCreatedBy(voucher.createdBy || '');
    setCreatedAt(voucher.createdAt);
    setUpdatedAt(voucher.updatedAt);
    setIsViewOnly(true);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const handleApproveClick = (voucher: Voucher) => {
    setVoucherToSign(voucher);
    setIsSignatureModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSignatureComplete = async (signature: any) => {
    if (!voucherToSign) return;
    
    try {
      const updateData: any = { 
        status: 'Approved',
        digitalSignature: signature,
        approvedBy: `${signature.signerName} (${signature.signerEmail})`,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'vouchers', voucherToSign.id), updateData);
      await logAudit('Vouchers', 'Approve', `Approved voucher ${voucherToSign.number} with digital signature`);
      
      setIsSignatureModalOpen(false);
      setVoucherToSign(null);
    } catch (error) {
      console.error("Lỗi khi phê duyệt với chữ ký số:", error);
      alert("Có lỗi xảy ra khi phê duyệt chứng từ.");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Voucher['status']) => {
    const voucher = vouchers.find(v => v.id === id);
    try {
      const updateData: any = { 
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      if (newStatus === 'Approved') {
        updateData.approvedBy = auth.currentUser?.uid;
        updateData.approvedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'vouchers', id), updateData);
      if (voucher) {
        await logAudit('Vouchers', 'StatusUpdate', `Updated status of voucher ${voucher.number} to ${newStatus}`);
      }
      setOpenMenuId(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleCopy = (voucher: Voucher) => {
    setEditingVoucherId(null);
    setType(voucher.type);
    setNumber(`${voucher.number}-COPY`);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription(voucher.description);
    setItems(voucher.items);
    setMetadata(voucher.metadata || {});
    setDepartmentId(voucher.departmentId || '');
    setProjectId(voucher.projectId || '');
    setIsViewOnly(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
    setMessage(null);
  };

  const resetForm = () => {
    setEditingVoucherId(null);
    setIsViewOnly(false);
    setIsSubmitting(false);
    setMessage(null);
    setType('General');
    setNumber('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setMetadata({});
    setDepartmentId('');
    setProjectId('');
    setShowPrintPreview(false);
    setItems([{ debitAccount: '', creditAccount: '', amount: 0, note: '' }]);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chứng từ kế toán</h1>
          <p className="text-slate-500">Quản lý các nghiệp vụ kinh tế phát sinh và biểu mẫu chuẩn.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => handleTabChange('templates')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Biểu mẫu chuẩn
            </button>
            <button 
              onClick={() => handleTabChange('list')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Danh sách chứng từ
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between mb-6">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo số hiệu, diễn giải, ngày, số tiền, tài khoản..."
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                />
              </div>
              <div className="w-48">
                <select
                  value={listTypeFilter}
                  onChange={(e) => setListTypeFilter(e.target.value as VoucherType | 'All')}
                  className="w-full p-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                >
                  <option value="All">Tất cả loại</option>
                  <optgroup label="Tiền tệ">
                    <option value="Receipt">Phiếu thu</option>
                    <option value="Payment">Phiếu chi</option>
                    <option value="AdvanceRequest">Đề nghị tạm ứng</option>
                    <option value="AdvanceSettlement">Thanh toán tạm ứng</option>
                    <option value="PaymentRequest">Đề nghị thanh toán</option>
                    <option value="MoneyReceipt">Biên lai thu tiền</option>
                  </optgroup>
                  <optgroup label="Lao động tiền lương">
                    <option value="Payroll">Bảng lương</option>
                    <option value="Bonus">Bảng thưởng</option>
                    <option value="Overtime">Làm thêm giờ</option>
                  </optgroup>
                  <optgroup label="Hàng tồn kho">
                    <option value="GoodsReceived">Phiếu nhập kho</option>
                    <option value="GoodsDelivered">Phiếu xuất kho (Bán hàng)</option>
                    <option value="GoodsIssued">Phiếu xuất kho (Vật tư, hàng hóa)</option>
                    <option value="InventoryInspection">Kiểm kê vật tư</option>
                    <option value="Purchase">Chứng từ mua hàng</option>
                  </optgroup>
                  <optgroup label="Bán hàng">
                    <option value="Sales">Hóa đơn bán hàng</option>
                  </optgroup>
                  <optgroup label="Tài sản cố định">
                    <option value="AssetHandover">Giao nhận TSCĐ</option>
                    <option value="AssetDepreciation">Khấu hao TSCĐ</option>
                  </optgroup>
                  <option value="General">Nghiệp vụ khác</option>
                </select>
              </div>
              <div className="w-48">
                <select
                  value={listStatusFilter}
                  onChange={(e) => setListStatusFilter(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="Draft">Bản nháp</option>
                  <option value="PendingApproval">Chờ duyệt</option>
                  <option value="Approved">Đã duyệt</option>
                  <option value="Rejected">Từ chối</option>
                  <option value="Posted">Đã đăng sổ</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 whitespace-nowrap"
            >
              <Plus size={20} className="text-white" />
              Lập chứng từ mới
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#1877F2] text-white">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-200" /> Ngày</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                      <div className="flex items-center gap-2"><Hash size={14} className="text-emerald-200" /> Số hiệu</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                      <div className="flex items-center gap-2"><Info size={14} className="text-amber-200" /> Loại</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                      <div className="flex items-center gap-2"><FileText size={14} className="text-purple-200" /> Diễn giải</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right border border-white/20">
                      <div className="flex items-center justify-end gap-2"><DollarSign size={14} className="text-rose-200" /> Số tiền</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border border-white/20">
                      <div className="flex items-center gap-2"><Clock size={14} className="text-blue-100" /> Trạng thái</div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center border border-white/20">
                      <div className="flex items-center justify-center gap-2"><Settings size={14} className="text-slate-200" /> Thao tác</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVouchers.map((v, i) => (
                    <motion.tr 
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-600 text-sm border border-slate-100">{safeFormat(v.date, 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 border border-slate-100">{v.number}</td>
                      <td className="px-6 py-4 border border-slate-100">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                          ['Receipt', 'Payment', 'AdvanceRequest', 'AdvanceSettlement', 'PaymentRequest', 'MoneyReceipt', 'GoldCurrencyList', 'FundInventoryVND', 'FundInventoryForeign', 'PaymentList', 'ForeignCurrencyInventory'].includes(v.type) ? 'bg-emerald-100 text-emerald-700' :
                          ['Payroll', 'Bonus', 'Overtime', 'Outsource', 'Contract', 'ContractLiquidation', 'PayrollDeduction', 'PayrollAllocation'].includes(v.type) ? 'bg-purple-100 text-purple-700' :
                          ['GoodsReceived', 'GoodsDelivered', 'GoodsIssued', 'InventoryInspection', 'RemainingInventory', 'InventorySummary', 'Purchase', 'PurchaseList', 'MaterialAllocation', 'MaterialInspection', 'MaterialReturn', 'InventoryInventory'].includes(v.type) ? 'bg-amber-100 text-amber-700' :
                          ['Sales', 'AgencySettlement', 'CounterCard'].includes(v.type) ? 'bg-blue-100 text-blue-700' :
                          ['AssetHandover', 'AssetLiquidation', 'AssetRepair', 'AssetRevaluation', 'AssetInventory', 'AssetDepreciation', 'AssetAllocation'].includes(v.type) ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {v.type === 'Receipt' ? 'Phiếu thu' :
                           v.type === 'Payment' ? 'Phiếu chi' :
                           v.type === 'AdvanceRequest' ? 'Đề nghị tạm ứng' :
                           v.type === 'AdvanceSettlement' ? 'Thanh toán tạm ứng' :
                           v.type === 'PaymentRequest' ? 'Đề nghị thanh toán' :
                           v.type === 'MoneyReceipt' ? 'Biên lai thu tiền' :
                           v.type === 'GoldCurrencyList' ? 'Bảng kê vàng' :
                           v.type === 'FundInventoryVND' ? 'Kiểm kê quỹ VND' :
                           v.type === 'FundInventoryForeign' ? 'Kiểm kê quỹ ngoại tệ' :
                           v.type === 'PaymentList' ? 'Bảng kê chi tiền' :
                           v.type === 'ForeignCurrencyInventory' ? 'Kiểm kê ngoại tệ' :
                           v.type === 'Payroll' ? 'Bảng lương' :
                           v.type === 'Bonus' ? 'Bảng thưởng' :
                           v.type === 'Overtime' ? 'Bảng làm thêm giờ' :
                           v.type === 'Outsource' ? 'Thuê ngoài' :
                           v.type === 'Contract' ? 'Hợp đồng khoán' :
                           v.type === 'ContractLiquidation' ? 'Thanh lý khoán' :
                           v.type === 'PayrollDeduction' ? 'Trích nộp lương' :
                           v.type === 'PayrollAllocation' ? 'Phân bổ lương' :
                           v.type === 'GoodsReceived' ? 'Phiếu nhập kho' :
                           v.type === 'GoodsDelivered' ? 'Phiếu xuất kho (Bán hàng)' :
                           v.type === 'GoodsIssued' ? 'Phiếu xuất kho (Vật tư, hàng hóa)' :
                           v.type === 'InventoryInspection' ? 'Kiểm nghiệm vật tư' :
                           v.type === 'RemainingInventory' ? 'Vật tư còn lại' :
                           v.type === 'InventorySummary' ? 'Kiểm kê vật tư' :
                           v.type === 'Purchase' ? 'Chứng từ mua hàng' :
                           v.type === 'PurchaseList' ? 'Bảng kê mua hàng' :
                           v.type === 'MaterialAllocation' ? 'Phân bổ vật tư' :
                           v.type === 'MaterialInspection' ? 'Kiểm nghiệm vật tư' :
                           v.type === 'MaterialReturn' ? 'Trả lại vật tư' :
                           v.type === 'InventoryInventory' ? 'Kiểm kê kho' :
                           v.type === 'Sales' ? 'Hóa đơn bán hàng' :
                           v.type === 'AgencySettlement' ? 'Thanh toán đại lý' :
                           v.type === 'CounterCard' ? 'Thẻ quầy hàng' :
                           v.type === 'AssetHandover' ? 'Giao nhận TSCĐ' :
                           v.type === 'AssetLiquidation' ? 'Thanh lý TSCĐ' :
                           v.type === 'AssetRepair' ? 'Sửa chữa TSCĐ' :
                           v.type === 'AssetRevaluation' ? 'Đánh giá lại TSCĐ' :
                           v.type === 'AssetInventory' ? 'Kiểm kê TSCĐ' :
                           v.type === 'AssetDepreciation' ? 'Khấu hao TSCĐ' :
                           v.type === 'AssetAllocation' ? 'Phân bổ TSCĐ' :
                           'Nghiệp vụ khác'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate border border-slate-100">{v.description}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 border border-slate-100">{formatCurrency(v.totalAmount)}</td>
                      <td className="px-6 py-4 border border-slate-100">
                        <div className="flex items-center gap-2">
                          {v.status === 'PendingApproval' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                              <Clock size={10} /> Chờ duyệt
                            </span>
                          )}
                          {v.status === 'Approved' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                              <CheckCircle size={10} /> Đã duyệt
                            </span>
                          )}
                          {v.status === 'Rejected' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              <XCircle size={10} /> Từ chối
                            </span>
                          )}
                          {v.status === 'Posted' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              <Send size={10} /> Đã đăng sổ
                            </span>
                          )}
                          {!v.status && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                              <Clock size={10} /> Chờ duyệt
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-100 relative">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => {
                              handleView(v);
                              setShowPrintPreview(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="In chứng từ"
                          >
                            <Printer size={18} />
                          </button>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {openMenuId === v.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-full mr-2 top-0 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                              >
                                <button 
                                  onClick={() => handleView(v)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                                >
                                  <Eye size={16} className="text-blue-500" />
                                  <span>Xem</span>
                                </button>
                                {(v.status === 'PendingApproval' || !v.status) && (role === 'admin' || role === 'accountant') && (
                                  <>
                                    <button 
                                      onClick={() => handleApproveClick(v)}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                    >
                                      <CheckCircle size={16} className="text-emerald-500" />
                                      <span>Phê duyệt</span>
                                    </button>
                                    <button 
                                      onClick={() => handleStatusUpdate(v.id, 'Rejected')}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                                    >
                                      <XCircle size={16} className="text-red-500" />
                                      <span>Từ chối</span>
                                    </button>
                                  </>
                                )}
                                {v.status === 'Approved' && (role === 'admin' || role === 'accountant') && (
                                  <button 
                                    onClick={() => handleStatusUpdate(v.id, 'Posted')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                  >
                                    <Send size={16} className="text-blue-500" />
                                    <span>Đăng sổ</span>
                                  </button>
                                )}
                                {(v.status === 'PendingApproval' || v.status === 'Rejected' || !v.status || role === 'admin') && (
                                  <button 
                                    onClick={() => handleEdit(v)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-all"
                                  >
                                    <Edit size={16} className="text-amber-500" />
                                    <span>Sửa</span>
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    handleView(v);
                                    setShowPrintPreview(true);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                                >
                                  <Printer size={16} className="text-indigo-500" />
                                  <span>In</span>
                                </button>
                                <button 
                                  onClick={() => handleCopy(v)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                                >
                                  <Copy size={16} className="text-emerald-500" />
                                  <span>Chép</span>
                                </button>
                                <button 
                                  onClick={() => handleDelete(v.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border-t border-slate-50"
                                >
                                  <Trash2 size={16} className="text-red-500" />
                                  <span>Xóa</span>
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm biểu mẫu..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'All' && <Filter size={14} className={selectedCategory === 'All' ? 'text-white' : 'text-blue-500'} />}
                      {cat === 'Payroll' && <Briefcase size={14} className={selectedCategory === 'Payroll' ? 'text-white' : 'text-purple-500'} />}
                      {cat === 'Inventory' && <Package size={14} className={selectedCategory === 'Inventory' ? 'text-white' : 'text-amber-500'} />}
                      {cat === 'Sales' && <TrendingUp size={14} className={selectedCategory === 'Sales' ? 'text-white' : 'text-emerald-500'} />}
                      {cat === 'Cash' && <Wallet size={14} className={selectedCategory === 'Cash' ? 'text-white' : 'text-blue-500'} />}
                      {cat === 'Assets' && <Landmark size={14} className={selectedCategory === 'Assets' ? 'text-white' : 'text-red-500'} />}
                      
                      {cat === 'All' ? 'Tất cả' : 
                       cat === 'Payroll' ? 'Tiền lương' :
                       cat === 'Inventory' ? 'Hàng tồn kho' :
                       cat === 'Sales' ? 'Bán hàng' :
                       cat === 'Cash' ? 'Tiền tệ' : 'Tài sản'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Info size={18} />
                <span className="font-bold text-sm">Hướng dẫn</span>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                Các biểu mẫu này được thiết kế chuẩn theo quy định của Bộ Tài chính (Thông tư 99/2018/TT-BTC).
              </p>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  layout
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase">
                      {template.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{template.code}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCreateFromTemplate(template); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Lập chứng từ"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedTemplate.name}</h2>
                      <p className="text-blue-600 font-bold text-sm">{selectedTemplate.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả & Mục đích</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ký hiệu</h4>
                      <p className="text-slate-900 font-bold">{selectedTemplate.code}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Căn cứ pháp lý</h4>
                      <p className="text-slate-900 font-bold text-xs">{selectedTemplate.circular}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mẫu chứng từ chi tiết</h4>
                    <pre className="text-slate-700 text-[10px] leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedTemplate.fullTemplate}
                    </pre>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      onClick={() => handleCreateFromTemplate(selectedTemplate)}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Lập chứng từ mới
                    </button>
                    <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                      <Download size={20} />
                      Tải biểu mẫu (.xlsx)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Lập chứng từ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:block print:static print-visible">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:block print-visible"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isViewOnly ? 'Chi tiết chứng từ' : editingVoucherId ? 'Cập nhật chứng từ' : 'Lập chứng từ mới'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrintPreview(!showPrintPreview)}
                    className={`p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${
                      showPrintPreview 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Eye size={18} />
                    {showPrintPreview ? 'Quay lại nhập liệu' : 'Xem bản in'}
                  </button>
                  {showPrintPreview && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <Printer size={18} />
                      In chứng từ
                    </button>
                  )}
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>
              </div>

              {showPrintPreview ? (
                <div className="flex-1 overflow-y-auto p-8 bg-slate-100 print:bg-white print:p-0 print:overflow-visible print:block print-visible">
                  <VoucherPreview 
                    voucher={{ type, number, date, description, items, metadata }}
                    companySettings={companySettings || { 
                      name: 'Công ty TNHH Giải pháp Kế toán', 
                      address: 'Hà Nội' 
                    }}
                  />
                </div>
              ) : (
                <form id="voucher-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
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
                        <Building2 size={16} className="text-indigo-500" />
                        Bộ phận
                      </label>
                      <select 
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">-- Chọn bộ phận --</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.code} - {dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Briefcase size={16} className="text-emerald-500" />
                        Dự án
                      </label>
                      <select 
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        disabled={isViewOnly}
                        className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">-- Chọn dự án --</option>
                        {projects.map(proj => (
                          <option key={proj.id} value={proj.id}>{proj.code} - {proj.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" />
                      Loại chứng từ
                    </label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as VoucherType)}
                      disabled={isViewOnly}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    >
                      <optgroup label="Tiền tệ">
                        <option value="Receipt">Phiếu thu (01-TT)</option>
                        <option value="Payment">Phiếu chi (02-TT)</option>
                        <option value="AdvanceRequest">Giấy đề nghị tạm ứng (03-TT)</option>
                        <option value="AdvanceSettlement">Giấy thanh toán tiền tạm ứng (04-TT)</option>
                        <option value="PaymentRequest">Giấy đề nghị thanh toán (05-TT)</option>
                        <option value="MoneyReceipt">Biên lai thu tiền (06-TT)</option>
                        <option value="GoldCurrencyList">Bảng kê vàng tiền tệ (07-TT)</option>
                        <option value="FundInventoryVND">Bảng kiểm kê quỹ VND (08a-TT)</option>
                        <option value="FundInventoryForeign">Bảng kiểm kê quỹ ngoại tệ (08b-TT)</option>
                        <option value="PaymentList">Bảng kê chi tiền (09-TT)</option>
                      </optgroup>
                      <optgroup label="Lao động tiền lương">
                        <option value="Payroll">Bảng thanh toán tiền lương (01-LĐTL)</option>
                        <option value="Bonus">Bảng thanh toán tiền thưởng (02-LĐTL)</option>
                        <option value="Overtime">Bảng thanh toán tiền làm thêm giờ (03-LĐTL)</option>
                        <option value="Outsource">Bảng thanh toán tiền thuê ngoài (04-LĐTL)</option>
                        <option value="Contract">Hợp đồng giao khoán (05-LĐTL)</option>
                        <option value="ContractLiquidation">Biên bản thanh lý hợp đồng giao khoán (06-LĐTL)</option>
                        <option value="PayrollDeduction">Bảng kê trích nộp theo lương (07-LĐTL)</option>
                        <option value="PayrollAllocation">Bảng phân bổ tiền lương (08-LĐTL)</option>
                      </optgroup>
                      <optgroup label="Hàng tồn kho">
                        <option value="GoodsReceived">Phiếu nhập kho (01-VT)</option>
                        <option value="GoodsDelivered">Phiếu xuất kho bán hàng (02-VT)</option>
                        <option value="GoodsIssued">Phiếu xuất kho vật tư, hàng hóa (02a-VT)</option>
                        <option value="InventoryInspection">Biên bản kiểm nghiệm vật tư (03-VT)</option>
                        <option value="RemainingInventory">Bảng kê vật tư còn lại (04-VT)</option>
                        <option value="InventorySummary">Biên bản tổng hợp kiểm kê vật tư (05-VT)</option>
                        <option value="Purchase">Chứng từ mua hàng (06a-VT)</option>
                        <option value="PurchaseList">Bảng kê mua hàng (06-VT)</option>
                        <option value="MaterialAllocation">Bảng phân bổ nguyên vật liệu (07-VT)</option>
                      </optgroup>
                      <optgroup label="Bán hàng">
                        <option value="Sales">Hóa đơn bán hàng (01-BH)</option>
                        <option value="AgencySettlement">Bảng thanh toán hàng đại lý (01-BH)</option>
                        <option value="CounterCard">Thẻ quầy hàng (02-BH)</option>
                      </optgroup>
                      <optgroup label="Tài sản cố định">
                        <option value="AssetHandover">Biên bản giao nhận TSCĐ (01-TSCĐ)</option>
                        <option value="AssetLiquidation">Biên bản thanh lý TSCĐ (02-TSCĐ)</option>
                        <option value="AssetRepair">Biên bản bàn giao TSCĐ sửa chữa (03-TSCĐ)</option>
                        <option value="AssetRevaluation">Biên bản đánh giá lại TSCĐ (04-TSCĐ)</option>
                        <option value="AssetInventory">Biên bản tổng hợp kiểm kê TSCĐ (05-TSCĐ)</option>
                        <option value="AssetDepreciation">Bảng tính và phân bổ khấu hao TSCĐ (06-TSCĐ)</option>
                      </optgroup>
                      <option value="General">Chứng từ nghiệp vụ khác</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Hash size={16} className="text-slate-500" />
                      Số chứng từ
                    </label>
                    <input 
                      type="text" 
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      disabled={isViewOnly}
                      placeholder="VD: PT001"
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" />
                      Ngày hạch toán
                    </label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isViewOnly}
                      className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <AlignLeft size={16} className="text-amber-500" />
                    Diễn giải
                  </label>
                  <textarea 
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isViewOnly}
                    placeholder="Nhập nội dung nghiệp vụ..."
                    className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Specialized Forms */}
                {type === 'Payroll' && (
                  <PayrollForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Overtime' && (
                  <OvertimeForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Outsource' && (
                  <OutsourceForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Contract' && (
                  <ContractForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'ContractLiquidation' && (
                  <ContractLiquidationForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'PayrollDeduction' && (
                  <PayrollDeductionForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'PayrollAllocation' && (
                  <PayrollAllocationForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Bonus' && (
                  <BonusForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'MoneyReceipt' && (
                  <MoneyReceiptForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'GoldCurrencyList' && (
                  <GoldCurrencyListForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'Receipt' && (
                  <ReceiptForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'Payment' && (
                  <PaymentForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'AdvanceRequest' && (
                  <AdvanceRequestForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'AdvanceSettlement' && (
                  <AdvanceSettlementForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'PaymentRequest' && (
                  <PaymentRequestForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                    totalAmount={items.reduce((sum, item) => sum + Number(item.amount), 0)}
                  />
                )}
                {type === 'GoodsReceived' && (
                  <GoodsReceivedForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'GoodsDelivered' && (
                  <GoodsDeliveredForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'GoodsIssued' && (
                  <GoodsIssuedForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'PurchaseList' && (
                  <PurchaseListForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Purchase' && (
                  <PurchaseForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'Sales' && (
                  <SalesForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AgencySettlement' && (
                  <AgencySettlementForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'PaymentList' && (
                  <PaymentListForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetHandover' && (
                  <AssetHandoverForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetLiquidation' && (
                  <AssetLiquidationForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetRepair' && (
                  <AssetRepairForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetRevaluation' && (
                  <AssetRevaluationForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetInventory' && (
                  <AssetInventorySummaryForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'AssetDepreciation' && (
                  <AssetDepreciationForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'InventoryInspection' && (
                  <InventoryInspectionForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {type === 'InventorySummary' && (
                  <InventorySummaryForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {(type === 'FundInventoryVND' || type === 'FundInventoryForeign') && (
                  <FundInventoryForm 
                    type={type}
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {(['RemainingInventory', 'MaterialAllocation'].includes(type)) && (
                  <InventoryVoucherForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}
                {(['OtherAssetType'].includes(type)) && (
                  <FixedAssetVoucherForm 
                    metadata={metadata} 
                    onChange={setMetadata} 
                    isViewOnly={isViewOnly} 
                  />
                )}

                <VoucherItemTable 
                  items={items}
                  type={type}
                  isViewOnly={isViewOnly}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onItemChange={handleItemChange}
                  isInventoryType={isInventoryType}
                />

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
                            {createdAt ? safeFormat(createdAt.toDate ? createdAt.toDate() : new Date(createdAt), 'dd/MM/yyyy HH:mm') : '---'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật cuối</p>
                        <div className="flex items-center gap-2 text-slate-700">
                          <RefreshCw size={14} className="text-slate-400" />
                          <p className="text-sm font-medium">
                            {updatedAt ? safeFormat(updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt), 'dd/MM/yyyy HH:mm') : '---'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between no-print">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tiền hàng</p>
                    <p className="text-lg font-bold text-slate-600">
                      {formatCurrency(items.reduce((sum, item) => sum + Number(item.amount), 0))}
                    </p>
                  </div>
                  {(type === 'Sales' || type === 'Purchase' || type === 'GoodsDelivered' || type === 'GoodsReceived') && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Thuế GTGT</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(items.reduce((sum, item) => sum + (Number(item.vatAmount) || 0), 0))}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tổng cộng</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        items.reduce((sum, item) => sum + Number(item.amount), 0) + 
                        items.reduce((sum, item) => sum + (Number(item.vatAmount) || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {isViewOnly && vouchers.find(v => v.id === editingVoucherId)?.status === 'PendingApproval' && (role === 'admin' || role === 'accountant') && (
                    <button 
                      type="button"
                      onClick={() => {
                        const v = vouchers.find(v => v.id === editingVoucherId);
                        if (v) handleApproveClick(v);
                      }}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Phê duyệt
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-2xl bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    Đóng
                  </button>
                  {!isViewOnly && (
                    <button 
                      form="voucher-form"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      {isSubmitting ? 'Đang lưu...' : (editingVoucherId ? 'Cập nhật' : 'Lưu chứng từ')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Digital Signature Modal */}
      <DigitalSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setVoucherToSign(null);
        }}
        onSign={handleSignatureComplete}
        voucher={voucherToSign}
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
                <p className="text-slate-500 mb-8">
                  Bạn có chắc chắn muốn xóa chứng từ <span className="font-bold text-slate-900">{voucherToDelete?.number}</span>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirmOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    <span>{isSubmitting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
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

export default VoucherList;
