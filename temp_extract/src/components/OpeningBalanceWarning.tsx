import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useWorkingContext } from '../context/WorkingContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const OpeningBalanceWarning: React.FC = () => {
  const { workingYear } = useWorkingContext();
  const location = useLocation();
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (workingYear < currentYear) {
      setLoading(false);
      setBalances([]);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'opening_balances'), where('year', '==', workingYear));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBalances(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching opening balances for warning:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workingYear, currentYear]);

  const warning = useMemo(() => {
    // Don't show on the opening balances page itself or if loading or if it's a past year
    if (workingYear < currentYear || loading || location.pathname === '/opening-balances') return null;

    const totalDebit = balances.reduce((sum: number, b: any) => sum + (Number(b.debit) || 0), 0);
    const totalCredit = balances.reduce((sum: number, b: any) => sum + (Number(b.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const hasData = balances.length > 0;

    if (!hasData) {
      return {
        type: 'warning',
        message: `Số dư đầu kỳ năm ${workingYear} chưa được nhập.`,
        action: 'Thiết lập ngay'
      };
    }

    if (!isBalanced) {
      return {
        type: 'error',
        message: `Số dư đầu kỳ năm ${workingYear} đang bị chênh lệch ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(totalDebit - totalCredit))}.`,
        action: 'Kiểm tra lại'
      };
    }

    return null;
  }, [balances, workingYear, currentYear, loading, location.pathname]);

  if (!warning) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
        className={`p-4 rounded-2xl flex items-center justify-between gap-4 border shadow-sm overflow-hidden ${
          warning.type === 'error' 
            ? 'bg-rose-50 border-rose-100 text-rose-800' 
            : 'bg-amber-50 border-amber-100 text-amber-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${warning.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
            <AlertCircle size={20} />
          </div>
          <p className="text-sm font-bold leading-tight">{warning.message}</p>
        </div>
        <Link 
          to="/opening-balances"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            warning.type === 'error'
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200'
          }`}
        >
          <span className="hidden sm:inline">{warning.action}</span>
          <ArrowRight size={14} />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default OpeningBalanceWarning;
