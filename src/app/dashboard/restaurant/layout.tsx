"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user, t } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  // Authenticate role
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'restaurant') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'restaurant') return null;

  return (
    <main className="section" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a 50%, #020617 100%)', color: '#f8fafc' }}>
      <div className="container">
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
          <Link href="/dashboard/restaurant" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant' ? 600 : 400
          }}>
            {t('live_order_feed' as any) || 'Live Order Feed'}
          </Link>
          <Link href="/dashboard/restaurant/menu" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant/menu' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant/menu' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant/menu' ? 600 : 400
          }}>
            {t('menu_manager' as any) || 'Menu Manager'}
          </Link>
          <Link href="/dashboard/restaurant/analytics" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant/analytics' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant/analytics' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant/analytics' ? 600 : 400
          }}>
            {t('analytics' as any) || 'Analytics'}
          </Link>
          <Link href="/dashboard/restaurant/customers" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant/customers' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant/customers' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant/customers' ? 600 : 400
          }}>
            {t('customers' as any) || 'Customers'}
          </Link>
          <Link href="/dashboard/restaurant/settings" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant/settings' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant/settings' ? 600 : 400
          }}>
            {t('settings' as any) || 'Settings'}
          </Link>
          <Link href="/dashboard/restaurant/drivers" style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem', 
            textDecoration: 'none',
            background: pathname === '/dashboard/restaurant/drivers' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: pathname === '/dashboard/restaurant/drivers' ? '#fff' : '#94a3b8',
            fontWeight: pathname === '/dashboard/restaurant/drivers' ? 600 : 400
          }}>
            {t('drivers' as any) || 'Drivers'}
          </Link>
        </div>

        {children}
        
      </div>
    </main>
  );
}
