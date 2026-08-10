"use client";

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function Navbar() {
  const { user, logout, cart } = useAppContext();

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .nav-actions {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .navbar {
            padding: 0.75rem 1rem;
            flex-direction: column;
            gap: 0.75rem;
          }
          .nav-actions {
            gap: 1rem;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
        }
        .brand-logo {
          color: var(--primary);
          margin: 0;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brand-logo:hover {
          transform: scale(1.05);
          text-shadow: 0 0 20px rgba(234, 88, 12, 0.6);
        }
        .chef-hat {
          display: inline-block;
          font-size: 1.8rem;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .brand-logo:hover .chef-hat {
          transform: rotate(-20deg) scale(1.2) translateY(-4px);
        }
      `}</style>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h2 className="brand-logo">
          <span className="chef-hat">👨‍🍳</span>
          Maraki Food Zones
        </h2>
      </Link>
      <div className="nav-actions">
        {(!user || user.role === 'customer') && (
          <Link href="/restaurants" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600 }}>Restaurants</Link>
        )}
        
        {user ? (
          <>
            {user.role === 'customer' && (
              <Link href="/orders" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600 }}>My Orders</Link>
            )}
            {user.role === 'restaurant' && (
              <Link href="/dashboard/restaurant" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Restaurant Dashboard</Link>
            )}
            {user.role === 'driver' && (
              <Link href="/dashboard/driver" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Driver Portal</Link>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '1rem', color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 500 }}>Hi, {user.name.split(' ')[0]}</span>
              <button onClick={logout} style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#f8fafc', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>Log Out</button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Sign up</Link>
          </>
        )}
        
        {/* Cart Indicator */}
        {(!user || user.role === 'customer') && cartItemCount > 0 && (
          <div style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            borderRadius: '2rem', 
            padding: '0.25rem 0.75rem', 
            fontSize: '0.8rem', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🛒 {cartItemCount}
          </div>
        )}
      </div>
    </nav>
  );
}
