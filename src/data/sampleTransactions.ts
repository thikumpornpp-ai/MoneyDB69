import { Transaction } from '../types';

export function getInitialSampleTransactions(userId: string, userEmail: string): Omit<Transaction, 'id'>[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  
  // Previous month string
  const prevDate = new Date(y, now.getMonth() - 1, 1);
  const prevY = prevDate.getFullYear();
  const prevM = String(prevDate.getMonth() + 1).padStart(2, '0');

  return [
    // Current month transactions
    {
      userId,
      userEmail,
      type: 'income',
      amount: 45000,
      category: 'salary',
      date: `${y}-${m}-01`,
      note: 'เงินเดือนประจำเดือน',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 600000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 8500,
      category: 'housing',
      date: `${y}-${m}-02`,
      note: 'ค่าเช่าห้องพัก + ส่วนกลาง',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 550000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 1250,
      category: 'bills',
      date: `${y}-${m}-03`,
      note: 'ค่าน้ำ-ค่าไฟ-อินเทอร์เน็ต',
      paymentMethod: 'promptpay',
      createdAt: Date.now() - 500000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 350,
      category: 'food',
      date: `${y}-${m}-04`,
      note: 'มื้อเที่ยงและกาแฟอเมซอน',
      paymentMethod: 'promptpay',
      createdAt: Date.now() - 450000,
    },
    {
      userId,
      userEmail,
      type: 'income',
      amount: 5000,
      category: 'freelance',
      date: `${y}-${m}-05`,
      note: 'รับจ้างออกแบบกราฟิก',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 400000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 1800,
      category: 'transport',
      date: `${y}-${m}-05`,
      note: 'เติมน้ำมันรถยนต์',
      paymentMethod: 'credit_card',
      createdAt: Date.now() - 350000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 2490,
      category: 'shopping',
      date: `${y}-${m}-06`,
      note: 'ซื้อของใช้ในบ้าน Uniqlo & Lotus',
      paymentMethod: 'credit_card',
      createdAt: Date.now() - 300000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 520,
      category: 'entertainment',
      date: `${y}-${m}-06`,
      note: 'ดูหนัง Major Cineplex + ป๊อปคอร์น',
      paymentMethod: 'cash',
      createdAt: Date.now() - 250000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 450,
      category: 'food',
      date: `${y}-${m}-07`,
      note: 'ส้มตำไก่ย่างกับเพื่อนร่วมงาน',
      paymentMethod: 'promptpay',
      createdAt: Date.now() - 200000,
    },
    // Previous month transactions for historical trend
    {
      userId,
      userEmail,
      type: 'income',
      amount: 45000,
      category: 'salary',
      date: `${prevY}-${prevM}-01`,
      note: 'เงินเดือนเดือนที่แล้ว',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 2500000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 18500,
      category: 'housing',
      date: `${prevY}-${prevM}-02`,
      note: 'ค่าเช่าและบิลต่างๆ',
      paymentMethod: 'transfer',
      createdAt: Date.now() - 2400000,
    },
    {
      userId,
      userEmail,
      type: 'expense',
      amount: 7200,
      category: 'food',
      date: `${prevY}-${prevM}-15`,
      note: 'ค่าอาหารรวมทั้งเดือนก่อน',
      paymentMethod: 'cash',
      createdAt: Date.now() - 2300000,
    },
  ];
}
