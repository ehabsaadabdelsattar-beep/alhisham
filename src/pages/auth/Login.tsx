import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile, refreshProfile } = useAuth();
  const { lang, isRTL } = useLang();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (profile?.role === 'admin' || profile?.role === 'editor' || profile?.is_staff) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [session, profile]);

  const validateRegister = () => {
    if (fullName.trim().length < 2) return lang === 'ar' ? 'الاسم بالكامل يجب أن يكون حرفين على الأقل.' : 'Full name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return lang === 'ar' ? 'البريد الإلكتروني غير صحيح.' : 'Please enter a valid email address.';
    if (password.length < 8) return lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' : 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return lang === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.';
    if (!phone.trim()) return lang === 'ar' ? 'رقم الهاتف مطلوب.' : 'Phone number is required.';
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (activeTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const validationError = validateRegister();
        if (validationError) throw new Error(validationError);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });

        if (error) throw error;

        if (data.user?.identities?.length === 0) {
          throw new Error(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' : 'This email is already registered. Please sign in.');
        }

        if (!data.session) {
          setSuccessMsg(lang === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.' : 'Account created successfully! Please check your email to verify your account.');
          setActiveTab('login');
          setPassword('');
        } else {
          await refreshProfile();
        }
      }
    } catch (err: any) {
      const msg = err.message || (lang === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
      if (msg.includes('Invalid login credentials')) {
        setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setError(lang === 'ar' ? 'يرجى تأكيد البريد الإلكتروني أولاً قبل تسجيل الدخول.' : 'Please confirm your email address before signing in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-surface dark:bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all ${
                  activeTab === tab
                    ? 'text-gold border-b-2 border-gold bg-gold/5'
                    : 'text-gray-500 dark:text-gray-400 hover:text-dark dark:hover:text-white'
                }`}
              >
                {tab === 'login'
                  ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                  : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')}
              </button>
            ))}
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-dark dark:text-white mb-1">
                {activeTab === 'login'
                  ? (lang === 'ar' ? 'أهلاً بك مجدداً' : 'Welcome Back')
                  : (lang === 'ar' ? 'انضم إلينا' : 'Join Us')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'login'
                  ? (lang === 'ar' ? 'قم بتسجيل الدخول لمتابعة حسابك في الهشام' : 'Sign in to your Al Hisham account')
                  : (lang === 'ar' ? 'أنشئ حسابك للوصول لكافة ميزات المنصة' : 'Create your account to get started')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800"
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-800"
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-4">
              {activeTab === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <FiUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                        placeholder={lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <FiPhone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                        placeholder="01000000000"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <FiMail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <FiLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activeTab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <FiLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                      placeholder="••••••••"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'login' && (
                <div className="flex justify-end">
                  <Link to="/reset-password" className="text-sm text-gold hover:underline">
                    {lang === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot password?'}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-3 flex justify-center items-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  activeTab === 'login'
                    ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                    : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
