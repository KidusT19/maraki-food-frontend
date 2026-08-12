"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

function VerifyEmailContent() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { login, t } = useAppContext();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError('User ID is missing');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError('User ID is missing');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: otpCode })
      });
      const data = await res.json();

      if (res.ok) {
        // Success! Log them in.
        login(data.token, data.user);
        router.push('/');
      } else {
        setError(data.error || 'Invalid or expired code');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <main className="section bg-surface" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify Email</h1>
          <p style={{ color: '#64748b' }}>
            {step === 1 ? "Please enter your email to receive a verification code." : "Enter the 6-digit code sent to your email."}
          </p>
        </div>

        {error && <div style={{ backgroundColor: '#ef444422', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{t('email')}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hello@example.com"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '2px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '1rem' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : t('send_otp')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{t('otp_code')}</label>
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.trim())}
                required
                maxLength={6}
                placeholder="123456"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '2px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : t('verify_and_login')}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
