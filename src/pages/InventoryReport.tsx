import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, where, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, Product } from '../types/accounting';
import { Package, Search, Download, Printer, Filter, Calendar, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useWorkingContext } from '../context/WorkingContext';
import { utils, writeFile } from 'xlsx';

const InventoryReport: React.FC = () => {
  const { workingYear, workingMonth } = useWorkingContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companySettings, setCompanySettings] = useState<any>(null);
  
  const [filters, setFilters] = useState({
    startDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-01`,
    endDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-${new Date(workingYear, workingMonth, 0).getDate()}`,
  });

  useEffect(() => {
    setFilters({
      startDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-01`,
      endDate: `${workingYear}-${workingMonth.toString().padStart(2, '0')}-${new Date(workingYear, workingMonth, 0).getDate()}`,
    });
  }, [workingYear, workingMonth]);

  useEffect(() => {
    const unsubscribeP = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    const unsubscribeBusiness = onSnapshot(doc(db, 'settings', 'business_info'), (snapshot) => {
      if (snapshot.exists()) {
        setCompanySettings(snapshot.data());
      }
    });

    // Fetch all vouchers for the year to calculate opening balances correctly
    const q = query(
      collection(db, 'vouchers'), 
      where('date', '<=', filters.endDate),
      orderBy('date', 'asc')
    );
    
    const unsubscribeV = onSnapshot(q, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      setVouchers(allVouchers.filter(v => v.status === 'Posted'));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
    });

    return () => {
      unsubscribeP();
      unsubscribeV();
      unsubscribeBusiness();
    };
  }, [filters.endDate]);

  const reportData = useMemo(() => {
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
    }).filter(p => 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, vouchers, filters, searchTerm]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleExportExcel = () => {
    const data = reportData.map(row => ({
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
    writeFile(wb, `BaoCao_NhapXuatTon_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Báo cáo Nhập - Xuất - Tồn</h1>
          <p className="text-slate-500">Chi tiết biến động kho vật tư, hàng hóa trong kỳ.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200"
          >
            <Download size={18} />
            Xuất Excel
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Printer size={18} />
            In báo cáo
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Từ ngày
            </label>
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> Đến ngày
            </label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Search size={14} /> Tìm kiếm
            </label>
            <input 
              type="text" 
              placeholder="Mã hoặc tên hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        <div className="p-10 border-b border-slate-100 text-center relative">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 text-left gap-6">
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{companySettings?.name || 'CÔNG TY TNHH GIẢI PHÁP KẾ TOÁN'}</h3>
              <p className="text-slate-500 text-xs font-medium">{companySettings?.address || 'Địa chỉ: ....................................................'}</p>
              <p className="text-slate-500 text-xs font-medium">MST: {companySettings?.taxCode || '....................'}</p>
            </div>
            <div className="text-right text-[10px] text-slate-400 uppercase tracking-widest">
              <p className="font-bold">Mẫu số S10-DN</p>
              <p>(Ban hành theo Thông tư số 200/2014/TT-BTC)</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Báo cáo Tổng hợp Nhập - Xuất - Tồn</h2>
          </div>
          <p className="text-slate-500 font-medium">Kỳ báo cáo: Từ ngày {filters.startDate} đến ngày {filters.endDate}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
              Đơn vị tính: Đồng Việt Nam
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                <th rowSpan={2} className="px-4 py-5 border border-slate-800 text-center">Mã hàng</th>
                <th rowSpan={2} className="px-4 py-5 border border-slate-800 text-center">Tên vật tư, hàng hóa</th>
                <th rowSpan={2} className="px-4 py-5 border border-slate-800 text-center">ĐVT</th>
                <th colSpan={2} className="px-4 py-3 border border-slate-800 text-center bg-slate-800">Tồn đầu kỳ</th>
                <th colSpan={2} className="px-4 py-3 border border-slate-800 text-center bg-emerald-900/50">Nhập trong kỳ</th>
                <th colSpan={2} className="px-4 py-3 border border-slate-800 text-center bg-rose-900/50">Xuất trong kỳ</th>
                <th colSpan={2} className="px-4 py-3 border border-slate-800 text-center bg-blue-900/50">Tồn cuối kỳ</th>
              </tr>
              <tr className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest">
                <th className="px-4 py-3 border border-slate-800 text-right">SL</th>
                <th className="px-4 py-3 border border-slate-800 text-right">Giá trị</th>
                <th className="px-4 py-3 border border-slate-800 text-right">SL</th>
                <th className="px-4 py-3 border border-slate-800 text-right">Giá trị</th>
                <th className="px-4 py-3 border border-slate-800 text-right">SL</th>
                <th className="px-4 py-3 border border-slate-800 text-right">Giá trị</th>
                <th className="px-4 py-3 border border-slate-800 text-right">SL</th>
                <th className="px-4 py-3 border border-slate-800 text-right">Giá trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-medium">Đang tổng hợp dữ liệu kho...</p>
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-20 text-center text-slate-400 font-medium">
                    Không có dữ liệu vật tư hàng hóa trong kỳ này.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4 font-bold text-blue-600 border-x border-slate-50">{row.code}</td>
                    <td className="px-4 py-4 text-slate-700 font-medium border-x border-slate-50">{row.name}</td>
                    <td className="px-4 py-4 text-slate-500 text-center border-x border-slate-50">{row.unit}</td>
                    <td className="px-4 py-4 text-right text-slate-600 border-x border-slate-50 bg-slate-50/30">{row.openingQty.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-slate-600 border-x border-slate-50 bg-slate-50/30">{formatCurrency(row.openingValue)}</td>
                    <td className="px-4 py-4 text-right font-bold text-emerald-600 border-x border-slate-50 bg-emerald-50/10">{row.importQty.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-bold text-emerald-600 border-x border-slate-50 bg-emerald-50/10">{formatCurrency(row.importValue)}</td>
                    <td className="px-4 py-4 text-right font-bold text-rose-600 border-x border-slate-50 bg-rose-50/10">{row.exportQty.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-bold text-rose-600 border-x border-slate-50 bg-rose-50/10">{formatCurrency(row.exportValue)}</td>
                    <td className="px-4 py-4 text-right font-black text-slate-900 border-x border-slate-50 bg-blue-50/10">{row.closingQty.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-black text-slate-900 border-x border-slate-50 bg-blue-50/10">{formatCurrency(row.closingValue)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <td colSpan={3} className="px-4 py-6 text-right border-r border-slate-800">Tổng cộng</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{reportData.reduce((sum, r) => sum + r.openingQty, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{formatCurrency(reportData.reduce((sum, r) => sum + r.openingValue, 0))}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{reportData.reduce((sum, r) => sum + r.importQty, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{formatCurrency(reportData.reduce((sum, r) => sum + r.importValue, 0))}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{reportData.reduce((sum, r) => sum + r.exportQty, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{formatCurrency(reportData.reduce((sum, r) => sum + r.exportValue, 0))}</td>
                <td className="px-4 py-6 text-right border-r border-slate-800">{reportData.reduce((sum, r) => sum + r.closingQty, 0).toLocaleString()}</td>
                <td className="px-4 py-6 text-right">{formatCurrency(reportData.reduce((sum, r) => sum + r.closingValue, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center bg-slate-50/50">
          <div className="space-y-20">
            <div>
              <p className="font-bold text-slate-900 uppercase text-xs tracking-widest">Người lập biểu</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
            </div>
            <p className="font-bold text-slate-900">............................</p>
          </div>
          <div className="space-y-20">
            <div>
              <p className="font-bold text-slate-900 uppercase text-xs tracking-widest">Kế toán trưởng</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên)</p>
            </div>
            <p className="font-bold text-slate-900">............................</p>
          </div>
          <div className="space-y-20">
            <div>
              <p className="italic text-[10px] text-slate-400 mb-1">Ngày .... tháng .... năm ....</p>
              <p className="font-bold text-slate-900 uppercase text-xs tracking-widest">Giám đốc</p>
              <p className="text-slate-400 text-[10px] italic mt-1">(Ký, họ tên, đóng dấu)</p>
            </div>
            <p className="font-bold text-slate-900">............................</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4 no-print">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Thông tin báo cáo</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Báo cáo này tổng hợp dữ liệu từ danh mục vật tư hàng hóa và các chứng từ đã được <b>Ghi sổ (Posted)</b>. 
            Số dư đầu kỳ được tính toán dựa trên số dư khai báo ban đầu cộng dồn các phát sinh trước ngày bắt đầu báo cáo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;
