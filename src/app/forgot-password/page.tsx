"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [simulatedLink, setSimulatedLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSimulatedLink('');
    setLoading(true);

    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        if (data.simulated_email_link) {
          setSimulatedLink(data.simulated_email_link);
        }
      } else {
        setError(data.error || 'Failed to request password reset');
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
          <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ opacity: 0.7 }}>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {error && <div style={{ backgroundColor: '#ef444422', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        {message && (
          <div style={{ backgroundColor: '#10b98122', color: '#059669', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {message}
            {simulatedLink && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>Simulated Email Received!</p>
                <Link href={simulatedLink.replace('http://192.168.1.4:3001', '')} style={{ color: 'var(--primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  Click here to reset your password
                </Link>
              </div>
            )}
          </div>
        )}

        {!simulatedLink && (
          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '2px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '1rem' }}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link href="/login" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
