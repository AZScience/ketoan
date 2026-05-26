export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'Other';

export interface Account {
  id?: string;
  code: string;
  name: string;
  type: AccountType;
  parentCode?: string;
  level: number;
  description?: string;
}

export type VoucherType = 
  | 'Receipt' | 'Payment' | 'AdvanceRequest' | 'AdvanceSettlement' | 'PaymentRequest' | 'MoneyReceipt' | 'GoldCurrencyList' | 'FundInventoryVND' | 'FundInventoryForeign' | 'PaymentList' | 'ForeignCurrencyInventory' // Tiền tệ
  | 'Payroll' | 'Bonus' | 'Overtime' | 'Outsource' | 'Contract' | 'ContractLiquidation' | 'PayrollDeduction' | 'PayrollAllocation' // Lao động tiền lương
  | 'GoodsReceived' | 'GoodsDelivered' | 'GoodsIssued' | 'InventoryInspection' | 'RemainingInventory' | 'InventorySummary' | 'Purchase' | 'PurchaseList' | 'MaterialAllocation' | 'MaterialInspection' | 'MaterialReturn' | 'InventoryInventory' // Hàng tồn kho
  | 'Sales' | 'AgencySettlement' | 'CounterCard' // Bán hàng
  | 'AssetHandover' | 'AssetLiquidation' | 'AssetRepair' | 'AssetRevaluation' | 'AssetInventory' | 'AssetDepreciation' | 'AssetAllocation' // Tài sản cố định
  | 'General';

export interface TransactionItem {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  note?: string;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  quantityPlanned?: number;
  quantityActual?: number;
  price?: number;
  vatRate?: number;
  vatAmount?: number;
  partnerCode?: string;
}

export interface DigitalSignature {
  signerName: string;
  signerEmail: string;
  signerPosition?: string;
  timestamp: any;
  signatureHash: string;
  signature: string;
  publicKey: string;
  certificateInfo?: string;
}

export interface Voucher {
  id?: string;
  date: string; // ISO string
  number: string;
  description: string;
  type: VoucherType;
  totalAmount: number;
  createdBy: string;
  items: TransactionItem[];
  createdAt: any;
  updatedAt?: any;
  status?: 'PendingApproval' | 'Approved' | 'Rejected' | 'Posted';
  approvedBy?: string;
  approvedAt?: any;
  departmentId?: string;
  projectId?: string;
  digitalSignature?: DigitalSignature;
  metadata?: Record<string, any>;
}

export type UserRole = 'admin' | 'accountant' | 'viewer';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  workingYear: number;
  lastUpdated: string;
}

export interface CompanySettings {
  name: string;
  taxId: string;
  address: string;
  director: string;
  accountant: string;
}

export interface OpeningBalance {
  id?: string;
  accountCode: string;
  debit: number;
  credit: number;
  year: number;
}

export interface Employee {
  id?: string;
  code: string;
  name: string;
  position?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type PartnerType = 'Customer' | 'Supplier' | 'Both';

export interface Partner {
  id?: string;
  code: string;
  name: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  type: PartnerType;
  contactPerson?: string;
  createdAt?: any;
  updatedAt?: any;
}

export type ProductType = 'Goods' | 'Service' | 'Material' | 'Product';

export interface Product {
  id?: string;
  code: string;
  name: string;
  unit: string;
  type: ProductType;
  purchasePrice?: number;
  salePrice?: number;
  inventoryAccount?: string;
  openingQty?: number;
  openingValue?: number;
  description?: string;
  imageUrl?: string;
  stockWarningThreshold?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface FixedAsset {
  id?: string;
  code: string;
  name: string;
  type: string;
  department?: string;
  unit?: string;
  purchaseDate: string;
  originalCost: number;
  depreciationMethod: 'StraightLine' | 'DecliningBalance';
  usefulLife: number; // in months
  accumulatedDepreciation: number;
  residualValue: number;
  assetAccount: string;
  depreciationAccount: string;
  expenseAccount: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Department {
  id?: string;
  code: string;
  name: string;
  manager?: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Warehouse {
  id?: string;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Project {
  id?: string;
  code: string;
  name: string;
  customerCode?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Active' | 'Completed' | 'OnHold';
  budget?: number;
  description?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: any;
}
