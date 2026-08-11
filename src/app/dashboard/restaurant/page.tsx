"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import ChatWidget from '@/components/ChatWidget';

export default function RestaurantDashboard() {
  const { user, t } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate role
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'restaurant') {
      router.push('/');
    }
  }, [user, router]);

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch('https://maraki-food-backend.onrender.com/api/orders/restaurant', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // In a real app we'd use WebSockets. For MVP we can poll every 5s.
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Optimistically update UI
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (!user || user.role !== 'restaurant') return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>{t('live_order_feed')} 🟢</h1>
      </div>

        {loading ? (
          <p style={{ textAlign: 'center' }}>{t('loading_orders')}</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p>{t('no_orders')}</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ 
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.25rem 0' }}>{t('order')} #{order.id}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
                      👤 <strong>{order.customer_name}</strong>
                    </p>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>{Number(order.total_amount).toFixed(2)} ETB</span>
                </div>
                
                {/* Items Ordered */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('items_to_prepare')}:</p>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.95rem' }}>
                    {order.items?.map((item: any, i: number) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>
                        {item.quantity}x <strong>{item.name}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <span style={{ 
                    display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem',
                    backgroundColor: order.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 
                                     order.status === 'preparing' ? 'rgba(245, 158, 11, 0.2)' : 
                                     order.status === 'ready' ? 'rgba(59, 130, 246, 0.2)' : 
                                     order.status === 'on_the_way' ? 'rgba(168, 85, 247, 0.2)' : 
                                     'rgba(16, 185, 129, 0.2)',
                    color: order.status === 'pending' ? '#f87171' : 
                           order.status === 'preparing' ? '#fbbf24' : 
                           order.status === 'ready' ? '#60a5fa' : 
                           order.status === 'on_the_way' ? '#c084fc' : 
                           '#34d399',
                  }}>
                    {t(order.status as any) || order.status}
                  </span>
                  
                  {(order.transaction_id || order.receipt_screenshot) && (
                    <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}><strong>{t('verification')}:</strong></p>
                      {order.transaction_id && (
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>ID: <span style={{ color: '#fff' }}>{order.transaction_id}</span></p>
                      )}
                      {order.receipt_screenshot && (
                        <a href={order.receipt_screenshot.startsWith('http') ? order.receipt_screenshot : `https://maraki-food-backend.onrender.com/uploads/${order.receipt_screenshot}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                          📄 {t('view_screenshot')}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => updateOrderStatus(order.id, 'rejected')} style={{ width: '40%', padding: '0.75rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer' }}>
                        {t('reject')}
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="btn-primary" style={{ width: '60%', padding: '0.75rem', fontSize: '0.9rem' }}>
                        {t('accept_prepare')}
                      </button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.id, 'ready')} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: '#3b82f6', borderColor: '#3b82f6' }}>
                      {t('mark_ready')}
                    </button>
                  )}
                  {(order.status === 'ready' || order.status === 'on_the_way' || order.status === 'delivered') && (
                    <button disabled style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none', borderRadius: '0.5rem' }}>
                      {t('waiting_driver')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <ChatWidget />
    </>
  );
}
