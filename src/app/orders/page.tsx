"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useAppContext } from '@/context/AppContext';

export default function OrdersPage() {
  const { t } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [ratingOrder, setRatingOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://maraki-food-backend.onrender.com/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          restaurant_id: ratingOrder.restaurant_id,
          order_id: ratingOrder.id,
          rating,
          comment
        })
      });
      setRatingOrder(null);
      setRating(5);
      setComment('');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch('https://maraki-food-backend.onrender.com/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          throw new Error('API did not return an array');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main 
      className="section" 
      style={{ 
        paddingTop: '8rem', 
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #431407, #0f172a 50%, #020617 100%)',
        color: '#f8fafc'
      }}
    >
      <div className="container">
        <h1 className="section-title" style={{ color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{t('your_orders')}</h1>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#cbd5e1' }}>{t('loading_orders')}</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <p style={{ marginBottom: '1.5rem', opacity: 0.8, color: '#f8fafc' }}>{t('no_orders')}</p>
            <Link href="/restaurants">
              <button className="btn-primary">{t('find_food')}</button>
            </Link>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto', gap: '1rem' }}>
            {orders.map((order: any) => (
              <div 
                className="card animate-fade-in-up" 
                key={order.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  color: '#f8fafc'
                }}
              >
                <div>
                  <h3 className="card-title" style={{ marginBottom: '0.25rem', color: '#f8fafc', fontSize: '1.3rem' }}>{order.restaurant_name}</h3>
                  <p className="card-desc" style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                    Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  
                  {order.items && order.items.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: '0.75rem 0', padding: 0, opacity: 0.9, fontSize: '0.9rem', color: '#cbd5e1' }}>
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.2rem' }}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: order.status === 'delivered' ? '#34d399' : '#fbbf24',
                    border: order.status === 'delivered' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.35rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                    {Number(order.total_amount).toFixed(2)} ETB
                  </span>
                  {order.receipt_screenshot && (
                    <a href={`https://maraki-food-backend.onrender.com/uploads/${order.receipt_screenshot}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent', color: '#cbd5e1', border: '1px solid #cbd5e1', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem' }}>
                      {t('view_receipt')}
                    </a>
                  )}
                  {order.status === 'delivered' && !order.is_rated && (
                    <button 
                      onClick={() => setRatingOrder(order)}
                      style={{ display: 'block', width: '100%', marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#eab308', color: '#000', border: 'none', borderRadius: '2rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      {t('rate_order')} ⭐️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {ratingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>{t('rate_experience')}</h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{t('how_was_food').replace('{restaurant}', ratingOrder.restaurant_name)}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: star <= rating ? '#eab308' : '#475569'
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={t('leave_comment')}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#0f172a', color: '#fff', marginBottom: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setRatingOrder(null)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '0.5rem', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={submitReview} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>{t('submit_review')}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
