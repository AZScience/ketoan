import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Account, Voucher, TransactionItem } from '../types/accounting';
import { Play, Save, RefreshCw, AlertCircle, Info, Calculator, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkingContext } from '../context/WorkingContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ClosingEntries: React.FC = () => {
  const { workingYear, workingMonth } = useWorkingContext();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const monthStr = workingMonth.toString().padStart(2, '0');
  const startOfPeriod = `${workingYear}-${monthStr}-01`;
  const lastDay = new Date(workingYear, workingMonth, 0).getDate();
  const endOfPeriod = `${workingYear}-${monthStr}-${lastDay}`;

  const [dateRange, setDateRange] = useState({
    startDate: startOfPeriod,
    endDate: endOfPeriod
  });

  useEffect(() => {
    setDateRange({
      startDate: startOfPeriod,
      endDate: endOfPeriod
    });
  }, [workingYear, workingMonth]);

  const [closingResults, setClosingResults] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'vouchers'), 
      where('date', '>=', `${workingYear}-01-01`),
      where('date', '<=', `${workingYear}-12-31`),
      orderBy('date', 'asc')
    );
    const unsubscribeV = onSnapshot(q, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      setVouchers(allVouchers.filter(v => v.status === 'Posted'));
    });

    const unsubscribeA = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
      setLoading(false);
    });

    return () => {
      unsubscribeV();
      unsubscribeA();
    };
  }, [workingYear]);

  useEffect(() => {
    // Check if the end date falls in a closed period
    const end = new Date(dateRange.endDate);
    const m = end.getMonth() + 1;
    const y = end.getFullYear();

    const pq = query(
      collection(db, 'periods'),
      where('year', '==', y),
      where('month', '==', m)
    );
    
    const unsubscribe = onSnapshot(pq, (snapshot) => {
      if (!snapshot.empty) {
        setIsPeriodClosed(snapshot.docs[0].data().status === 'Closed');
      } else {
        setIsPeriodClosed(false);
      }
    });

    return unsubscribe;
  }, [dateRange.endDate]);

  const calculateClosing = () => {
    const results: any[] = [];
    const balances: Record<string, number> = {};

    // Calculate balances for all accounts within the date range
    vouchers.forEach(v => {
      if (v.date >= dateRange.startDate && v.date <= dateRange.endDate) {
        v.items?.forEach(item => {
          if (item.debitAccount) {
            balances[item.debitAccount] = (balances[item.debitAccount] || 0) + item.amount;
          }
          if (item.creditAccount) {
            balances[item.creditAccount] = (balances[item.creditAccount] || 0) - item.amount;
          }
        });
      }
    });

    // 1. Close Revenue (5xx, 7xx) to 911
    // Revenue accounts usually have Credit balance (negative in our calculation)
    const revenueAccounts = accounts.filter(acc => (acc.code.startsWith('5') || acc.code.startsWith('7')) && acc.level === 1);
    revenueAccounts.forEach(acc => {
      const balance = balances[acc.code] || 0;
      if (balance < 0) { // Credit balance
        results.push({
          description: `Kết chuyển doanh thu tài khoản ${acc.code}`,
          debitAccount: acc.code,
          creditAccount: '911',
          amount: Math.abs(balance)
        });
      }
    });

    // 2. Close Expenses (6xx, 8xx) to 911
    // Expense accounts usually have Debit balance (positive in our calculation)
    const expenseAccounts = accounts.filter(acc => (acc.code.startsWith('6') || acc.code.startsWith('8')) && acc.level === 1);
    expenseAccounts.forEach(acc => {
      const balance = balances[acc.code] || 0;
      if (balance > 0) { // Debit balance
        results.push({
          description: `Kết chuyển chi phí tài khoản ${acc.code}`,
          debitAccount: '911',
          creditAccount: acc.code,
          amount: balance
        });
      }
    });

    // 3. Close 911 to 421 (Profit/Loss)
    let net911 = 0;
    results.forEach(r => {
      if (r.creditAccount === '911') net911 += r.amount;
      if (r.debitAccount === '911') net911 -= r.amount;
    });

    if (net911 > 0) { // Profit
      results.push({
        description: 'Kết chuyển lãi trong kỳ',
        debitAccount: '911',
        creditAccount: '421',
        amount: net911
      });
    } else if (net911 < 0) { // Loss
      results.push({
        description: 'Kết chuyển lỗ trong kỳ',
        debitAccount: '421',
        creditAccount: '911',
        amount: Math.abs(net911)
      });
    }

    setClosingResults(results);
  };

  const generateVoucher = async () => {
    if (closingResults.length === 0) return;
    if (isPeriodClosed) {
      setMessage({ type: 'error', text: 'Kỳ kế toán đã khóa, không thể tạo bút toán kết chuyển.' });
      return;
    }
    setProcessing(true);
    setMessage(null);

    try {
      const voucher: Partial<Voucher> = {
        type: 'General',
        number: `KC-${format(new Date(dateRange.endDate), 'MM-yyyy')}`,
        date: dateRange.endDate,
        description: `Bút toán kết chuyển cuối kỳ từ ${dateRange.startDate} đến ${dateRange.endDate}`,
        items: closingResults.map(r => ({
          description: r.description,
          debitAccount: r.debitAccount,
          creditAccount: r.creditAccount,
          amount: r.amount
        } as TransactionItem)),
        totalAmount: closingResults.reduce((sum, r) => sum + r.amount, 0),
        status: 'PendingApproval'
      };

      await addDoc(collection(db, 'vouchers'), voucher);
      setMessage({ type: 'success', text: 'Đã tạo bút toán kết chuyển thành công!' });
      setClosingResults([]);
    } catch (error) {
      console.error("Error generating closing voucher:", error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tạo bút toán.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kết Chuyển Cuối Kỳ</h1>
          <p className="text-slate-500 mt-1">Tự động tạo các bút toán kết chuyển doanh thu, chi phí và xác định kết quả kinh doanh</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Từ ngày</label>
            <input 
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Đến ngày</label>
            <input 
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button 
            onClick={calculateClosing}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Calculator size={20} />
            Tính toán kết chuyển
          </button>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {closingResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">Dự kiến bút toán kết chuyển</h3>
              {isPeriodClosed && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-medium border border-rose-100">
                  <AlertCircle size={14} />
                  Kỳ kế toán đã khóa
                </div>
              )}
            </div>
            <button 
              onClick={generateVoucher}
              disabled={processing || isPeriodClosed}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {processing ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {processing ? 'Đang xử lý...' : 'Tạo chứng từ kết chuyển'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Diễn giải</th>
                  <th className="px-6 py-4">Nợ</th>
                  <th className="px-6 py-4">Có</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {closingResults.map((res, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{res.description}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                        {res.debitAccount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs">
                        {res.creditAccount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right uppercase text-xs text-slate-500">Tổng cộng</td>
                  <td className="px-6 py-4 text-right text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(closingResults.reduce((sum, r) => sum + r.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}

      {closingResults.length === 0 && !loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6">
            <Info size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có dữ liệu tính toán</h3>
          <p className="text-slate-500 max-w-md mx-auto">Vui lòng chọn khoảng thời gian và nhấn "Tính toán kết chuyển" để xem các bút toán dự kiến.</p>
        </div>
      )}
    </div>
  );
};

export default ClosingEntries;
