import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { FiUser, FiPhone, FiLock, FiCamera, FiCheckCircle, FiAlertCircle, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneVerification from '../../components/auth/PhoneVerification';

export default function Profile() {
  const { profile, refreshProfile, user, isEmailVerified, isPhoneVerified, signOut } = useAuth();
  const { lang, isRTL } = useLang();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq('id', profile?.id);

      if (error) throw error;
      await refreshProfile();
      setMsg({ type: 'success', text: lang === 'ar' ? 'تم تحديث البيانات الشخصية بنجاح.' : 'Profile updated successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || (lang === 'ar' ? 'حدث خطأ أثناء التحديث.' : 'An error occurred while updating profile.') });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' : 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: lang === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg({ type: 'success', text: lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح.' : 'Password changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || (lang === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور.' : 'An error occurred while changing password.') });
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = (file: File, maxSize = 400): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
          } else {
            if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMsg(null);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error(lang === 'ar' ? 'يرجى اختيار صورة.' : 'Please select an image file.');
      }

      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(lang === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميغابايت.' : 'Image size must be less than 5MB.');
      }

      // Resize + compress to max 400px
      const base64 = await resizeImage(file, 400);

      // Save directly to profiles (no Storage needed)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: base64 })
        .eq('id', user?.id);

      if (updateError) throw new Error(updateError.message);

      setAvatarUrl(base64);
      await refreshProfile();
      setMsg({ type: 'success', text: lang === 'ar' ? 'تم تحديث الصورة الشخصية بنجاح.' : 'Profile picture updated successfully.' });
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || (lang === 'ar' ? 'فشل رفع الصورة.' : 'Failed to upload avatar.') });
    } finally {
      setUploading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: profile?.email || '' });
      if (error) throw error;
      setMsg({ type: 'success', text: lang === 'ar' ? 'تم إعادة إرسال رابط التفعيل إلى بريدك الإلكتروني.' : 'Verification email resent successfully. Please check your inbox.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || (lang === 'ar' ? 'فشل إعادة إرسال البريد.' : 'Failed to resend verification email.') });
    } finally {
      setResendingEmail(false);
    }
  };

  if (!profile) return null;

  const roleLabels: Record<string, string> = {
    admin: 'Super Admin',
    editor: lang === 'ar' ? 'محرر' : 'Editor',
    investor: lang === 'ar' ? 'مستثمر' : 'Investor',
    customer: lang === 'ar' ? 'عميل' : 'Customer',
  };

  const VerificationBadge = ({ verified, label, onAction, actionLabel }: { verified: boolean; label: string; onAction?: () => void; actionLabel?: string }) => (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${verified ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
      <div className="flex items-center gap-2.5">
        {verified
          ? <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          : <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-sm font-semibold ${verified ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {verified ? (lang === 'ar' ? 'مؤكد ✓' : 'Verified ✓') : (lang === 'ar' ? 'غير مؤكد ⚠' : 'Unverified ⚠')}
          </p>
        </div>
      </div>
      {!verified && onAction && (
        <button onClick={onAction} className="text-xs text-gold hover:underline font-medium px-2.5 py-1 rounded bg-gold/10">
          {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-surface dark:bg-dark">
      <AnimatePresence>
        {showPhoneVerification && profile.phone && (
          <PhoneVerification
            phone={profile.phone}
            onVerified={() => {
              setShowPhoneVerification(false);
              setMsg({ type: 'success', text: lang === 'ar' ? 'تم تأكيد رقم الهاتف بنجاح! ✓' : 'Phone number verified successfully! ✓' });
            }}
            onClose={() => setShowPhoneVerification(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark dark:text-white mb-2">
            {lang === 'ar' ? 'الملف الشخصي' : 'My Profile'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? 'إدارة حسابك وتحديث بياناتك الشخصية' : 'Manage your account information and preferences'}
          </p>
        </div>

        <AnimatePresence>
          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-8 p-4 rounded-xl text-sm font-medium border ${
                msg.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800'
                  : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800'
              }`}
            >
              {msg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <div className="relative w-32 h-32 mx-auto mb-5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-gold/20" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center border-4 border-gold/20 text-white font-bold text-3xl">
                    {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-gold rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg hover:scale-110 transition-transform">
                  {uploading
                    ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    : <FiCamera />}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} className="hidden" disabled={uploading} />
                </label>
              </div>
              <h3 className="font-bold text-xl text-dark dark:text-white">{profile.full_name || (lang === 'ar' ? 'مستخدم' : 'User')}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wider">
                {roleLabels[profile.role] || profile.role}
              </span>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar' ? 'عضو منذ ' : 'Member since '}
                  {new Date(profile.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2 text-sm">
                <FiShield className="text-gold" /> {lang === 'ar' ? 'حالة التحقق' : 'Account Verification'}
              </h3>
              <div className="space-y-3">
                <VerificationBadge
                  verified={isEmailVerified}
                  label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Verification'}
                  onAction={handleResendEmail}
                  actionLabel={resendingEmail ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إعادة الإرسال' : 'Resend Link')}
                />
                <VerificationBadge
                  verified={isPhoneVerified}
                  label={lang === 'ar' ? 'رقم الهاتف' : 'Phone Verification'}
                  onAction={() => setShowPhoneVerification(true)}
                  actionLabel={lang === 'ar' ? 'تأكيد الآن' : 'Verify Now'}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">
                {lang === 'ar' ? 'البيانات الشخصية' : 'Account Information'}
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <FiUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <FiPhone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                        placeholder="01000000000"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    {isEmailVerified && <span className="mx-2 text-xs text-green-500 font-normal">✓ {lang === 'ar' ? 'مؤكد' : 'Verified'}</span>}
                  </label>
                  <div className="relative">
                    <FiMail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                    <input
                      type="email"
                      value={profile.email || ''}
                      readOnly
                      className={`w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-gray-500 cursor-not-allowed text-sm`}
                      dir="ltr"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {lang === 'ar' ? 'لا يمكن تغيير البريد الإلكتروني مباشرة لأسباب أمنية.' : 'Email address cannot be changed directly for security reasons.'}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading} className="btn-gold px-8 py-3 text-sm font-semibold disabled:opacity-50">
                    {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">
                {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <div className="relative">
                      <FiLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-dark dark:text-white focus:outline-none focus:border-gold text-sm`}
                        placeholder="••••••••"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <FiLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
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
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading} className="btn-gold px-8 py-3 text-sm font-semibold disabled:opacity-50">
                    {loading ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...') : (lang === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Danger Zone: Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white dark:bg-dark-light p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-dark dark:text-white">
                {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {lang === 'ar' ? 'ستحتاج إلى تسجيل الدخول مجدداً للوصول إلى حسابك.' : 'You will need to sign in again to access your account.'}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
