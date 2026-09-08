import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  subscribeUserTransactions,
  DATABASE_NAME,
  AppUser,
  getSavedDirectUser,
  clearDirectUserSession
} from './firebase';
import { 
  Transaction, 
  TransactionFormData 
} from './types';
import { getInitialSampleTransactions } from './data/sampleTransactions';
import { Navbar } from './components/Navbar';
import { MonthlyOverview } from './components/MonthlyOverview';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AuthBanner } from './components/AuthBanner';
import { DomainFixModal } from './components/DomainFixModal';
import { 
  Plus, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [demoUserEmail, setDemoUserEmail] = useState<string>('demo.user@gmail.com');
  const [showDomainFixModal, setShowDomainFixModal] = useState<boolean>(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Selected Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. Listen for Auth Changes
  useEffect(() => {
    // Check if there is an active direct email session first
    const directUser = getSavedDirectUser();
    if (directUser) {
      setUser(directUser);
      setIsDemoUser(false);
      setLoadingAuth(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const savedDirect = getSavedDirectUser();
        if (firebaseUser.isAnonymous && savedDirect) {
          setUser({
            uid: firebaseUser.uid,
            email: savedDirect.email,
            displayName: savedDirect.displayName || firebaseUser.displayName || savedDirect.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            isAnonymous: true,
          });
        } else {
          setUser(firebaseUser);
        }
        setIsDemoUser(false);
      } else if (!isDemoUser) {
        const savedDirect = getSavedDirectUser();
        if (!savedDirect) {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  // 2. Load or subscribe to transactions
  useEffect(() => {
    if (user && !isDemoUser) {
      setLoadingData(true);
      const unsubscribe = subscribeUserTransactions(
        user.uid,
        (items) => {
          setTransactions(items);
          setLoadingData(false);
        },
        (error) => {
          console.error('Subscription error:', error);
          setLoadingData(false);
          showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
        }
      );
      return () => unsubscribe();
    } else if (isDemoUser) {
      // Demo mode transactions from localStorage or default
      const saved = localStorage.getItem('moneydb69_demo_tx');
      if (saved) {
        try {
          setTransactions(JSON.parse(saved));
        } catch {
          initializeDemoData();
        }
      } else {
        initializeDemoData();
      }
      setLoadingData(false);
    } else {
      // Not logged in: show sample preview transactions so user can see dashboard immediately
      const sample = getInitialSampleTransactions('preview-user', 'preview@gmail.com').map((t, i) => ({
        ...t,
        id: `sample-${i}`,
      }));
      setTransactions(sample);
      setLoadingData(false);
    }
  }, [user, isDemoUser]);

  // Initialize demo data
  const initializeDemoData = () => {
    const sample = getInitialSampleTransactions('demo-uid-69', demoUserEmail).map((t, i) => ({
      ...t,
      id: `demo-${Date.now()}-${i}`,
    }));
    setTransactions(sample);
    localStorage.setItem('moneydb69_demo_tx', JSON.stringify(sample));
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoadingAuth(true);
      const loggedUser = await signInWithGoogle();
      if (loggedUser) {
        setUser(loggedUser);
        setIsDemoUser(false);
        showToast(`ยินดีต้อนรับคุณ ${loggedUser.displayName || loggedUser.email}`, 'success');
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setShowDomainFixModal(true);
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        showToast('หน้าต่างเข้าสู่ระบบถูกปิดหรือถูกบล็อก กรุณาเปิดแอปในหน้าต่างใหม่หรือใช้บัญชีตัวอย่าง', 'info');
      } else {
        showToast('เข้าสู่ระบบไม่สำเร็จ: ' + (err.message || 'โปรดลองใหม่อีกครั้ง'), 'error');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Direct Login Success
  const handleDirectLoginSuccess = (appUser: AppUser) => {
    setUser(appUser);
    setIsDemoUser(false);
    showToast(`เข้าสู่ระบบสำเร็จ: ${appUser.displayName || appUser.email} (เชื่อมต่อ Firebase ${DATABASE_NAME})`, 'success');
  };

  // Handle Demo Mode
  const handleDemoMode = () => {
    setIsDemoUser(true);
    initializeDemoData();
    showToast('เข้าสู่โหมดทดลองใช้งาน (เชื่อมต่อ MoneyDB69 จำลอง)', 'info');
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    clearDirectUserSession();
    if (isDemoUser) {
      setIsDemoUser(false);
      setUser(null);
      showToast('ออกจากโหมดทดลองเรียบร้อย', 'info');
    } else {
      await logOut();
      setUser(null);
      showToast('ออกจากระบบเรียบร้อย', 'info');
    }
  };

  // Filter transactions for currently selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Calculations for Monthly Overview
  const { totalIncome, totalExpense, incomeCount, expenseCount } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let incCnt = 0;
    let expCnt = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
        incCnt += 1;
      } else {
        exp += t.amount;
        expCnt += 1;
      }
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      incomeCount: incCnt,
      expenseCount: expCnt,
    };
  }, [monthTransactions]);

  // Transaction CRUD handlers
  const handleFormSubmit = async (formData: TransactionFormData) => {
    if (!user && !isDemoUser) {
      // Auto switch to demo or prompt login
      setIsDemoUser(true);
    }

    const effectiveUserId = user ? user.uid : 'demo-uid-69';
    const effectiveEmail = user ? (user.email || '') : demoUserEmail;

    if (editingTransaction) {
      // Update
      if (user && !isDemoUser) {
        await updateTransaction(editingTransaction.id, formData);
      } else {
        // Demo mode update
        setTransactions((prev) => {
          const next = prev.map((t) =>
            t.id === editingTransaction.id
              ? {
                  ...t,
                  type: formData.type,
                  amount: Number(formData.amount),
                  category: formData.category,
                  date: formData.date,
                  note: formData.note,
                  paymentMethod: formData.paymentMethod,
                }
              : t
          );
          localStorage.setItem('moneydb69_demo_tx', JSON.stringify(next));
          return next;
        });
      }
      showToast('แก้ไขรายการสำเร็จ', 'success');
    } else {
      // Add
      if (user && !isDemoUser) {
        await addTransaction(user, formData);
      } else {
        // Demo mode add
        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          userId: effectiveUserId,
          userEmail: effectiveEmail,
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category,
          date: formData.date,
          note: formData.note,
          paymentMethod: formData.paymentMethod,
          createdAt: Date.now(),
        };
        setTransactions((prev) => {
          const next = [newTx, ...prev];
          localStorage.setItem('moneydb69_demo_tx', JSON.stringify(next));
          return next;
        });
      }
      showToast('บันทึกรายการลง MoneyDB69 สำเร็จ', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (user && !isDemoUser) {
      await deleteTransaction(id);
    } else {
      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        localStorage.setItem('moneydb69_demo_tx', JSON.stringify(next));
        return next;
      });
    }
    showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Quick Seed Sample Data to Firebase for current user if empty
  const handleSeedUserData = async () => {
    if (!user || isDemoUser) {
      initializeDemoData();
      showToast('สร้างข้อมูลตัวอย่างในโหมดทดลองแล้ว', 'success');
      return;
    }

    try {
      const sample = getInitialSampleTransactions(user.uid, user.email || '');
      for (const item of sample) {
        await addTransaction(user, {
          type: item.type,
          amount: item.amount,
          category: item.category,
          date: item.date,
          note: item.note,
          paymentMethod: item.paymentMethod,
        });
      }
      showToast('เพิ่มชุดข้อมูลตัวอย่างเข้าสู่ Firebase สำเร็จ!', 'success');
    } catch (e: any) {
      console.error(e);
      showToast('เกิดข้อผิดพลาดในการใส่ข้อมูลตัวอย่าง', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-sky-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={
          isDemoUser
            ? ({
                displayName: 'ผู้ใช้ทดลอง (Demo)',
                email: demoUserEmail,
                uid: 'demo-uid-69',
              } as User)
            : user
        }
        loadingAuth={loadingAuth}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner if not authenticated */}
        {!user && !isDemoUser && (
          <AuthBanner
            onSignIn={handleGoogleSignIn}
            onDemoSignIn={handleDemoMode}
            onOpenDomainHelp={() => setShowDomainFixModal(true)}
            loading={loadingAuth}
          />
        )}

        {/* Database Status Pill & Seed button */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-600 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ฐานข้อมูลคลาวด์:</span>
            <span className="font-bold text-slate-800">{DATABASE_NAME}</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-700 font-medium">
              {user ? 'ออนไลน์ (ซิงค์เรียลไทม์)' : isDemoUser ? 'โหมดทดลอง' : 'ตัวอย่างก่อนเข้าสู่ระบบ'}
            </span>
          </div>

          {transactions.length === 0 && (
            <button
              id="btn-seed-sample"
              onClick={handleSeedUserData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ใส่ชุดข้อมูลตัวอย่างอัตโนมัติ</span>
            </button>
          )}
        </div>

        {/* Monthly Summary Cards */}
        <MonthlyOverview
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
        />

        {/* Analytics & Charts */}
        <AnalyticsCharts
          transactions={monthTransactions}
          allTransactions={transactions}
          selectedMonth={selectedMonth}
        />

        {/* Transaction History Table / List */}
        <TransactionList
          transactions={monthTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenAddModal={handleOpenAddModal}
          selectedMonth={selectedMonth}
        />
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          id="btn-fab-add"
          onClick={handleOpenAddModal}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all cursor-pointer"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
      />

      {/* Domain Fix & Direct Email Modal */}
      <DomainFixModal
        isOpen={showDomainFixModal}
        onClose={() => setShowDomainFixModal(false)}
        onDirectLoginSuccess={handleDirectLoginSuccess}
        onRetryGoogleAuth={handleGoogleSignIn}
        onSelectDemo={handleDemoMode}
        currentDomain={typeof window !== 'undefined' ? window.location.hostname : 'money-db-69.vercel.app'}
        projectId="moneydb69"
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/pvclogo.png"
              alt="วิทยาลัยอาชีวศึกษาแพร่"
              className="w-5 h-5 object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
            <span>MoneyDB69 — ระบบบริหารจัดการรายรับรายจ่าย วิทยาลัยอาชีวศึกษาแพร่</span>
          </div>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Firestore: {DATABASE_NAME}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
