import { Employee, Partner, Product, Voucher } from '../types/accounting';

export const SAMPLE_EMPLOYEES: Partial<Employee>[] = [
  { code: 'NV001', name: 'Nguyễn Văn A', position: 'Giám đốc', department: 'Ban Giám đốc', phone: '0901234567', email: 'vana@company.com', address: 'Hà Nội' },
  { code: 'NV002', name: 'Trần Thị B', position: 'Kế toán trưởng', department: 'Phòng Kế toán', phone: '0902345678', email: 'thib@company.com', address: 'Hà Nội' },
  { code: 'NV003', name: 'Lê Văn C', position: 'Nhân viên kinh doanh', department: 'Phòng Kinh doanh', phone: '0903456789', email: 'vanc@company.com', address: 'Hải Phòng' },
  { code: 'NV004', name: 'Admin', position: 'Quản trị viên', department: 'Ban Giám đốc', phone: '0999999999', email: 'ngviphuc@gmail.com', address: 'Hệ thống' },
];

export const SAMPLE_PARTNERS: Partial<Partner>[] = [
  { code: 'KH001', name: 'Công ty TNHH MTV Thương mại X', taxId: '0101234567', address: 'Quận 1, TP.HCM', phone: '02838221122', email: 'info@tmx.com', type: 'Customer', contactPerson: 'Anh Bình' },
  { code: 'NCC001', name: 'Tổng Công ty Cung ứng Vật tư Y', taxId: '0309876543', address: 'Quận Long Biên, Hà Nội', phone: '02439887766', email: 'sales@vattuy.vn', type: 'Supplier', contactPerson: 'Chị Lan' },
  { code: 'DT001', name: 'Hộ kinh doanh Nguyễn Văn Nam', taxId: '8123456789', address: 'Đà Nẵng', phone: '0912334455', email: 'namnv@gmail.com', type: 'Both', contactPerson: 'Anh Nam' },
];

export const SAMPLE_PRODUCTS: Partial<Product>[] = [
  { code: 'H001', name: 'Máy tính xách tay Dell XPS 13', unit: 'Cái', type: 'Goods', purchasePrice: 25000000, salePrice: 30000000, inventoryAccount: '1561' },
  { code: 'H002', name: 'Màn hình LG 27 inch 4K', unit: 'Cái', type: 'Goods', purchasePrice: 8000000, salePrice: 10500000, inventoryAccount: '1561' },
  { code: 'DV001', name: 'Dịch vụ bảo trì hệ thống', unit: 'Lần', type: 'Service', purchasePrice: 0, salePrice: 2000000, inventoryAccount: '' },
];

export const SAMPLE_VOUCHERS: Partial<Voucher>[] = [
  {
    date: new Date().toISOString().split('T')[0],
    number: 'PT001',
    type: 'Receipt',
    description: 'Thu tiền bán hàng của khách hàng X',
    totalAmount: 30000000,
    items: [
      { debitAccount: '1111', creditAccount: '131', amount: 30000000, note: 'Thu nợ khách hàng X' }
    ],
    metadata: {}
  },
  {
    date: new Date().toISOString().split('T')[0],
    number: 'PC001',
    type: 'Payment',
    description: 'Chi tiền mua văn phòng phẩm',
    totalAmount: 500000,
    items: [
      { debitAccount: '6422', creditAccount: '1111', amount: 500000, note: 'Mua giấy in, bút' }
    ],
    metadata: {}
  },
  {
    date: new Date().toISOString().split('T')[0],
    number: 'HDB001',
    type: 'Sales',
    description: 'Bán hàng cho Công ty TNHH MTV Thương mại X',
    totalAmount: 250000000,
    items: [
      { debitAccount: '131', creditAccount: '511', amount: 250000000, note: 'Doanh thu bán hàng' }
    ],
    metadata: {}
  },
  {
    date: new Date().toISOString().split('T')[0],
    number: 'HDM001',
    type: 'Purchase',
    description: 'Mua nguyên vật liệu nhập kho',
    totalAmount: 180000000,
    items: [
      { debitAccount: '152', creditAccount: '331', amount: 180000000, note: 'Mua nguyên vật liệu' }
    ],
    metadata: {}
  }
];
