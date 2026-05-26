import { Account } from '../types/accounting';

export const CHART_OF_ACCOUNTS: Account[] = [
  { code: '111', name: 'Tiền mặt', type: 'Asset', level: 1 },
  { code: '1111', name: 'Tiền Việt Nam', type: 'Asset', level: 2, parentCode: '111' },
  { code: '112', name: 'Tiền gửi Ngân hàng, Kho bạc', type: 'Asset', level: 1 },
  { code: '1121', name: 'Tiền Việt Nam (Ngân hàng, Kho bạc)', type: 'Asset', level: 2, parentCode: '112' },
  { code: '131', name: 'Phải thu khách hàng', type: 'Asset', level: 1 },
  { code: '133', name: 'Thuế GTGT được khấu trừ', type: 'Asset', level: 1 },
  { code: '152', name: 'Nguyên liệu, vật liệu', type: 'Asset', level: 1 },
  { code: '153', name: 'Công cụ, dụng cụ', type: 'Asset', level: 1 },
  { code: '211', name: 'Tài sản cố định hữu hình', type: 'Asset', level: 1 },
  { code: '331', name: 'Phải trả cho người bán', type: 'Liability', level: 1 },
  { code: '333', name: 'Thuế và các khoản phải nộp Nhà nước', type: 'Liability', level: 1 },
  { code: '334', name: 'Phải trả người lao động', type: 'Liability', level: 1 },
  { code: '411', name: 'Nguồn vốn kinh doanh', type: 'Equity', level: 1 },
  { code: '421', name: 'Lợi nhuận sau thuế chưa phân phối', type: 'Equity', level: 1 },
  { code: '511', name: 'Doanh thu bán hàng / Thu hoạt động', type: 'Revenue', level: 1 },
  { code: '531', name: 'Doanh thu dịch vụ / Thu hoạt động SXKD', type: 'Revenue', level: 1 },
  { code: '611', name: 'Chi phí hoạt động / Giá vốn', type: 'Expense', level: 1 },
  { code: '612', name: 'Chi phí dự án / Chi phí bán hàng', type: 'Expense', level: 1 },
  { code: '642', name: 'Chi phí quản lý', type: 'Expense', level: 1 },
  { code: '911', name: 'Xác định kết quả hoạt động', type: 'Other', level: 1 },
];
