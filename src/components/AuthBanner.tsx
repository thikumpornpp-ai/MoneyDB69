import React from 'react';
import { ShieldCheck, Database, Sparkles, ArrowRight } from 'lucide-react';
import { DATABASE_NAME } from '../firebase';

interface AuthBannerProps {
  onSignIn: () => void;
  onDemoSignIn: () => void;
  loading: boolean;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({
  onSignIn,
  onDemoSignIn,
  loading,
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden my-6">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 p-0.5 border border-white/20 shadow-md shrink-0">
            <img
              src="/pvclogo.png"
              alt="วิทยาลัยอาชีวศึกษาแพร่"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Database className="w-3.5 h-3.5" />
            <span>เชื่อมต่อฐานข้อมูล Firebase: {DATABASE_NAME}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          ระบบจัดการรายรับ-รายจ่าย พร้อมวิเคราะห์ข้อมูล
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          เข้าสู่ระบบด้วย Gmail เพื่อเริ่มบันทึก จัดการเงิน และดูบทวิเคราะห์กราฟสรุปผลแบบรายเดือน 
          ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัยในระบบ Cloud Firestore ({DATABASE_NAME})
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-banner-google-login"
            onClick={onSignIn}
            disabled={loading}
            className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60"
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

          <button
            id="btn-demo-mode"
            onClick={onDemoSignIn}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 rounded-xl text-sm font-semibold border border-emerald-600/40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>ทดลองใช้งานด้วยบัญชีตัวอย่าง</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-emerald-800/40 flex flex-wrap items-center gap-6 text-xs text-emerald-200/80">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>แยกข้อมูลส่วนบุคคลตามบัญชี Google</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>ฐานข้อมูล Firestore: {DATABASE_NAME}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
