import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, OpeningBalance } from '../types/accounting';
import { FileText, Download, Printer, Filter, ChevronDown, Wallet, Calendar, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { utils, writeFile } from 'xlsx';

import { useWorkingContext } from '../context/WorkingContext';
import { CashFlowStatement } from '../components/reports/CashFlowStatement';

const CashFlowReport: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [method, setMethod] = useState<'direct' | 'indirect'>('direct');
  const { workingYear, workingMonth } = useWorkingContext();

  const [filters, setFilters] = useState({
    startDate: `${workingYear}-01-01`,
    endDate: `${workingYear}-12-31`,
  });

  useEffect(() => {
    setFilters({
      startDate: `${workingYear}-01-01`,
      endDate: `${workingYear}-12-31`,
    });
  }, [workingYear]);

  useEffect(() => {
    const q = query(
      collection(db, 'vouchers'),
      where('date', '>=', filters.startDate),
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

    const unsubscribeOB = onSnapshot(
      query(collection(db, 'opening_balances'), where('year', '==', workingYear)),
      (snapshot) => {
        setOpeningBalances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OpeningBalance)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'opening_balances');
      }
    );

    return () => {
      unsubscribeV();
      unsubscribeOB();
    };
  }, [workingYear, filters.startDate, filters.endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Simplified export for demo
    const data = vouchers.map(v => ({
      'Ngày': v.date,
      'Số CT': v.number,
      'Diễn giải': v.description,
      'Số tiền': v.totalAmount
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'CashFlow');
    writeFile(wb, `Bao_cao_Luu_chuyen_tien_te_${workingYear}.xlsx`);
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Wallet size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Báo cáo lưu chuyển tiền tệ</h1>
          </div>
          <p className="text-slate-500 ml-13">Theo dõi dòng tiền vào và ra của doanh nghiệp.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} className="text-blue-500" />
              Phương pháp
            </label>
            <div className="relative">
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value as 'direct' | 'indirect')}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold text-slate-700"
              >
                <option value="direct">Trực tiếp</option>
                <option value="indirect">Gián tiếp</option>
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="print-report">
        <CashFlowStatement 
          vouchers={vouchers}
          openingBalances={openingBalances}
          workingYear={workingYear}
          filters={filters}
          method={method}
        />
      </div>
    </div>
  );
};

export default CashFlowReport;
