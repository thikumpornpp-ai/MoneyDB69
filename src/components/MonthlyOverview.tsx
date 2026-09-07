import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { formatTHB, formatThaiMonth } from '../types';

interface MonthlyOverviewProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  selectedMonth,
  onMonthChange,
  totalIncome,
  totalExpense,
  incomeCount,
  expenseCount,
}) => {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;

  // Navigate months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${newY}-${newM}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  };

  // Days in selected month for daily average calculation
  const [currentYear, currentMonthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;

  return (
    <div className="space-y-4">
      {/* Month Selector Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              สรุปภาพรวมรายเดือน
            </h2>
            <p className="text-xs text-slate-500">
              ประจำเดือน {formatThaiMonth(selectedMonth)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-prev-month"
            onClick={handlePrevMonth}
            aria-label="เดือนก่อนหน้า"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => e.target.value && onMonthChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-slate-50 focus:outline-emerald-500 cursor-pointer"
          />

          <button
            id="btn-next-month"
            onClick={handleNextMonth}
            aria-label="เดือนถัดไป"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="btn-current-month"
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
          >
            เดือนปัจจุบัน
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              รายรับทั้งหมด
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {formatTHB(totalIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {incomeCount} รายการ
              </span>
              <span>ในเดือนนี้</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Total Expense */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              รายจ่ายทั้งหมด
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {formatTHB(totalExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-medium">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                {expenseCount} รายการ
              </span>
              <span>เฉลี่ยวันละ {formatTHB(avgDailyExpense)}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none" />
        </div>

        {/* Net Balance / Savings */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              คงเหลือสุทธิ
            </span>
            <span className={`p-2 rounded-xl ${balance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${balance >= 0 ? 'text-sky-600' : 'text-amber-600'}`}>
              {formatTHB(balance)}
            </div>
            <div className="mt-2 text-xs">
              {balance > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/70 text-emerald-800">
                  มีเงินเหลือเก็บ
                </span>
              ) : balance === 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  รายรับเท่ากับรายจ่าย
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100/80 text-rose-800">
                  ใช้จ่ายเกินรายรับ
                </span>
              )}
            </div>
          </div>
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full pointer-events-none ${balance >= 0 ? 'bg-sky-500/5' : 'bg-amber-500/5'}`} />
        </div>

        {/* Savings Rate % */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              อัตราการเก็บออม
            </span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-violet-600 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                {savingsRate}%
              </span>
              <span className="text-xs text-slate-500">ของรายรับ</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 to-emerald-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-bl-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
