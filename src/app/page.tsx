"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'driver') {
      router.replace('/dashboard/driver');
    } else if (user?.role === 'restaurant') {
      router.replace('/dashboard/restaurant');
    }
  }, [user, router]);

  // Prevent flashing the homepage content while redirecting
  if (user?.role === 'driver' || user?.role === 'restaurant') {
    return <main style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}></main>;
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content animate-fade-in-up">
            <h1 className="hero-title">
              Craving it? <br /> We <span>Deliver</span> it.
            </h1>
            <p className="hero-subtitle delay-100">
              Experience the best local restaurants delivered hot and fresh to your door in under 30 minutes. Premium quality, zero compromise.
            </p>
            <div className="hero-actions delay-200">
              <Link href="/restaurants">
                <button className="btn-primary">
                  Order Now
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </Link>
              <Link href="/restaurants">
                <button className="btn-secondary" style={{ color: 'white', borderColor: 'white' }}>
                  View Menu
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-surface">
        <div className="container">
          <h2 className="section-title">Why Choose Maraki Food Zones?</h2>
          <div className="grid grid-cols-3">
            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="card-title">Lightning Fast</h3>
              <p className="card-desc">Our advanced routing system ensures your food arrives piping hot in record time.</p>
            </div>
            
            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="card-title">Premium Quality</h3>
              <p className="card-desc">We partner exclusively with top-tier restaurants to guarantee a gourmet experience.</p>
            </div>

            <div className="card">
              <div className="card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="card-title">Secure & Reliable</h3>
              <p className="card-desc">Real-time tracking and 24/7 support means you never have to worry about your order.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
