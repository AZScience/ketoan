import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, setDoc, doc, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Account, OpeningBalance } from '../types/accounting';
import { Save, Search, Filter, RefreshCw, AlertCircle, Info, Calculator, CheckCircle2, ArrowDownToLine, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkingContext } from '../context/WorkingContext';
import { Voucher } from '../types/accounting';

const OpeningBalances: React.FC = () => {
  const { workingYear } = useWorkingContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balances, setBalances] = useState<Record<string, { debit: number; credit: number }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isPeriodClosed, setIsPeriodClosed] = useState(false);
  const [prevYearBalances, setPrevYearBalances] = useState<Record<string, { debit: number; credit: number }>>({});
  const [isFetchingPrev, setIsFetchingPrev] = useState(false);

  const calculatePrevYearClosing = async () => {
    setIsFetchingPrev(true);
    try {
      const prevYear = workingYear - 1;
      
      // 1. Get opening balances of prev year
      const obQuery = query(collection(db, 'opening_balances'), where('year', '==', prevYear));
      const obSnap = await getDocs(obQuery);
      const totals: Record<string, { debit: number; credit: number }> = {};
      
      obSnap.docs.forEach(doc => {
        const data = doc.data() as OpeningBalance;
        totals[data.accountCode] = { debit: data.debit, credit: data.credit };
      });

      // 2. Get all posted vouchers of prev year
      const vQuery = query(
        collection(db, 'vouchers'),
        where('date', '>=', `${prevYear}-01-01`),
        where('date', '<=', `${prevYear}-12-31`),
        where('status', '==', 'Posted')
      );
      const vSnap = await getDocs(vQuery);
      
      vSnap.docs.forEach(doc => {
        const v = doc.data() as Voucher;
        v.items?.forEach(item => {
          if (item.debitAccount) {
            if (!totals[item.debitAccount]) totals[item.debitAccount] = { debit: 0, credit: 0 };
            totals[item.debitAccount].debit += item.amount;
          }
          if (item.creditAccount) {
            if (!totals[item.creditAccount]) totals[item.creditAccount] = { debit: 0, credit: 0 };
            totals[item.creditAccount].credit += item.amount;
          }
        });
      });

      // 3. Calculate net closing balance
      const closing: Record<string, { debit: number; credit: number }> = {};
      Object.entries(totals).forEach(([code, bal]) => {
        // Only carry forward Balance Sheet accounts (1xx, 2xx, 3xx, 4xx) in VAS
        // P&L accounts (5xx to 9xx) should have zero opening balance
        if (!code.startsWith('1') && !code.startsWith('2') && !code.startsWith('3') && !code.startsWith('4')) {
          return;
        }

        const net = bal.debit - bal.credit;
        if (Math.abs(net) < 0.01) return; // Skip zero balances
        
        if (net > 0) {
          closing[code] = { debit: net, credit: 0 };
        } else {
          closing[code] = { debit: 0, credit: Math.abs(net) };
        }
      });

      setPrevYearBalances(closing);
    } catch (error) {
      console.error("Error calculating previous year balances:", error);
    } finally {
      setIsFetchingPrev(false);
    }
  };

  useEffect(() => {
    calculatePrevYearClosing();
  }, [workingYear]);

  const applyPrevYearBalance = (code: string) => {
    const prevBal = prevYearBalances[code];
    if (!prevBal) return;
    
    setBalances(prev => ({
      ...prev,
      [code]: { ...prevBal }
    }));
  };

  const applyAllPrevYearBalances = () => {
    if (Object.keys(prevYearBalances).length === 0) return;
    
    setBalances(prev => {
      const newBalances = { ...prev };
      Object.entries(prevYearBalances).forEach(([code, bal]) => {
        newBalances[code] = { ...bal };
      });
      return newBalances;
    });
    
    setMessage({ type: 'success', text: `Đã tự động điền số dư từ năm ${workingYear - 1}` });
  };

  useEffect(() => {
    const q = query(collection(db, 'accounts'), orderBy('code', 'asc'));
    const unsubscribeAcc = onSnapshot(q, (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'accounts');
    });

    const bq = query(collection(db, 'opening_balances'), where('year', '==', workingYear));
    const unsubscribeBal = onSnapshot(bq, (snapshot) => {
      const balMap: Record<string, { debit: number; credit: number }> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as OpeningBalance;
        balMap[data.accountCode] = { debit: data.debit, credit: data.credit };
      });
      setBalances(balMap);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'opening_balances');
      setLoading(false);
    });

    // Check if January of the working year is closed
    const pq = query(
      collection(db, 'periods'),
      where('year', '==', workingYear),
      where('month', '==', 1)
    );
    const unsubscribePeriod = onSnapshot(pq, (snapshot) => {
      if (!snapshot.empty) {
        setIsPeriodClosed(snapshot.docs[0].data().status === 'Closed');
      } else {
        setIsPeriodClosed(false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'periods');
    });

    return () => {
      unsubscribeAcc();
      unsubscribeBal();
      unsubscribePeriod();
    };
  }, [workingYear]);

  const getTypicalSide = (type: string): 'debit' | 'credit' => {
    switch (type) {
      case 'Asset':
      case 'Expense':
        return 'debit';
      case 'Liability':
      case 'Equity':
      case 'Revenue':
        return 'credit';
      default:
        return 'debit';
    }
  };

  const handleBalanceChange = (code: string, field: 'debit' | 'credit', value: string) => {
    if (isPeriodClosed) return;
    const numValue = parseFloat(value) || 0;
    
    setBalances(prev => {
      const newBalances = { ...prev };
      
      // If entering a value in one side, clear the other side for opening balances
      if (field === 'debit') {
        newBalances[code] = { debit: numValue, credit: 0 };
      } else {
        newBalances[code] = { debit: 0, credit: numValue };
      }
      
      return newBalances;
    });
  };

  const swapBalance = (code: string) => {
    setBalances(prev => {
      const current = prev[code] || { debit: 0, credit: 0 };
      return {
        ...prev,
        [code]: { debit: current.credit, credit: current.debit }
      };
    });
  };

  const clearBalance = (code: string) => {
    setBalances(prev => {
      const newBalances = { ...prev };
      delete newBalances[code];
      return newBalances;
    });
  };

  const autoBalance = () => {
    if (isBalanced) return;
    
    const diff = totalDebit - totalCredit;
    const equityCode = '411';
    
    setBalances(prev => {
      const currentEquity = prev[equityCode] || { debit: 0, credit: 0 };
      const newBalances = { ...prev };
      
      if (diff > 0) {
        // Debit > Credit, need to add to Credit
        newBalances[equityCode] = { debit: 0, credit: currentEquity.credit + diff };
      } else {
        // Credit > Debit, need to add to Debit
        newBalances[equityCode] = { debit: currentEquity.debit + Math.abs(diff), credit: 0 };
      }
      
      return newBalances;
    });
    
    setMessage({ type: 'success', text: 'Đã tự động điều chỉnh số dư vào tài khoản 411 để cân đối.' });
  };

  const saveBalances = async () => {
    if (isPeriodClosed) {
      setMessage({ type: 'error', text: 'Kỳ kế toán tháng 01 đã khóa, không thể thay đổi số dư đầu kỳ.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const batch: Promise<any>[] = [];
      Object.entries(balances).forEach(([code, bal]: [string, any]) => {
        if (bal.debit !== 0 || bal.credit !== 0) {
          const balRef = doc(db, 'opening_balances', `${workingYear}_${code}`);
          batch.push(setDoc(balRef, {
            accountCode: code,
            debit: Number(bal.debit) || 0,
            credit: Number(bal.credit) || 0,
            year: workingYear
          }));
        }
      });
      await Promise.all(batch);
      setMessage({ type: 'success', text: 'Đã lưu số dư đầu kỳ thành công!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'opening_balances');
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu số dư.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.code.includes(searchTerm) || acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDebit = Object.values(balances).reduce((sum: number, b: any) => sum + (Number(b.debit) || 0), 0) as number;
  const totalCredit = Object.values(balances).reduce((sum: number, b: any) => sum + (Number(b.credit) || 0), 0) as number;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const currentYear = new Date().getFullYear();
  
  const validationWarning = useMemo(() => {
    if (workingYear < currentYear || loading) return null;

    const hasData = Object.values(balances).some((b: { debit: number; credit: number }) => b.debit !== 0 || b.credit !== 0);
    if (!hasData) {
      return {
        type: 'warning',
        text: `Số dư đầu kỳ năm ${workingYear} chưa được nhập. Vui lòng thiết lập số dư để đảm bảo tính liên tục của dữ liệu kế toán.`
      };
    }

    if (!isBalanced) {
      return {
        type: 'error',
        text: `Cảnh báo: Tổng Nợ và Tổng Có đầu kỳ đang chênh lệch ${formatCurrency(Math.abs(totalDebit - totalCredit))}. Vui lòng kiểm tra lại bảng cân đối.`
      };
    }

    return null;
  }, [workingYear, balances, isBalanced, totalDebit, totalCredit, loading, currentYear]);

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Số Dư Đầu Kỳ</h1>
          <p className="text-slate-500 mt-1">Thiết lập số dư tài khoản tại ngày 01/01/{workingYear}</p>
        </div>
        <div className="flex items-center gap-3">
          {isPeriodClosed && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-medium border border-rose-100">
              <AlertCircle size={16} />
              Kỳ tháng 01 đã khóa
            </div>
          )}
          <button 
            onClick={saveBalances}
            disabled={saving || isPeriodClosed}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <ArrowDownToLine size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Kế thừa số dư năm trước</h3>
            <p className="text-sm text-slate-500">Tự động lấy số dư cuối kỳ năm {workingYear - 1} làm số dư đầu kỳ năm {workingYear}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={applyAllPrevYearBalances}
              disabled={isFetchingPrev || isPeriodClosed || Object.keys(prevYearBalances).length === 0}
              className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {isFetchingPrev ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Lấy số dư năm {workingYear - 1}
            </button>
            <button
              onClick={calculatePrevYearClosing}
              disabled={isFetchingPrev || isPeriodClosed}
              title="Tính toán lại số dư cuối kỳ năm trước"
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-2xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={isFetchingPrev ? "animate-spin" : ""} size={20} />
            </button>
          </div>
          {!isBalanced && (
            <button
              onClick={autoBalance}
              disabled={isPeriodClosed}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 px-6 py-3 rounded-2xl font-bold hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              <Calculator size={20} />
              Cân đối tự động
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {validationWarning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 mb-2 ${
              validationWarning.type === 'error' 
                ? 'bg-rose-100 text-rose-900 border border-rose-200' 
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <AlertCircle size={20} className={validationWarning.type === 'error' ? 'text-rose-600' : 'text-amber-600'} />
            <span className="font-bold text-sm">{validationWarning.text}</span>
          </motion.div>
        )}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng Nợ Đầu Kỳ</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalDebit)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng Có Đầu Kỳ</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalCredit)}</p>
          </div>
        </div>
        <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 ${isBalanced ? 'border-emerald-100' : 'border-rose-100'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isBalanced ? <Info size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Trạng thái cân đối</p>
            <p className={`text-xl font-bold ${isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isBalanced ? 'Đã cân đối' : `Chênh lệch: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4 text-right">Nợ đầu kỳ</th>
                <th className="px-6 py-4 text-right">Có đầu kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAccounts.map((acc) => {
                const typicalSide = getTypicalSide(acc.type);
                const currentBalance = balances[acc.code] || { debit: 0, credit: 0 };
                const prevBalance = prevYearBalances[acc.code];
                const hasAtypicalBalance = (typicalSide === 'debit' && currentBalance.credit > 0) || 
                                          (typicalSide === 'credit' && currentBalance.debit > 0);

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs shrink-0">
                          {acc.code}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{acc.name}</p>
                            {prevBalance && !isPeriodClosed && (
                              <button
                                onClick={() => applyPrevYearBalance(acc.code)}
                                title={`Lấy số dư năm trước: ${formatCurrency(prevBalance.debit || prevBalance.credit)}`}
                                className="p-1 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Sparkles size={14} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">{acc.type}</span>
                            {hasAtypicalBalance && (
                              <button 
                                onClick={() => swapBalance(acc.code)}
                                title="Chuyển sang bên thông thường"
                                className="p-0.5 text-amber-500 hover:bg-amber-50 rounded transition-colors"
                              >
                                <RefreshCw size={10} />
                              </button>
                            )}
                            {(currentBalance.debit > 0 || currentBalance.credit > 0) && (
                              <button 
                                onClick={() => clearBalance(acc.code)}
                                title="Xóa số dư"
                                className="p-0.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <RefreshCw size={10} className="rotate-45" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <input 
                        type="number"
                        disabled={isPeriodClosed}
                        value={currentBalance.debit || ''}
                        onChange={(e) => handleBalanceChange(acc.code, 'debit', e.target.value)}
                        className={`w-48 text-right px-4 py-2.5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold ${
                          typicalSide === 'debit' 
                            ? 'bg-blue-50/50 text-blue-600 placeholder:text-blue-200' 
                            : 'bg-slate-50 text-slate-400 opacity-60'
                        } ${isPeriodClosed ? 'cursor-not-allowed' : ''}`}
                        placeholder="0"
                      />
                      {typicalSide === 'debit' && (
                        <span className="absolute top-1 right-10 text-[7px] font-black text-blue-400 uppercase tracking-widest">Typical</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <input 
                        type="number"
                        disabled={isPeriodClosed}
                        value={currentBalance.credit || ''}
                        onChange={(e) => handleBalanceChange(acc.code, 'credit', e.target.value)}
                        className={`w-48 text-right px-4 py-2.5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold ${
                          typicalSide === 'credit' 
                            ? 'bg-amber-50/50 text-amber-600 placeholder:text-amber-200' 
                            : 'bg-slate-50 text-slate-400 opacity-60'
                        } ${isPeriodClosed ? 'cursor-not-allowed' : ''}`}
                        placeholder="0"
                      />
                      {typicalSide === 'credit' && (
                        <span className="absolute top-1 right-10 text-[7px] font-black text-amber-400 uppercase tracking-widest">Typical</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpeningBalances;
