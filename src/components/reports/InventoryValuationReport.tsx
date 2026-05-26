import React, { useState, useMemo } from 'react';
import { Voucher, Product, OpeningBalance } from '../../types/accounting';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Package, Info, ChevronRight, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Calculator, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryValuationReportProps {
  vouchers: Voucher[];
  products: Product[];
  openingBalances: OpeningBalance[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
    productId: string;
  };
}

interface Batch {
  qty: number;
  cost: number;
  date: string;
  voucherNumber: string;
}

export const InventoryValuationReport: React.FC<InventoryValuationReportProps> = ({ 
  vouchers, 
  products, 
  openingBalances,
  workingYear, 
  filters 
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const isInventoryAccount = (acc?: string) => 
    acc?.startsWith('152') || acc?.startsWith('153') || acc?.startsWith('155') || acc?.startsWith('156');

  const valuationData = useMemo(() => {
    const filteredProducts = filters.productId 
      ? products.filter(p => p.id === filters.productId)
      : products;

    return filteredProducts.map(product => {
      // 1. Get all relevant transactions for this product up to endDate
      const productVouchers = vouchers
        .filter(v => v.date <= filters.endDate)
        .sort((a, b) => {
          const dateComp = a.date.localeCompare(b.date);
          if (dateComp !== 0) return dateComp;
          
          // Secondary sort: prioritize vouchers that typically increase inventory
          const getPriority = (type: string) => {
            if (type === 'GoodsReceived' || type === 'Purchase') return 1;
            if (type === 'GoodsIssued' || type === 'Sales') return 3;
            return 2;
          };
          const priorityA = getPriority(a.type);
          const priorityB = getPriority(b.type);
          if (priorityA !== priorityB) return priorityA - priorityB;
          
          return a.number.localeCompare(b.number);
        });

      // Initial state from opening balance
      const initialQty = product.openingQty || 0;
      const initialValue = product.openingValue || 0;
      const initialCost = initialQty > 0 ? initialValue / initialQty : 0;

      // --- Average Cost Calculation ---
      let totalImportQty = initialQty;
      let totalImportValue = initialValue;
      let totalExportQty = 0;

      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              totalImportQty += item.quantityActual || 0;
              totalImportValue += item.amount || 0;
            } else if (isInventoryAccount(item.creditAccount)) {
              totalExportQty += item.quantityActual || 0;
            }
          }
        });
      });

      const closingQty = totalImportQty - totalExportQty;
      const avgCost = totalImportQty > 0 ? totalImportValue / totalImportQty : 0;
      const avgCostValue = Math.max(0, closingQty * avgCost);

      // --- FIFO Calculation ---
      let fifoBatches: Batch[] = initialQty > 0 ? [{ 
        qty: initialQty, 
        cost: initialCost, 
        date: `${workingYear}-01-01`,
        voucherNumber: 'ĐẦU KỲ'
      }] : [];

      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              const qty = item.quantityActual || 0;
              const amount = item.amount || 0;
              if (qty > 0) {
                fifoBatches.push({ 
                  qty, 
                  cost: amount / qty,
                  date: v.date,
                  voucherNumber: v.number
                });
              }
            } else if (isInventoryAccount(item.creditAccount)) {
              let qtyToExport = item.quantityActual || 0;
              while (qtyToExport > 0 && fifoBatches.length > 0) {
                if (fifoBatches[0].qty <= qtyToExport) {
                  qtyToExport -= fifoBatches[0].qty;
                  fifoBatches.shift();
                } else {
                  fifoBatches[0].qty -= qtyToExport;
                  qtyToExport = 0;
                }
              }
            }
          }
        });
      });
      const fifoValue = fifoBatches.reduce((sum, b) => sum + (b.qty * b.cost), 0);
      const fifoUnitPrice = closingQty > 0 ? fifoValue / closingQty : 0;

      // --- LIFO Calculation ---
      let lifoBatches: Batch[] = initialQty > 0 ? [{ 
        qty: initialQty, 
        cost: initialCost,
        date: `${workingYear}-01-01`,
        voucherNumber: 'ĐẦU KỲ'
      }] : [];

      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              const qty = item.quantityActual || 0;
              const amount = item.amount || 0;
              if (qty > 0) {
                lifoBatches.push({ 
                  qty, 
                  cost: amount / qty,
                  date: v.date,
                  voucherNumber: v.number
                });
              }
            } else if (isInventoryAccount(item.creditAccount)) {
              let qtyToExport = item.quantityActual || 0;
              while (qtyToExport > 0 && lifoBatches.length > 0) {
                const lastIdx = lifoBatches.length - 1;
                if (lifoBatches[lastIdx].qty <= qtyToExport) {
                  qtyToExport -= lifoBatches[lastIdx].qty;
                  lifoBatches.pop();
                } else {
                  lifoBatches[lastIdx].qty -= qtyToExport;
                  qtyToExport = 0;
                }
              }
            }
          }
        });
      });
      const lifoValue = lifoBatches.reduce((sum, b) => sum + (b.qty * b.cost), 0);
      const lifoUnitPrice = closingQty > 0 ? lifoValue / closingQty : 0;

      // --- Moving Average Calculation (Bình quân gia quyền liên hoàn) ---
      let movingAvgQty = initialQty;
      let movingAvgValue = initialValue;
      
      productVouchers.forEach(v => {
        v.items?.forEach(item => {
          if (item.itemCode === product.code) {
            if (isInventoryAccount(item.debitAccount)) {
              movingAvgQty += item.quantityActual || 0;
              movingAvgValue += item.amount || 0;
            } else if (isInventoryAccount(item.creditAccount)) {
              const currentAvgCost = movingAvgQty > 0 ? movingAvgValue / movingAvgQty : 0;
              const qtyToExport = item.quantityActual || 0;
              movingAvgQty -= qtyToExport;
              movingAvgValue -= qtyToExport * currentAvgCost;
            }
          }
        });
      });
      const movingAvgValueResult = Math.max(0, movingAvgValue);
      const movingAvgUnitPrice = closingQty > 0 ? movingAvgValueResult / closingQty : 0;

      return {
        code: product.code,
        name: product.name,
        unit: product.unit,
        closingQty,
        fifoValue,
        lifoValue,
        avgCostValue,
        movingAvgValue: movingAvgValueResult,
        fifoUnitPrice,
        lifoUnitPrice,
        avgCostUnitPrice: closingQty > 0 ? avgCostValue / closingQty : 0,
        movingAvgUnitPrice,
        batches: fifoBatches,
        lifoBatches: lifoBatches
      };
    });
  }, [vouchers, products, filters.endDate, workingYear]);

  const totals = useMemo(() => {
    return valuationData.reduce((acc, curr) => ({
      qty: acc.qty + curr.closingQty,
      fifo: acc.fifo + curr.fifoValue,
      lifo: acc.lifo + curr.lifoValue,
      avg: acc.avg + curr.avgCostValue,
      moving: acc.moving + curr.movingAvgValue
    }), { qty: 0, fifo: 0, lifo: 0, avg: 0, moving: 0 });
  }, [valuationData]);

  const chartData = [
    { name: 'FIFO', value: totals.fifo, color: '#1877F2' },
    { name: 'LIFO', value: totals.lifo, color: '#F59E0B' },
    { name: 'Bình quân CK', value: totals.avg, color: '#10B981' },
    { name: 'Bình quân LH', value: totals.moving, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Package size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số lượng tồn</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totals.qty.toLocaleString('vi-VN')}</p>
          <p className="text-sm text-slate-500 mt-1">Đơn vị tính theo danh mục</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá trị (Bình quân)</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totals.avg)}</p>
          <div className="flex items-center gap-2 mt-1">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Phương pháp phổ biến nhất</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Calculator size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chênh lệch Max/Min</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(Math.max(totals.fifo, totals.lifo, totals.avg) - Math.min(totals.fifo, totals.lifo, totals.avg))}
          </p>
          <p className="text-sm text-slate-500 mt-1">Giữa các phương pháp tính</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            So sánh giá trị theo phương pháp
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ListFilter size={20} className="text-amber-500" />
            Phân bổ giá trị tồn kho (Top 5)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valuationData.sort((a, b) => b.avgCostValue - a.avgCostValue).slice(0, 5)}
                  dataKey="avgCostValue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {valuationData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#1877F2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center relative">
          <div className="absolute top-8 right-8 text-right text-xs text-slate-400 no-print">
            <p className="font-bold">Mẫu số S10-DN (Tùy chỉnh)</p>
            <p>(Báo cáo so sánh các phương pháp tính giá tồn kho)</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Báo cáo Tổng hợp Giá trị Tồn kho</h2>
          <p className="text-slate-500 mt-2">Tính đến ngày {filters.endDate}</p>
          <p className="text-xs text-slate-400 mt-1 italic">(Đơn vị tính: Đồng Việt Nam)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4 border-b border-slate-100">Mã hàng / Tên hàng</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">ĐVT</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">SL Tồn</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right bg-blue-50/30">FIFO</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right bg-amber-50/30">LIFO</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right bg-emerald-50/30">Bình quân CK</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right bg-purple-50/30">Bình quân LH</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center no-print">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {valuationData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr className={`hover:bg-slate-50/50 transition-all ${expandedRow === row.code ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{row.code}</div>
                      <div className="text-xs text-slate-500">{row.name}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-sm">{row.unit}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{row.closingQty.toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right bg-blue-50/10">
                      <div className="text-blue-600 font-bold">{formatCurrency(row.fifoValue)}</div>
                      <div className="text-[10px] text-blue-400 italic">Đơn giá: {formatCurrency(row.fifoUnitPrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-right bg-amber-50/10">
                      <div className="text-amber-600 font-bold">{formatCurrency(row.lifoValue)}</div>
                      <div className="text-[10px] text-amber-400 italic">Đơn giá: {formatCurrency(row.lifoUnitPrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-right bg-emerald-50/10">
                      <div className="text-emerald-600 font-bold">{formatCurrency(row.avgCostValue)}</div>
                      <div className="text-[10px] text-emerald-400 italic">Đơn giá: {formatCurrency(row.avgCostUnitPrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-right bg-purple-50/10">
                      <div className="text-purple-600 font-bold">{formatCurrency(row.movingAvgValue)}</div>
                      <div className="text-[10px] text-purple-400 italic">Đơn giá: {formatCurrency(row.movingAvgUnitPrice)}</div>
                    </td>
                    <td className="px-6 py-4 text-center no-print">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === row.code ? null : row.code)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-blue-500"
                      >
                        {expandedRow === row.code ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </td>
                  </tr>
                  
                  <AnimatePresence>
                    {expandedRow === row.code && (
                      <tr>
                        <td colSpan={7} className="px-6 py-0 border-none">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50 rounded-2xl my-4 mx-2 border border-slate-100"
                          >
                            <div className="p-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-blue-500" />
                                Chi tiết các lô hàng tồn (Theo FIFO)
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {row.batches.map((batch, bIdx) => (
                                  <div key={bIdx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{batch.voucherNumber}</span>
                                      <span className="text-[10px] text-slate-400">{batch.date}</span>
                                    </div>
                                    <div className="text-lg font-bold text-slate-900">{batch.qty.toLocaleString('vi-VN')} {row.unit}</div>
                                    <div className="text-xs text-blue-600 font-medium">Giá: {formatCurrency(batch.cost)}</div>
                                    <div className="text-[10px] text-slate-400 mt-2">Thành tiền: {formatCurrency(batch.qty * batch.cost)}</div>
                                  </div>
                                ))}
                                {row.batches.length === 0 && (
                                  <div className="col-span-4 py-8 text-center text-slate-400 italic text-sm">
                                    Không có lô hàng tồn khả dụng.
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold text-sm">
              <tr>
                <td className="px-6 py-6 uppercase tracking-wider">Tổng cộng</td>
                <td className="px-6 py-6 text-center">-</td>
                <td className="px-6 py-6 text-right">{totals.qty.toLocaleString('vi-VN')}</td>
                <td className="px-6 py-6 text-right bg-blue-600/20">{formatCurrency(totals.fifo)}</td>
                <td className="px-6 py-6 text-right bg-amber-600/20">{formatCurrency(totals.lifo)}</td>
                <td className="px-6 py-6 text-right bg-emerald-600/20">{formatCurrency(totals.avg)}</td>
                <td className="px-6 py-6 text-right bg-purple-600/20">{formatCurrency(totals.moving)}</td>
                <td className="px-6 py-6 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] text-slate-500 leading-relaxed">
            <div className="space-y-2">
              <h5 className="font-bold text-slate-700 uppercase">1. Phương pháp FIFO</h5>
              <p>Hàng nhập trước sẽ được xuất trước. Giá trị hàng tồn kho cuối kỳ được tính theo đơn giá của các lô hàng nhập sau cùng. Phương pháp này phản ánh giá trị tồn kho sát với giá thị trường hiện tại.</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-700 uppercase">2. Phương pháp LIFO</h5>
              <p>Hàng nhập sau sẽ được xuất trước. Giá trị hàng tồn kho cuối kỳ được tính theo đơn giá của các lô hàng nhập đầu tiên. Phương pháp này thường làm giảm lợi nhuận trong thời kỳ lạm phát.</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-700 uppercase">3. Bình quân cuối kỳ</h5>
              <p>Giá trị hàng tồn kho được tính theo đơn giá bình quân gia quyền của cả kỳ (Tổng giá trị / Tổng số lượng). Đây là phương pháp đơn giản và phổ biến nhất.</p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-700 uppercase">4. Bình quân liên hoàn</h5>
              <p>Giá trị hàng tồn kho được tính lại sau mỗi lần nhập hàng. Đơn giá xuất kho là đơn giá bình quân tại thời điểm xuất. Phương pháp này chính xác nhưng đòi hỏi tính toán liên tục.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
