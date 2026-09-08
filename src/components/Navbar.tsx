import React from 'react';
import { User } from 'firebase/auth';
import { 
  LogOut, 
  LogIn, 
  Database, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles,
  Wallet
} from 'lucide-react';
import { DATABASE_NAME, AppUser } from '../firebase';

interface NavbarProps {
  user: User | AppUser | null;
  loadingAuth: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  onSignIn,
  onSignOut,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Database Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md border border-slate-200/80 flex items-center justify-center shrink-0">
              <img
                src="/pvclogo.png"
                alt="ตราวิทยาลัยอาชีวศึกษาแพร่"
                className="w-full h-full object-contain p-0.5"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Money<span className="text-emerald-600">DB69</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-600" />
                  {DATABASE_NAME}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                ระบบจัดการรายรับ-รายจ่าย เชื่อมต่อคลาวด์ Firebase
              </p>
            </div>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                id="btn-quick-add"
                onClick={onOpenAddModal}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-emerald-600/30 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>บันทึกรายการ</span>
              </button>
            )}

            {loadingAuth ? (
              <div className="h-9 w-28 bg-slate-200 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200 ring-2 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="hidden md:block text-left text-xs leading-tight max-w-[140px] truncate">
                    <p className="font-semibold text-slate-800 truncate">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-sign-out"
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-sign-in"
                onClick={onSignIn}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-medium shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
