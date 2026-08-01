import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  onClose?: () => void;
}

export default function PhoneVerification({ phone, onVerified, onClose }: PhoneVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    if (timer > 0 && smsSent) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, smsSent]);

  const sendOtp = async () => {
    setSending(true);
    setError(null);
    setCanResend(false);
    setTimer(60);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) {
        if (error.message.includes('SMS') || error.message.includes('provider') || error.message.includes('Signups not allowed')) {
          setError('⚠️ Phone verification requires an SMS Provider (e.g. Twilio) configured in Supabase Dashboard. Please use email verification for now.');
          return;
        }
        throw error;
      }

      setSmsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP verification code. Please check your phone number.');
    } finally {
      setSending(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: code,
        type: 'sms',
      });

      if (error) {
        if (error.message.includes('expired')) {
          setError('Code has expired. Please request a new code.');
        } else if (error.message.includes('invalid') || error.message.includes('incorrect')) {
          setError('Invalid verification code. Please try again.');
        } else {
          throw error;
        }
        return;
      }

      onVerified();
    } catch (err: any) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    sendOtp();
    inputs.current[0]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-dark-light rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">Phone Verification</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {smsSent
              ? `We sent a 6-digit verification code to ${phone}`
              : 'Sending verification code...'}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input boxes */}
        <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-gray-50 dark:bg-dark text-dark dark:text-white transition-all focus:outline-none ${
                digit
                  ? 'border-gold bg-gold/5'
                  : 'border-gray-200 dark:border-gray-700 focus:border-gold'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length < 6}
          className="w-full btn-gold py-3 flex items-center justify-center mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Verify Code'
          )}
        </button>

        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-sm text-gold hover:underline disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Resend code in <span className="text-gold font-bold">{timer}</span> seconds
            </p>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
