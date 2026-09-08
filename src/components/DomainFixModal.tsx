import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Globe, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Database
} from 'lucide-react';
import { signInWithDirectEmail, AppUser, DATABASE_NAME } from '../firebase';

interface DomainFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectLoginSuccess: (user: AppUser) => void;
  onRetryGoogleAuth: () => void;
  onSelectDemo: () => void;
  currentDomain?: string;
  projectId?: string;
}

export const DomainFixModal: React.FC<DomainFixModalProps> = ({
  isOpen,
  onClose,
  onDirectLoginSuccess,
  onRetryGoogleAuth,
  onSelectDemo,
  currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'money-db-69.vercel.app',
  projectId = 'moneydb69',
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'direct_email' | 'demo'>('guide');
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [email, setEmail] = useState('thikumpornpp@gmail.com');
  const [displayName, setDisplayName] = useState('ธิกุมพร');
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2500);
  };

  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    setEmailError('');
    setSubmittingEmail(true);

    try {
      const user = await signInWithDirectEmail(email, displayName);
      onDirectLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setEmailError('เข้าสู่ระบบไม่สำเร็จ: ' + (err.message || 'โปรดลองใหม่อีกครั้ง'));
    } finally {
      setSubmittingEmail(false);
    }
  };

  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 px-6 py-4 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  แก้ไขข้อผิดพลาด auth/unauthorized-domain
                </h3>
              </div>
              <p className="text-amber-100 text-xs mt-0.5">
                โดเมน <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded font-semibold text-white">{currentDomain}</span> ยังไม่ได้รับอนุญาตใน Firebase Auth
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>วิธีแก้ถาวรบน Firebase</span>
          </button>
          <button
            onClick={() => setActiveTab('direct_email')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'direct_email'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="flex items-center gap-1">
              เข้าใช้งานด่วนด้วย Gmail
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">แนะนำ</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>โหมดทดลอง</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
                <strong>สาเหตุที่เกิดปัญหานี้:</strong> Firebase มีระบบความปลอดภัยที่ไม่อนุญาตให้ล็อกอิน Google OAuth บนโดเมนใหม่ (เช่น Vercel) จนกว่าผู้ดูแลระบบจะนำชื่อโดเมนไปกดเพิ่มในรายการ Authorized Domains
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>ขั้นตอนการเพิ่มโดเมนใน Firebase Console (ใช้เวลาไม่ถึง 1 นาที):</span>
                </h4>
                
                {/* Steps */}
                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-slate-900 mb-1">คัดลอกชื่อโดเมนของคุณ</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs">
                          <span>{currentDomain}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(currentDomain)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                            title="คัดลอก"
                          >
                            {copiedDomain === currentDomain ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {currentDomain !== 'money-db-69.vercel.app' && (
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs">
                            <span>money-db-69.vercel.app</span>
                            <button
                              type="button"
                              onClick={() => handleCopy('money-db-69.vercel.app')}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                              title="คัดลอก"
                            >
                              {copiedDomain === 'money-db-69.vercel.app' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-xs">
                          <span>vercel.app</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('vercel.app')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                            title="คัดลอก"
                          >
                            {copiedDomain === 'vercel.app' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-slate-900 mb-1">
                        เปิดหน้าตั้งค่า Authentication ใน Firebase Console
                      </p>
                      <a
                        href={firebaseAuthSettingsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <span>เปิดหน้า Firebase Auth Settings</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-slate-900 mb-0.5">
                        เพิ่มโดเมนในเมนู "Authorized domains"
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        เลื่อนลงมาที่หัวข้อ <strong>Authorized domains (โดเมนที่ได้รับอนุญาต)</strong> &gt; กดปุ่ม <strong>"Add domain (เพิ่มโดเมน)"</strong> &gt; วาง <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">{currentDomain}</code> แล้วกดบันทึก
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('direct_email')}
                  className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>หรือเข้าสู่ระบบด่วนโดยไม่ต้องตั้งค่าโดเมน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    ปิด
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRetryGoogleAuth();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    ลองเข้าสู่ระบบ Google ใหม่อีกครั้ง
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'direct_email' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 leading-relaxed">
                <div className="flex items-center gap-2 font-bold mb-1 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>เข้าใช้งานได้ทันที 100% เชื่อมต่อ Firebase {DATABASE_NAME} จริง</span>
                </div>
                ไม่ต้องรอเพิ่มโดเมนใน Firebase Console! คุณสามารถกรอกอีเมลของคุณเพื่อบันทึกและอ่านข้อมูลรายรับ-รายจ่ายที่เก็บไว้บนคลาวด์ Firebase Firestore ได้ทันที
              </div>

              <form onSubmit={handleDirectEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน / ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น ธิกุมพร"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมล Gmail ของคุณ (เพื่อใช้ระบุบัญชีและแยกข้อมูลใน Firebase)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ข้อมูลของคุณจะถูกเก็บในคอลเลกชัน <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700 font-bold">{DATABASE_NAME}</code> แยกตามอีเมลนี้
                  </p>
                </div>

                {emailError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {emailError}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEmail}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{submittingEmail ? 'กำลังเชื่อมต่อ...' : 'เข้าใช้งานด้วยอีเมลนี้ทันที'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">โหมดทดลองใช้งาน (Demo Mode)</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  ใช้งานระบบได้ทันทีโดยไม่ต้องเข้าสู่ระบบ ข้อมูลจะถูกจัดเก็บบนอุปกรณ์ของคุณชั่วคราว พร้อมตัวอย่างรายการรายรับ-รายจ่ายที่สมบูรณ์
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectDemo();
                  }}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  เริ่มใช้งานโหมดทดลองทันที
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
