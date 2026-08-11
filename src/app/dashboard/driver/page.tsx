"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export default function DriverDashboard() {
  const { user, t } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');
  const [searchQuery, setSearchQuery] = useState('');

  // Authenticate role
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'driver') {
      router.push('/');
    }
  }, [user, router]);

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch('https://maraki-food-backend.onrender.com/api/orders/driver', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new ready orders
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/orders/${orderId}/claim`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        setActiveTab('mine');
      } else {
        alert("Failed to claim order. Someone else might have claimed it!");
        fetchOrders();
      }
    } catch (err) {
      alert("Error claiming order.");
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  if (!user || user.role !== 'driver') return null;

  const availableOrders = orders.filter(o => o.driver_id === null);
  const myOrders = orders.filter(o => o.driver_id === user.id);
  
  let displayOrders = activeTab === 'available' ? availableOrders : myOrders;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayOrders = displayOrders.filter(o => 
      o.restaurant_name?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.delivery_address?.toLowerCase().includes(q) ||
      o.id.toString().includes(q)
    );
  }

  return (
    <main className="section" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'radial-gradient(circle at top left, #064e3b, #0f172a 50%, #020617 100%)', color: '#f8fafc' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>{t('driver_portal')}</h1>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t('search') + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.25rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '2rem',
                  color: '#fff',
                  outline: 'none',
                  width: '200px',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                🔍
              </span>
            </div>
            <span style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2rem', fontSize: '0.9rem' }}>{t('searching_deliveries')} 🛵</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('available')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '2rem', 
              background: activeTab === 'available' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'available' ? '#fff' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}>
            {t('available_orders')} ({availableOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '2rem', 
              background: activeTab === 'mine' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'mine' ? '#fff' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}>
            {t('my_deliveries')} ({myOrders.length})
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center' }}>{t('loading_deliveries')}</p>
        ) : displayOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p>{activeTab === 'available' ? t('no_available_orders') : t('no_claimed_orders')}</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {displayOrders.map((order) => (
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
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '0 0 0.25rem 0' }}>{t('pickup')}: {order.restaurant_name}</p>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>{t('deliver_to')}: {order.customer_name}</p>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>{Number(order.total_amount).toFixed(2)} ETB</span>
                </div>
                
                {(order.delivery_address || order.customer_phone) && (
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.9rem' }}>
                    {order.delivery_address && (
                      <p style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span>📍</span>
                        <span>{order.delivery_address}</span>
                      </p>
                    )}
                    {order.customer_phone && (
                      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📞</span>
                        <a href={`tel:${order.customer_phone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                          {order.customer_phone}
                        </a>
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <span style={{ 
                    display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
                    backgroundColor: order.status === 'pending' ? 'rgba(100, 116, 139, 0.2)' : order.status === 'preparing' ? 'rgba(234, 179, 8, 0.2)' : order.status === 'ready' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                    color: order.status === 'pending' ? '#94a3b8' : order.status === 'preparing' ? '#eab308' : order.status === 'ready' ? '#60a5fa' : '#c084fc'
                  }}>
                    {order.status === 'pending' ? t('pending_restaurant_approval') : order.status === 'preparing' ? t('restaurant_preparing') : order.status === 'ready' ? t('ready_pickup') : t('on_the_way_status')}
                  </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {activeTab === 'available' ? (
                    <button onClick={() => handleClaimOrder(order.id)} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
                      {t('claim_order')}
                    </button>
                  ) : (
                    <>
                      {(order.status === 'pending' || order.status === 'preparing') && (
                        <button disabled className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', opacity: 0.5, cursor: 'not-allowed' }}>
                          {t('waiting_restaurant')}
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => updateOrderStatus(order.id, 'on_the_way')} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: '#a855f7', borderColor: '#a855f7' }}>
                          {t('pick_up_order')}
                        </button>
                      )}
                      {order.status === 'on_the_way' && (
                        <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', background: '#10b981', borderColor: '#10b981' }}>
                          {t('mark_delivered')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
