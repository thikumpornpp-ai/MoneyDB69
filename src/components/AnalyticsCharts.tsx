import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { 
  Transaction, 
  formatTHB, 
  getCategoryDetails, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES 
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsChartsProps {
  transactions: Transaction[]; // transactions in selected month
  allTransactions: Transaction[]; // transactions for multi-month trend
  selectedMonth: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  allTransactions,
  selectedMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'daily' | 'monthly'>('category');

  // 1. Category Breakdown for Expenses in selected month
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, number>();

    expenses.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });

    const list = Array.from(map.entries()).map(([catId, amount]) => {
      const details = getCategoryDetails(catId, 'expense');
      const percent = totalExp > 0 ? (amount / totalExp) * 100 : 0;
      return {
        id: catId,
        name: details.nameTh,
        amount,
        percent: Number(percent.toFixed(1)),
        color: details.color,
        icon: details.icon,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // 2. Daily breakdown for selected month
  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { day: string; dateStr: string; income: number; expense: number }[] = [];

    const dailyMap: Record<number, { income: number; expense: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const dayNum = parseInt(parts[2], 10);
        if (dailyMap[dayNum]) {
          if (t.type === 'income') {
            dailyMap[dayNum].income += t.amount;
          } else {
            dailyMap[dayNum].expense += t.amount;
          }
        }
      }
    });

    for (let d = 1; d <= daysInMonth; d++) {
      result.push({
        day: `${d}`,
        dateStr: `${selectedMonth}-${String(d).padStart(2, '0')}`,
        income: dailyMap[d].income,
        expense: dailyMap[d].expense,
      });
    }

    return result;
  }, [transactions, selectedMonth]);

  // 3. Multi-month comparison (last 6 months)
  const monthlyTrendData = useMemo(() => {
    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค'
    ];

    // Generate last 6 months keys
    const [currY, currM] = selectedMonth.split('-').map(Number);
    const monthsList: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currY, currM - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      monthsList.push(`${y}-${m}`);
    }

    const map: Record<string, { income: number; expense: number }> = {};
    monthsList.forEach(m => {
      map[m] = { income: 0, expense: 0 };
    });

    allTransactions.forEach(t => {
      const mKey = t.date.substring(0, 7);
      if (map[mKey]) {
        if (t.type === 'income') {
          map[mKey].income += t.amount;
        } else {
          map[mKey].expense += t.amount;
        }
      }
    });

    return monthsList.map(mKey => {
      const [y, m] = mKey.split('-').map(Number);
      const label = `${thaiMonthsShort[m - 1]} ${(y + 543) % 100}`;
      return {
        monthKey: mKey,
        label,
        income: map[mKey].income,
        expense: map[mKey].expense,
        net: map[mKey].income - map[mKey].expense,
      };
    });
  }, [allTransactions, selectedMonth]);

  // Custom tooltips
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-lg text-xs border border-slate-700">
          <p className="font-bold text-sm mb-1">{data.name}</p>
          <p className="text-rose-300">จำนวน: {formatTHB(data.amount)}</p>
          <p className="text-slate-300">สัดส่วน: {data.percent}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-lg text-xs border border-slate-700">
          <p className="font-bold text-sm mb-1">วันที่ {label} ของเดือน</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }}>
              {item.name}: {formatTHB(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomMonthlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const inc = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const exp = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      const net = inc - exp;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-lg text-xs border border-slate-700">
          <p className="font-bold text-sm mb-1">เดือน {label}</p>
          <p className="text-emerald-400">รายรับ: {formatTHB(inc)}</p>
          <p className="text-rose-400">รายจ่าย: {formatTHB(exp)}</p>
          <p className={`font-semibold mt-1 border-t border-slate-700 pt-1 ${net >= 0 ? 'text-sky-300' : 'text-amber-400'}`}>
            คงเหลือสุทธิ: {formatTHB(net)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalExpenseAmount = categoryData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              กราฟวิเคราะห์ข้อมูลการเงิน
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์รายรับ-รายจ่ายเพื่อวางแผนการเงิน
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            id="tab-category-chart"
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนหมวดหมู่</span>
          </button>
          <button
            id="tab-daily-chart"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มรายวัน</span>
          </button>
          <button
            id="tab-monthly-chart"
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>เปรียบเทียบย้อนหลัง 6 เดือน</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-5">
        {/* Tab 1: Category Breakdown */}
        {activeTab === 'category' && (
          <div>
            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <PieIcon className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">ยังไม่มีรายการรายจ่ายในเดือนนี้</p>
                <p className="text-xs text-slate-400 mt-1">เพิ่มรายการรายจ่ายเพื่อดูกราฟสัดส่วนค่าใช้จ่าย</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Donut Chart */}
                <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="amount"
                      >
                        {categoryData.map((entry) => (
                          <Cell key={`cell-${entry.id}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] text-slate-400 font-medium">รวมรายจ่าย</span>
                    <span className="text-base font-extrabold text-slate-800">
                      {formatTHB(totalExpenseAmount)}
                    </span>
                  </div>
                </div>

                {/* Category Legend & List */}
                <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    จัดอันดับรายจ่ายตามหมวดหมู่
                  </div>
                  {categoryData.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <CategoryIcon name={item.icon} className="w-3.5 h-3.5 text-slate-600" />
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{formatTHB(item.amount)}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({item.percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Daily Trend */}
        {activeTab === 'daily' && (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span>กระแสเงินสดรายวัน (รายรับ vs รายจ่าย ในแต่ละวัน)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> รายรับ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> รายจ่าย
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="รายรับ"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="รายจ่าย"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Monthly 6-Month Comparison */}
        {activeTab === 'monthly' && (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span>เปรียบเทียบแนวโน้ม 6 เดือนที่ผ่านมา</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> รายรับ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> รายจ่าย
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip content={<CustomMonthlyTooltip />} />
                  <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
