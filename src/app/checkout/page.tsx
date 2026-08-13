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
        body: formData // Fetch automatically sets the correct multipart boundary header
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #064e3b, #0f172a 60%)', color: '#fff' }}>
        <div style={{ textAlign: 'center', animation: 'fade-in-up 0.5s ease-out' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('payment_successful')}</h2>
          <p style={{ color: '#cbd5e1' }}>{t('order_sent')}</p>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '1rem' }}>{t('redirecting')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'radial-gradient(circle at top center, #1e1b4b, #0f172a 50%, #020617 100%)', color: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link href="/restaurants" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>&larr; {t('back_to_menu')}</Link>
        
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Order Summary */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>{t('order_summary')}</h2>
            <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
              {cart.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: 0.9 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name}
                  </div>
                  <span style={{ fontWeight: 600 }}>{(parseFloat(item.price) * item.quantity).toFixed(2)} ETB</span>
                </li>
              ))}
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <span>{t('total_to_pay')}:</span>
              <span style={{ color: 'var(--primary)' }}>{cartTotal.toFixed(2)} ETB</span>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>{t('delivery_information')}</h3>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                {t('delivery_address')}
                <input 
                  type="text" 
                  placeholder="e.g. Bole Atlas, behind Desalegn Hotel" 
                  required 
                  value={deliveryAddress} 
                  onChange={e => setDeliveryAddress(e.target.value)} 
                  form="checkout-form"
                  style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                />
              </label>
              
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                {t('contact_phone')}
                <input 
                  type="tel" 
                  placeholder="09XX XXX XXX" 
                  required 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                  form="checkout-form"
                  style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
                />
              </label>
            </div>
          </div>

          {/* Right Column: Payment Details */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>{t('payment_details')}</h2>
            
            {/* Payment Method Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <button 
                type="button"
                onClick={() => setPaymentMethod('chapa')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid', borderColor: paymentMethod === 'chapa' ? '#a855f7' : 'rgba(255,255,255,0.1)', background: paymentMethod === 'chapa' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                💳 Pay with Chapa
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid', borderColor: paymentMethod === 'cash' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', background: paymentMethod === 'cash' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                💵 Cash on Delivery
              </button>
            </div>

            <form id="checkout-form" onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {paymentMethod === 'chapa' && (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>You will be redirected to Chapa to complete your payment securely using Telebirr, CBE Birr, or a Bank Card.</p>
                </div>
              )}
              {paymentMethod === 'cash' && (
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>You will pay the driver in cash when your food arrives.</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="btn-primary" 
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  fontSize: '1.1rem',
                  opacity: isProcessing ? 0.7 : 1,
                  background: paymentMethod === 'cash' ? '#ea580c' : '#a855f7'
                }}>
                {isProcessing ? 'Processing...' : paymentMethod === 'chapa' ? 'Pay with Chapa' : t('pay_btn').replace('{total}', cartTotal.toFixed(2))}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </main>
  );
}
