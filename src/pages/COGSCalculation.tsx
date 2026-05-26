import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, getDocs, where, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Voucher, TransactionItem, Product } from '../types/accounting';
import { Play, Save, RefreshCw, AlertCircle, Info, Calculator, CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWorkingContext } from '../context/WorkingContext';
import { format } from 'date-fns';

const COGSCalculation: React.FC = () => {
  const { workingYear, workingMonth } = useWorkingContext();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  const [calculationResults, setCalculationResults] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'vouchers'), 
      where('date', '>=', `${workingYear}-01-01`),
      where('date', '<=', endOfPeriod),
      orderBy('date', 'asc')
    );
    const unsubscribeV = onSnapshot(q, (snapshot) => {
      const allVouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
      setVouchers(allVouchers.filter(v => v.status === 'Posted'));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vouchers');
    });

    const unsubscribeP = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    return () => {
      unsubscribeV();
      unsubscribeP();
    };
  }, [workingYear, endOfPeriod]);

  const calculateWeightedAverage = () => {
    const results: any[] = [];
    
    products.forEach(product => {
      let totalQty = product.openingQty || 0;
      let totalValue = product.openingValue || 0;
      let exportQtyInPeriod = 0;

      // Calculate total import (including opening) up to end of period
      vouchers.forEach(v => {
        if (v.date <= dateRange.endDate) {
          v.items?.forEach(item => {
            if (item.itemCode === product.code) {
              const isImport = item.debitAccount?.startsWith('152') || item.debitAccount?.startsWith('153') || item.debitAccount?.startsWith('155') || item.debitAccount?.startsWith('156');
              const isExport = item.creditAccount?.startsWith('152') || item.creditAccount?.startsWith('153') || item.creditAccount?.startsWith('155') || item.creditAccount?.startsWith('156');
              
              if (isImport) {
                totalQty += item.quantityActual || 0;
                totalValue += item.amount || 0;
              }
              
              if (isExport && v.date >= dateRange.startDate && v.date <= dateRange.endDate) {
                exportQtyInPeriod += item.quantityActual || 0;
              }
            }
          });
        }
      });

      if (exportQtyInPeriod > 0) {
        const avgCost = totalQty > 0 ? totalValue / totalQty : 0;
        const cogsAmount = exportQtyInPeriod * avgCost;

        results.push({
          productCode: product.code,
          productName: product.name,
          unit: product.unit,
          exportQty: exportQtyInPeriod,
          avgCost: avgCost,
          amount: cogsAmount,
          debitAccount: '632',
          creditAccount: product.code.startsWith('TP') ? '155' : '156' // Simple logic: TP for Finished Goods, others for Merchandise
        });
      }
    });

    setCalculationResults(results);
  };

  const generateVoucher = async () => {
    if (calculationResults.length === 0) return;
    setProcessing(true);
    setMessage(null);

    try {
      const voucher: Partial<Voucher> = {
        type: 'General',
        number: `GV-${format(new Date(dateRange.endDate), 'MM-yyyy')}`,
        date: dateRange.endDate,
        description: `Bút toán tính giá vốn hàng bán tháng ${workingMonth}/${workingYear} (Bình quân gia quyền)`,
        items: calculationResults.map(r => ({
          description: `Giá vốn hàng bán - ${r.productName}`,
          debitAccount: r.debitAccount,
          creditAccount: r.creditAccount,
          itemCode: r.productCode,
          itemName: r.productName,
          quantityActual: r.exportQty,
          price: r.avgCost,
          amount: r.amount
        } as TransactionItem)),
        totalAmount: calculationResults.reduce((sum, r) => sum + r.amount, 0),
        status: 'PendingApproval'
      };

      await addDoc(collection(db, 'vouchers'), voucher);
      setMessage({ type: 'success', text: 'Đã tạo bút toán giá vốn thành công!' });
      setCalculationResults([]);
    } catch (error) {
      console.error("Error generating COGS voucher:", error);
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tính Giá Vốn Hàng Bán</h1>
          <p className="text-slate-500 mt-1">Tính toán giá vốn xuất kho theo phương pháp Bình quân gia quyền cuối kỳ</p>
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
            onClick={calculateWeightedAverage}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Calculator size={20} />
            Tính giá bình quân
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

      {calculationResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Kết quả tính giá vốn</h3>
            <button 
              onClick={generateVoucher}
              disabled={processing}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {processing ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {processing ? 'Đang xử lý...' : 'Tạo chứng từ giá vốn'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Mã hàng</th>
                  <th className="px-6 py-4">Tên hàng</th>
                  <th className="px-6 py-4 text-right">SL Xuất</th>
                  <th className="px-6 py-4 text-right">Giá bình quân</th>
                  <th className="px-6 py-4 text-right">Thành tiền</th>
                  <th className="px-6 py-4 text-center">Hạch toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {calculationResults.map((res, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{res.productCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{res.productName}</td>
                    <td className="px-6 py-4 text-right font-mono">{res.exportQty.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono">{new Intl.NumberFormat('vi-VN').format(res.avgCost)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold">
                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Nợ {res.debitAccount}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Có {res.creditAccount}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right uppercase text-xs text-slate-500">Tổng cộng giá vốn</td>
                  <td className="px-6 py-4 text-right text-blue-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculationResults.reduce((sum, r) => sum + r.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}

      {calculationResults.length === 0 && !loading && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có dữ liệu tính toán</h3>
          <p className="text-slate-500 max-w-md mx-auto">Vui lòng chọn khoảng thời gian và nhấn "Tính giá bình quân" để xem kết quả dự kiến.</p>
        </div>
      )}
    </div>
  );
};

export default COGSCalculation;
