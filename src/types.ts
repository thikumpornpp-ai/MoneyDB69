export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'transfer' | 'cash' | 'promptpay' | 'credit_card';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: PaymentMethod;
  createdAt: number;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number | '';
  category: string;
  date: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}

export interface CategoryInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', nameTh: 'อาหารและเครื่องดื่ม', nameEn: 'Food & Dining', icon: 'Utensils', color: '#f97316', type: 'expense' },
  { id: 'transport', nameTh: 'การเดินทาง / ค่าน้ำมัน', nameEn: 'Transportation', icon: 'Car', color: '#0ea5e9', type: 'expense' },
  { id: 'housing', nameTh: 'ที่อยู่อาศัย / ค่าน้ำค่าไฟ', nameEn: 'Housing & Utilities', icon: 'Home', color: '#8b5cf6', type: 'expense' },
  { id: 'shopping', nameTh: 'ช้อปปิ้ง / ของใช้', nameEn: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'entertainment', nameTh: 'บันเทิง / ท่องเที่ยว', nameEn: 'Entertainment', icon: 'Film', color: '#eab308', type: 'expense' },
  { id: 'health', nameTh: 'สุขภาพและยา', nameEn: 'Health & Medical', icon: 'HeartPulse', color: '#ef4444', type: 'expense' },
  { id: 'education', nameTh: 'การศึกษา / หนังสือ', nameEn: 'Education', icon: 'GraduationCap', color: '#3b82f6', type: 'expense' },
  { id: 'bills', nameTh: 'บิล / ค่าบริการรายเดือน', nameEn: 'Subscriptions & Bills', icon: 'Receipt', color: '#64748b', type: 'expense' },
  { id: 'other_expense', nameTh: 'อื่นๆ', nameEn: 'Other Expense', icon: 'MoreHorizontal', color: '#71717a', type: 'expense' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', nameTh: 'เงินเดือน / ค่าจ้าง', nameEn: 'Salary & Wage', icon: 'Wallet', color: '#10b981', type: 'income' },
  { id: 'bonus', nameTh: 'โบนัส / เบี้ยเลี้ยง', nameEn: 'Bonus', icon: 'Award', color: '#059669', type: 'income' },
  { id: 'freelance', nameTh: 'งานเสริม / ฟรีแลนซ์', nameEn: 'Freelance & Side Job', icon: 'Briefcase', color: '#14b8a6', type: 'income' },
  { id: 'investment', nameTh: 'ผลตอบแทน / เงินปันผล', nameEn: 'Investments & Dividends', icon: 'TrendingUp', color: '#6366f1', type: 'income' },
  { id: 'gift', nameTh: 'ของขวัญ / ได้รับมา', nameEn: 'Gift & Grants', icon: 'Gift', color: '#f43f5e', type: 'income' },
  { id: 'other_income', nameTh: 'รายรับอื่นๆ', nameEn: 'Other Income', icon: 'PlusCircle', color: '#84cc16', type: 'income' },
];

export const PAYMENT_METHODS: { id: PaymentMethod; labelTh: string; labelEn: string; icon: string }[] = [
  { id: 'transfer', labelTh: 'โอนเงิน', labelEn: 'Bank Transfer', icon: 'ArrowRightLeft' },
  { id: 'promptpay', labelTh: 'พร้อมเพย์', labelEn: 'PromptPay', icon: 'QrCode' },
  { id: 'cash', labelTh: 'เงินสด', labelEn: 'Cash', icon: 'Banknote' },
  { id: 'credit_card', labelTh: 'บัตรเครดิต', labelEn: 'Credit Card', icon: 'CreditCard' },
];

export function getCategoryDetails(categoryId: string, type?: TransactionType): CategoryInfo {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const found = all.find(c => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    nameTh: categoryId,
    nameEn: categoryId,
    icon: 'MoreHorizontal',
    color: type === 'income' ? '#10b981' : '#f43f5e',
    type: type || 'expense',
  };
}

export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('THB', '฿');
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const thaiYear = year + 543;
  return `${day} ${thaiMonths[month - 1]} ${thaiYear}`;
}

export function formatThaiMonth(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [year, month] = yearMonthStr.split('-').map(Number);
  const thaiMonthsFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiYear = year + 543;
  return `${thaiMonthsFull[month - 1]} ${thaiYear}`;
}
