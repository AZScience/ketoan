import { VoucherType } from '../types/accounting';

export interface VoucherDefaults {
  debitAccount: string;
  creditAccount: string;
  description?: string;
}

export const VOUCHER_DEFAULTS: Partial<Record<VoucherType, VoucherDefaults>> = {
  Receipt: { debitAccount: '111', creditAccount: '131', description: 'Thu tiền từ khách hàng' },
  Payment: { debitAccount: '331', creditAccount: '111', description: 'Chi tiền trả người bán' },
  AdvanceRequest: { debitAccount: '141', creditAccount: '111', description: 'Đề nghị tạm ứng' },
  AdvanceSettlement: { debitAccount: '642', creditAccount: '141', description: 'Thanh toán tạm ứng' },
  PaymentRequest: { debitAccount: '331', creditAccount: '111', description: 'Đề nghị thanh toán' },
  MoneyReceipt: { debitAccount: '111', creditAccount: '131', description: 'Biên lai thu tiền' },
  Payroll: { debitAccount: '642', creditAccount: '334', description: 'Thanh toán lương' },
  Bonus: { debitAccount: '642', creditAccount: '334', description: 'Thanh toán tiền thưởng' },
  Overtime: { debitAccount: '642', creditAccount: '334', description: 'Thanh toán tiền làm thêm giờ' },
  Outsource: { debitAccount: '642', creditAccount: '331', description: 'Thanh toán tiền thuê ngoài' },
  Contract: { debitAccount: '642', creditAccount: '331', description: 'Thanh toán hợp đồng giao khoán' },
  PayrollDeduction: { debitAccount: '334', creditAccount: '338', description: 'Trích nộp các khoản theo lương' },
  PayrollAllocation: { debitAccount: '642', creditAccount: '334', description: 'Phân bổ tiền lương' },
  GoodsReceived: { debitAccount: '156', creditAccount: '331', description: 'Nhập kho hàng hóa' },
  GoodsDelivered: { debitAccount: '632', creditAccount: '156', description: 'Xuất kho bán hàng' },
  GoodsIssued: { debitAccount: '642', creditAccount: '152', description: 'Xuất kho vật tư, hàng hóa' },
  InventoryInspection: { debitAccount: '152', creditAccount: '711', description: 'Kiểm kê vật tư' },
  Purchase: { debitAccount: '156', creditAccount: '331', description: 'Chứng từ mua hàng' },
  Sales: { debitAccount: '131', creditAccount: '511', description: 'Hóa đơn bán hàng' },
  AssetDepreciation: { debitAccount: '642', creditAccount: '214', description: 'Khấu hao tài sản cố định' },
  AssetLiquidation: { debitAccount: '131', creditAccount: '711', description: 'Thanh lý tài sản cố định' },
  AssetRepair: { debitAccount: '642', creditAccount: '331', description: 'Sửa chữa tài sản cố định' },
};
