import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import { 
  Transaction, 
  formatTHB, 
  formatThaiDate, 
  getCategoryDetails, 
  PAYMENT_METHODS 
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
  selectedMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
  selectedMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter items
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchType = filterType === 'all' || item.type === filterType;
      const details = getCategoryDetails(item.category, item.type);
      const matchSearch =
        !searchTerm ||
        item.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        details.nameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        details.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filteredTransactions.forEach((item) => {
      const arr = map.get(item.date) || [];
      arr.push(item);
      map.set(item.date, arr);
    });

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: map.get(date) || [],
      dailyIncome: (map.get(date) || [])
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0),
      dailyExpense: (map.get(date) || [])
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    }));
  }, [filteredTransactions]);

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่? ข้อมูลจะถูกลบออกจาก MoneyDB69')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } catch (err) {
        console.error('Delete failed:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = transactions.map((t) => {
      const details = getCategoryDetails(t.category, t.type);
      const pm = PAYMENT_METHODS.find((p) => p.id === t.paymentMethod)?.labelTh || 'โอนเงิน';
      return [
        `"${t.date}"`,
        `"${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}"`,
        `"${details.nameTh}"`,
        t.amount,
        `"${pm}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyDB69_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            รายการบันทึกทั้งหมด
          </h3>
          <p className="text-xs text-slate-500">
            แสดง {filteredTransactions.length} รายการ จากทั้งหมด {transactions.length} รายการ
          </p>
        </div>

        {/* Search, Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-transaction"
              type="text"
              placeholder="ค้นหาบันทึก/หมวดหมู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-emerald-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              id="btn-filter-all"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="btn-filter-expense"
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="btn-filter-income"
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Export CSV Button */}
          {transactions.length > 0 && (
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              title="ส่งออกเป็นไฟล์ CSV"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Add New Button */}
          <button
            id="btn-add-in-list"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* List content */}
      <div className="pt-4">
        {groupedByDate.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่พบรายการบันทึก</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || filterType !== 'all'
                ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
                : 'เริ่มบันทึกรายรับหรือรายจ่ายรายการแรกเพื่อดูสถิติและกราฟสรุป'}
            </p>
            <button
              id="btn-empty-add"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการแรก</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map((group) => (
              <div key={group.date} className="space-y-2">
                {/* Date header with daily balance */}
                <div className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatThaiDate(group.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    {group.dailyIncome > 0 && (
                      <span className="text-emerald-600 font-medium">
                        + {formatTHB(group.dailyIncome)}
                      </span>
                    )}
                    {group.dailyExpense > 0 && (
                      <span className="text-rose-600 font-medium">
                        - {formatTHB(group.dailyExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* List items */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const details = getCategoryDetails(item.category, item.type);
                    const pm = PAYMENT_METHODS.find((p) => p.id === item.paymentMethod);
                    const isExpense = item.type === 'expense';

                    return (
                      <div
                        key={item.id}
                        className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl transition-colors group"
                      >
                        {/* Left: Category Icon & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: details.color }}
                          >
                            <CategoryIcon name={details.icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 truncate">
                                {details.nameTh}
                              </span>
                              {pm && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                  {pm.labelTh}
                                </span>
                              )}
                            </div>
                            {item.note && (
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                                isExpense ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {isExpense ? '-' : '+'} {formatTHB(item.amount)}
                            </div>
                          </div>

                          {/* Hover action buttons */}
                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              id={`btn-edit-${item.id}`}
                              onClick={() => onEdit(item)}
                              title="แก้ไขรายการ"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-${item.id}`}
                              onClick={() => handleDeleteClick(item.id)}
                              disabled={deletingId === item.id}
                              title="ลบรายการ"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              {deletingId === item.id ? (
                                <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
