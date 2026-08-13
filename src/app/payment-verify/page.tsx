"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment securely...');

  useEffect(() => {
    if (!tx_ref) {
      setStatus('failed');
      setMessage('Invalid payment reference.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(\`https://maraki-food-backend.onrender.com/api/orders/verify-payment/\${tx_ref}\`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Payment Successful! Your order has been placed.');
          setTimeout(() => {
            router.push('/orders');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed. Please contact support if you were charged.');
        }
      } catch (err) {
        console.error(err);
        setStatus('failed');
        setMessage('Network error while verifying payment.');
      }
    };

    verify();
  }, [tx_ref, router]);

  return (
    <div style={{ textAlign: 'center', animation: 'fade-in-up 0.5s ease-out', maxWidth: '400px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      {status === 'verifying' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>⏳</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Verifying Payment</h2>
          <p style={{ color: '#cbd5e1' }}>{message}</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4ade80' }}>Payment Complete!</h2>
          <p style={{ color: '#cbd5e1' }}>{message}</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>Redirecting to your orders...</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>Payment Failed</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>{message}</p>
          <Link href="/checkout" style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '0.5rem', fontWeight: 'bold' }}>
            Try Again
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e1b4b, #0f172a 60%)', color: '#fff', paddingTop: '5rem' }}>
      <Suspense fallback={<div style={{ color: 'white' }}>Loading...</div>}>
        <VerifyPaymentContent />
      </Suspense>
      
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      \`}} />
    </main>
  );
}
