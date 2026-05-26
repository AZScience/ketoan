import React from 'react';
import { Voucher, Account, OpeningBalance } from '../../types/accounting';
import { safeFormat } from '../../utils/dateUtils';

interface NotesToFinancialStatementsProps {
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const NotesToFinancialStatements: React.FC<NotesToFinancialStatementsProps> = ({ 
  workingYear, 
  filters 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-12 space-y-8">
      <div className="text-center relative">
        <div className="absolute top-0 right-0 text-right text-[10px] text-slate-400 uppercase">
          <p className="font-bold">Mẫu số B03-BCTCNN</p>
          <p>(Ban hành kèm theo Thông tư số 99/2018/TT-BTC)</p>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Bản Thuyết Minh Báo Cáo Tài Chính</h2>
        <p className="text-slate-500 mt-2">Năm {workingYear}</p>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">I. Đặc điểm hoạt động của đơn vị</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 ml-4">
          <p>1. Hình thức sở hữu vốn: .................................................................................................................................................</p>
          <p>2. Lĩnh vực hoạt động: .................................................................................................................................................</p>
          <p>3. Đặc điểm hoạt động của đơn vị trong năm tài chính có ảnh hưởng đến Báo cáo tài chính: .....................................................</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">II. Kỳ kế toán, đơn vị tiền tệ sử dụng trong kế toán</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 ml-4">
          <p>1. Kỳ kế toán năm (bắt đầu từ ngày 01/01 đến ngày 31/12).</p>
          <p>2. Đơn vị tiền tệ sử dụng trong kế toán: Đồng Việt Nam (VND).</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">III. Chuẩn mực và Chế độ kế toán áp dụng</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 ml-4">
          <p>1. Chế độ kế toán áp dụng: Thông tư số 99/2018/TT-BTC hướng dẫn chế độ kế toán cho các hoạt động xã hội, từ thiện.</p>
          <p>2. Tuyên bố về việc tuân thủ Chuẩn mực kế toán và Chế độ kế toán.</p>
          <p>3. Hình thức kế toán áp dụng: Nhật ký chung.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">IV. Các chính sách kế toán áp dụng</h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 ml-4">
          <p>1. Nguyên tắc ghi nhận các khoản tiền và các khoản tương đương tiền.</p>
          <p>2. Nguyên tắc ghi nhận hàng tồn kho.</p>
          <p>3. Nguyên tắc ghi nhận và khấu hao tài sản cố định.</p>
          <p>4. Nguyên tắc ghi nhận doanh thu, thu nhập khác.</p>
          <p>5. Nguyên tắc ghi nhận chi phí.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">V. Thông tin bổ sung cho các khoản mục trình bày trong Báo cáo tình hình tài chính</h3>
        <p className="text-xs text-slate-500 italic">(Đơn vị liệt kê chi tiết các khoản mục lớn, có biến động mạnh trong kỳ...)</p>
        <div className="h-40 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 italic">
          Nội dung chi tiết thuyết minh các chỉ tiêu tài sản, nợ phải trả, nguồn vốn...
        </div>
      </section>

      <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-12">
        <div>
          <p className="font-bold text-slate-900 uppercase text-xs">Người lập biểu</p>
          <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
          <div className="h-20"></div>
          <p className="font-bold text-slate-900">............................</p>
        </div>
        <div>
          <p className="font-bold text-slate-900 uppercase text-xs">Kế toán trưởng</p>
          <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
          <div className="h-20"></div>
          <p className="font-bold text-slate-900">............................</p>
        </div>
        <div>
          <p className="italic text-[10px] text-slate-400 mb-1">Ngày {safeFormat(new Date().toISOString(), 'dd')} tháng {safeFormat(new Date().toISOString(), 'MM')} năm {workingYear}</p>
          <p className="font-bold text-slate-900 uppercase text-xs">Người đại diện theo pháp luật</p>
          <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên, đóng dấu)</p>
          <div className="h-20"></div>
          <p className="font-bold text-slate-900">............................</p>
        </div>
      </div>
    </div>
  );
};
