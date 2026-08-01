import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const from = (location.state as any)?.from?.pathname;
      navigate(from && from !== '/register' ? from : '/', { replace: true });
    }
  }, [session]);

  const validate = (): string | null => {
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
    if (!phone.trim()) return 'Phone number is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        throw new Error('This email is already registered. Please sign in.');
      }

      if (!data.session) {
        // Email confirmation required
        setSuccessMsg('Account created successfully! Please check your email to verify your account before signing in.');
      } else {
        // Auto-confirmed — navigate to home
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred. Please try again.';
      if (msg.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw: string) => {
    if (pw.length === 0) return null;
    if (pw.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (pw.length < 8) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (pw.length < 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { level: 3, label: 'Strong', color: 'bg-green-500' };
    if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) return { level: 4, label: 'Very Strong', color: 'bg-emerald-600' };
    return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-surface dark:bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Back to Login */}
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary dark:hover:text-gold transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark dark:text-white">Create Account</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Join AL HISHAM DEVELOPMENT</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Alerts */}
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
                  className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm border border-emerald-200 dark:border-emerald-800"
                >
                  <p className="font-semibold mb-1">✓ Account Created!</p>
                  <p>{successMsg}</p>
                  <Link to="/login" className="mt-3 inline-block text-gold underline font-medium">
                    Go to Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {!successMsg && (
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
                      placeholder="Ahmed Mohamed"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
                      placeholder="name@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-4 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
                      placeholder="+20 100 000 0000"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-10 text-dark dark:text-white focus:outline-none focus:border-gold text-sm"
                      placeholder="Min. 8 characters"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength */}
                  {strength && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">Strength: <span className="font-medium">{strength.label}</span></p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`w-full bg-gray-50 dark:bg-dark border rounded-lg py-3 pl-10 pr-10 text-dark dark:text-white focus:outline-none text-sm transition-colors ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-gray-200 dark:border-gray-700 focus:border-gold'
                      }`}
                      placeholder="Re-enter password"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold py-3.5 flex justify-center items-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Terms Notice */}
                <p className="text-center text-xs text-gray-400 mt-3">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-gold hover:underline">Terms & Conditions</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
                </p>

                {/* Login link */}
                <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-gold font-semibold hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
