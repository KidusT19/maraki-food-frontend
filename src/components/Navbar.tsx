"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function Navbar() {
  const { user, logout, cart } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
        
        .nav-right-cluster {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .hamburger {
          background: none;
          border: none;
          color: white;
          font-size: 1.8rem;
          cursor: pointer;
          padding: 0.2rem;
          line-height: 1;
          display: block; /* Always visible on all screens */
        }

        .nav-actions {
          display: none;
          position: absolute;
          top: 100%;
          right: 2rem;
          min-width: 220px;
          background-color: rgba(15, 23, 42, 0.95);
          flex-direction: column;
          gap: 1.2rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-top: none;
          border-radius: 0 0 8px 8px;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .nav-actions.open {
          display: flex;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0.75rem 1rem;
          }
          .nav-actions {
            right: 0;
            width: 100%;
            border-radius: 0;
            border-left: none;
            border-right: none;
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
      
      <Link href="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
        <h2 className="brand-logo">
          <span className="chef-hat">👨‍🍳</span>
          Maraki Food
        </h2>
      </Link>
      
      <div className="nav-right-cluster">
        {user && (
          <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 600 }}>
            Hi, {user.name.split(' ')[0]}
          </span>
        )}
        <button className="hamburger" onClick={toggleMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`nav-actions ${isMobileMenuOpen ? 'open' : ''}`}>
        {(!user || user.role === 'customer') && (
          <Link href="/restaurants" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} onClick={closeMenu}>Restaurants</Link>
        )}
        
        {user ? (
          <>
            {user.role === 'customer' && (
              <Link href="/orders" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} onClick={closeMenu}>My Orders</Link>
            )}
            {user.role === 'restaurant' && (
              <Link href="/dashboard/restaurant" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} onClick={closeMenu}>Restaurant Dashboard</Link>
            )}
            {user.role === 'driver' && (
              <Link href="/dashboard/driver" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} onClick={closeMenu}>Driver Portal</Link>
            )}
            
            <button onClick={() => { logout(); closeMenu(); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '1rem', backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#f8fafc', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, width: '100%' }}>Log Out</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }} onClick={closeMenu}>Log in</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', width: '100%', textAlign: 'center' }} onClick={closeMenu}>Sign up</Link>
          </>
        )}
        
        {/* Cart Indicator */}
        {(!user || user.role === 'customer') && cartItemCount > 0 && (
          <Link href="/checkout" style={{ textDecoration: 'none', width: '100%' }} onClick={closeMenu}>
            <div style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              borderRadius: '2rem', 
              padding: '0.5rem 1rem', 
              fontSize: '1rem', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              🛒 Checkout ({cartItemCount})
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
