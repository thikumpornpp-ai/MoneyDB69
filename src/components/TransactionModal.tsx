import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Tag, 
  CreditCard 
} from 'lucide-react';
import { 
  Transaction, 
  TransactionFormData, 
  TransactionType, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  PAYMENT_METHODS, 
  PaymentMethod 
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setPaymentMethod(initialData.paymentMethod || 'transfer');
    } else {
      setType('expense');
      setAmount('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('transfer');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // When type changes, adjust default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('food');
    } else {
      setCategory('salary');
    }
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!date) {
      setErrorMsg('กรุณาเลือกวันที่');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSubmit({
        type,
        amount: parsedAmount,
        category,
        date,
        note: note.trim(),
        paymentMethod,
      });
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกเข้าสู่ฐานข้อมูล MoneyDB69
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Type Switcher: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              id="btn-select-expense"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              id="btn-select-income"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                id="input-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-['Plus_Jakarta_Sans',sans-serif]"
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400">เพิ่มเร็ว:</span>
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {activeCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-xs'
                        : 'border-transparent bg-white hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-medium line-clamp-1">
                      {cat.nameTh}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <input
                  id="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ช่องทางชำระเงิน
              </label>
              <select
                id="select-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-emerald-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.labelTh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บันทึกช่วยจำ (ถ้ามี)
            </label>
            <input
              id="input-note"
              type="text"
              placeholder="เช่น ข้าวกลางวัน, ค่าน้ำมันรถ, โบนัสโปรเจกต์..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-emerald-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-transaction"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการลง MoneyDB69'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
