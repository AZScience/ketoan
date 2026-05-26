import React from 'react';
import { Voucher, Account } from '../../types/accounting';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, ArrowRight, FileText, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProfitAnalysisProps {
  vouchers: Voucher[];
  accounts: Account[];
  workingYear: number;
  filters: {
    startDate: string;
    endDate: string;
  };
}

export const ProfitAnalysis: React.FC<ProfitAnalysisProps> = ({ vouchers, accounts, workingYear, filters }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const calculateIncome = (accountCode: string) => {
    let income = 0;
    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          if (item.creditAccount?.startsWith(accountCode)) {
            income += item.amount || 0;
          }
          if (item.debitAccount?.startsWith(accountCode)) {
            income -= item.amount || 0;
          }
        });
      }
    });
    return income;
  };

  const calculateExpense = (accountCode: string) => {
    let expense = 0;
    vouchers.forEach(v => {
      if (v.date >= filters.startDate && v.date <= filters.endDate) {
        v.items?.forEach(item => {
          if (item.debitAccount?.startsWith(accountCode)) {
            expense += item.amount || 0;
          }
          if (item.creditAccount?.startsWith(accountCode)) {
            expense -= item.amount || 0;
          }
        });
      }
    });
    return expense;
  };

  const revenue = calculateIncome('511');
  const costOfGoodsSold = calculateExpense('632');
  const grossProfit = revenue - costOfGoodsSold;
  
  const financialIncome = calculateIncome('515');
  const financialExpenses = calculateExpense('635');
  const sellingExpenses = calculateExpense('641');
  const generalExpenses = calculateExpense('642');
  
  const operatingProfit = grossProfit + financialIncome - financialExpenses - sellingExpenses - generalExpenses;
  
  const otherIncome = calculateIncome('711');
  const otherExpenses = calculateExpense('811');
  const profitBeforeTax = operatingProfit + otherIncome - otherExpenses;
  
  const taxExpense = calculateExpense('821');
  const netProfitAfterTax = profitBeforeTax - taxExpense;

  const chartData = [
    { name: 'Doanh thu', value: revenue, color: '#6366f1' },
    { name: 'Giá vốn', value: costOfGoodsSold, color: '#f43f5e' },
    { name: 'LN Gộp', value: grossProfit, color: '#10b981' },
    { name: 'LN Thuần', value: operatingProfit, color: '#f59e0b' },
    { name: 'LN Sau thuế', value: netProfitAfterTax, color: '#8b5cf6' },
  ];

  const metrics = [
    { 
      label: 'Lợi nhuận gộp', 
      value: grossProfit, 
      sublabel: 'Doanh thu - Giá vốn',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      percentage: revenue > 0 ? (grossProfit / revenue) * 100 : 0
    },
    { 
      label: 'Lợi nhuận thuần', 
      value: operatingProfit, 
      sublabel: 'Từ hoạt động kinh doanh',
      icon: BarChart3,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      percentage: revenue > 0 ? (operatingProfit / revenue) * 100 : 0
    },
    { 
      label: 'Lợi nhuận sau thuế', 
      value: netProfitAfterTax, 
      sublabel: 'Kết quả cuối cùng',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      percentage: revenue > 0 ? (netProfitAfterTax / revenue) * 100 : 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Phân tích Lợi nhuận</h2>
          <p className="text-slate-500 mt-1">Năm {workingYear} • Từ {filters.startDate} đến {filters.endDate}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <PieChart size={20} className="text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">Báo cáo quản trị</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${m.bgColor} rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
              <div className={`w-12 h-12 ${m.bgColor} ${m.color} rounded-2xl flex items-center justify-center mb-4`}>
                <m.icon size={24} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-2xl font-black ${m.color} mb-1`}>{formatCurrency(m.value)}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-medium">{m.sublabel}</span>
                <span className={`text-xs font-bold ${m.color}`}>Tỷ suất: {m.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Biểu đồ so sánh các chỉ tiêu
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            Chi tiết tính toán
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <ArrowRight size={16} />
                </div>
                <span className="text-sm font-medium text-slate-600">Doanh thu bán hàng</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(revenue)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
                  <TrendingDown size={16} />
                </div>
                <span className="text-sm font-medium text-slate-600">Giá vốn hàng bán</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(costOfGoodsSold)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                  <TrendingDown size={16} />
                </div>
                <span className="text-sm font-medium text-slate-600">Chi phí bán hàng & QLDN</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(sellingExpenses + generalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
                  <Landmark size={16} />
                </div>
                <span className="text-sm font-medium text-slate-600">Thuế TNDN (821)</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(taxExpense)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
