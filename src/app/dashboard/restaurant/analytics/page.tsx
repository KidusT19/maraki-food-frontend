"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AnalyticsDashboard() {
  const { user, t } = useAppContext();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'restaurant') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://maraki-food-backend.onrender.com/api/orders/restaurant/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (!user || user.role !== 'restaurant') return null;

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading analytics...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#ef4444' }}>Error: {error}</p>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>{t('analytics_dashboard' as any) || 'Analytics Dashboard 📊'}</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Total Revenue */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '1.1rem' }}>{t('total_revenue' as any) || 'Total Revenue'}</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {data?.revenue.toFixed(2)} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>ETB</span>
          </p>
        </div>

        {/* Total Orders */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '1.1rem' }}>{t('completed_orders_stat' as any) || 'Completed Orders'}</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
            {data?.total_orders}
          </p>
        </div>

        {/* Active Orders */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '1.1rem' }}>{t('active_orders_stat' as any) || 'Active Orders'}</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {data?.active_orders}
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>{t('most_popular_dishes' as any) || 'Most Popular Dishes'}</h2>
      
      {data?.popular_dishes && data.popular_dishes.length > 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          {data.popular_dishes.map((dish: any, index: number) => {
            const maxSold = data.popular_dishes[0].total_sold || 1;
            const percentage = (dish.total_sold / maxSold) * 100;
            
            return (
              <div key={index} style={{ marginBottom: index === data.popular_dishes.length - 1 ? 0 : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{index + 1}. {dish.name}</span>
                  <span style={{ color: '#cbd5e1' }}>{dish.total_sold} {t('ordered' as any) || 'ordered'}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: 'var(--primary)', 
                    borderRadius: '1rem',
                    transition: 'width 1s ease-in-out'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p>{t('not_enough_data' as any) || 'Not enough data to determine popular dishes yet.'}</p>
        </div>
      )}
    </>
  );
}
