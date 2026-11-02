"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { getEthiopianTimeInfo } from '@/utils/timeCheck';

export default function CheckoutPage() {
  const { user, cart, cartTotal, clearCart, t } = useAppContext();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'chapa'>('chapa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Delivery Info states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (cart.length === 0) {
      router.push('/restaurants');
    }
  }, [user, cart, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const timeInfo = getEthiopianTimeInfo();
    if (!timeInfo.isActive) {
      alert(`Sorry, orders are closed right now. ${timeInfo.message}`);
      return;
    }

    setIsProcessing(true);

    const restaurantId = cart[0]?.restaurant_id;

    const formData = new FormData();
    formData.append('user_id', user?.id.toString() || '');
    formData.append('restaurant_id', restaurantId?.toString() || '0');
    formData.append('total_amount', cartTotal.toString());
    formData.append('payment_method', paymentMethod);
    
    formData.append('delivery_address', deliveryAddress);
    formData.append('customer_phone', customerPhone);

    formData.append('items', JSON.stringify(cart.map(c => ({
      menu_item_id: c.id,
      quantity: c.quantity,
      price: parseFloat(c.price)
    }))));

    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/orders', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        clearCart();
        
        if (paymentMethod === 'chapa' && data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          setPaymentSuccess(true);
          setTimeout(() => {
            router.push('/orders');
          }, 1500);
        }
      } else {
        alert("Failed to place order. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Backend error.', err);
      alert("Network error.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 || !user) return null;

  if (paymentSuccess) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #064e3b, #0f172a 60%)', color: '#fff', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', animation: 'fade-in-up 0.5s ease-out' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t('payment_successful')}</h2>
          <p style={{ color: '#cbd5e1' }}>{t('order_sent')}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>{t('redirecting')}</p>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="section" 
      style={{ 
        paddingTop: '6rem', 
        minHeight: '100vh', 
        background: 'radial-gradient(circle at top center, #1e1b4b, #0f172a 50%, #020617 100%)', 
        color: '#f8fafc',
        paddingBottom: '4rem',
        overflowX: 'hidden'
      }}
    >
      <div className="container" style={{ maxWidth: '900px', width: '100%', boxSizing: 'border-box' }}>
        <Link href="/restaurants" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
          &larr; {t('back_to_menu')}
        </Link>
        
        <div className="checkout-grid">
          
          {/* Column 1: Order Summary & Delivery Info */}
          <div className="checkout-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', fontWeight: 700 }}>
              {t('order_summary')}
            </h2>
            
            <ul style={{ listStyle: 'none', marginBottom: '1.5rem', padding: 0 }}>
              {cart.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', opacity: 0.9, gap: '1rem', fontSize: '0.95rem' }}>
                  <div style={{ wordBreak: 'break-word', flex: 1 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', marginRight: '0.4rem' }}>{item.quantity}x</span> 
                    {item.name}
                  </div>
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {(parseFloat(item.price) * item.quantity).toFixed(2)} ETB
                  </span>
                </li>
              ))}
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '2rem' }}>
              <span>{t('total_to_pay')}:</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.35rem' }}>{cartTotal.toFixed(2)} ETB</span>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', fontWeight: 600 }}>
                {t('delivery_information')}
              </h3>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.2rem', fontWeight: 500 }}>
                {t('delivery_address')}
                <input 
                  type="text" 
                  placeholder="e.g. Bole Atlas, behind Desalegn Hotel" 
                  required 
                  value={deliveryAddress} 
                  onChange={e => setDeliveryAddress(e.target.value)} 
                  form="checkout-form"
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '0.85rem 1rem', 
                    borderRadius: '0.6rem', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    background: 'rgba(0,0,0,0.3)', 
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }} 
                />
              </label>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                {t('contact_phone')}
                <input 
                  type="tel" 
                  placeholder="09XX XXX XXX" 
                  required 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                  form="checkout-form"
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '0.85rem 1rem', 
                    borderRadius: '0.6rem', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    background: 'rgba(0,0,0,0.3)', 
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }} 
                />
              </label>
            </div>
          </div>

          {/* Column 2: Payment Details */}
          <div className="checkout-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', fontWeight: 700 }}>
              {t('payment_details')}
            </h2>
            
            {/* Payment Method Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                onClick={() => setPaymentMethod('chapa')}
                className="payment-method-btn"
                style={{ 
                  border: '1.5px solid', 
                  borderColor: paymentMethod === 'chapa' ? '#a855f7' : 'rgba(255,255,255,0.12)', 
                  background: paymentMethod === 'chapa' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.03)', 
                  color: paymentMethod === 'chapa' ? '#d8b4fe' : '#94a3b8'
                }}
              >
                💳 Pay with Chapa
              </button>
              
              <button 
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className="payment-method-btn"
                style={{ 
                  border: '1.5px solid', 
                  borderColor: paymentMethod === 'cash' ? 'var(--primary)' : 'rgba(255,255,255,0.12)', 
                  background: paymentMethod === 'cash' ? 'rgba(234, 88, 12, 0.18)' : 'rgba(255,255,255,0.03)', 
                  color: paymentMethod === 'cash' ? '#fdba74' : '#94a3b8'
                }}
              >
                💵 Cash on Delivery
              </button>
            </div>

            <form id="checkout-form" onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {paymentMethod === 'chapa' && (
                <div style={{ padding: '1.1rem', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '0.75rem', border: '1px dashed rgba(168, 85, 247, 0.35)' }}>
                  <p style={{ fontSize: '0.88rem', color: '#e9d5ff', lineHeight: 1.5, margin: 0 }}>
                    You will be redirected to Chapa to complete your payment securely using <strong>Telebirr, CBE Birr, Awash, or Bank Cards</strong>.
                  </p>
                </div>
              )}
              
              {paymentMethod === 'cash' && (
                <div style={{ padding: '1.1rem', background: 'rgba(234, 88, 12, 0.08)', borderRadius: '0.75rem', border: '1px dashed rgba(234, 88, 12, 0.35)' }}>
                  <p style={{ fontSize: '0.88rem', color: '#fed7aa', lineHeight: 1.5, margin: 0 }}>
                    You will pay the delivery driver in cash upon arrival of your food.
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="btn-primary" 
                style={{ 
                  width: '100%',
                  marginTop: '1.25rem', 
                  padding: '1rem', 
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  opacity: isProcessing ? 0.7 : 1,
                  background: paymentMethod === 'cash' ? '#ea580c' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  boxShadow: paymentMethod === 'cash' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 4px 15px rgba(168, 85, 247, 0.3)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer'
                }}>
                {isProcessing ? 'Processing Order...' : paymentMethod === 'chapa' ? 'Pay with Chapa' : t('pay_btn').replace('{total}', cartTotal.toFixed(2))}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </main>
  );
}
