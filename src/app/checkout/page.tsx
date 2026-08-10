"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user, cart, cartTotal, clearCart } = useAppContext();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe'>('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form states
  const [phone, setPhone] = useState('');
  const [cbeAccount, setCbeAccount] = useState('');
  
  // Delivery Info states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Manual Verification states
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

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
    setIsProcessing(true);

    // 1. Simulate Payment Processing Delay (2.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 2. Submit the order to the backend
    const restaurantId = cart[0]?.restaurant_id; // Assuming all items are from the same restaurant

    const formData = new FormData();
    formData.append('user_id', user?.id.toString() || '');
    formData.append('restaurant_id', restaurantId?.toString() || '0');
    formData.append('total_amount', cartTotal.toString());
    
    // Include the CBE account number in the transaction ID field if applicable
    const finalTransactionId = paymentMethod === 'cbe' 
      ? `CBE ${cbeAccount} ${transactionId ? '- ' + transactionId : ''}` 
      : transactionId;
      
    formData.append('transaction_id', finalTransactionId);
    
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }
    
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
        setPaymentSuccess(true);
        clearCart();
        
        // 3. Redirect to orders after showing success briefly
        setTimeout(() => {
          router.push('/orders');
        }, 1500);
      } else {
        alert("Failed to place order in database. Please try again.");
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
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Payment Successful!</h2>
          <p style={{ color: '#cbd5e1' }}>Your order has been sent to the restaurant.</p>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '1rem' }}>Redirecting to your orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section" style={{ paddingTop: '8rem', minHeight: '100vh', background: 'radial-gradient(circle at top center, #1e1b4b, #0f172a 50%, #020617 100%)', color: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link href="/restaurants" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>&larr; Back to Menu</Link>
        
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Order Summary */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '1.5rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h2>
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
              <span>Total to Pay:</span>
              <span style={{ color: 'var(--primary)' }}>{cartTotal.toFixed(2)} ETB</span>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Delivery Information</h3>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                Delivery Address (Building, Street, Area) *
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
                Contact Phone Number *
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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Payment Details</h2>
            
            {/* Payment Method Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <button 
                type="button"
                onClick={() => setPaymentMethod('telebirr')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid', borderColor: paymentMethod === 'telebirr' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', background: paymentMethod === 'telebirr' ? 'rgba(234, 88, 12, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                📱 Telebirr
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('cbe')}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid', borderColor: paymentMethod === 'cbe' ? '#a855f7' : 'rgba(255,255,255,0.1)', background: paymentMethod === 'cbe' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                CBE Bank
              </button>
            </div>

            <form id="checkout-form" onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {paymentMethod === 'telebirr' && (
                <>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Enter your Telebirr mobile number to begin.</p>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Phone Number
                    <input type="tel" placeholder="09XX XXX XXX" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                  </label>
                  
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Manual Verification</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>Please complete the transfer to <strong>0911XXXXXX</strong> and upload your receipt.</p>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      Transaction ID
                      <input type="text" placeholder="e.g. 7A8B9C" required value={transactionId} onChange={e => setTransactionId(e.target.value)} style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </label>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      Screenshot of Receipt
                      <input type="file" accept="image/*" required onChange={e => setReceiptFile(e.target.files?.[0] || null)} style={{ padding: '0.5rem 0', color: 'white' }} />
                    </label>
                  </div>
                </>
              )}



              {paymentMethod === 'cbe' && (
                <>
                  <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>CBE Bank Transfer</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>Please transfer the total amount to <strong>1000987654321</strong> (Maraki Food Zones) and provide your details below.</p>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      Your CBE Account Number (Must start with 1000)
                      <input type="text" pattern="^1000\d+$" placeholder="e.g. 1000123456789" required value={cbeAccount} onChange={e => setCbeAccount(e.target.value)} onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Account number must start with 1000')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </label>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      Transaction ID (Optional)
                      <input type="text" placeholder="e.g. FT23..." value={transactionId} onChange={e => setTransactionId(e.target.value)} style={{ padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
                    </label>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                      Screenshot of Receipt
                      <input type="file" accept="image/*" required onChange={e => setReceiptFile(e.target.files?.[0] || null)} style={{ padding: '0.5rem 0', color: 'white' }} />
                    </label>
                  </div>
                </>
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
                  background: paymentMethod === 'telebirr' ? '#ea580c' : '#a855f7'
                }}>
                {isProcessing ? 'Processing Payment...' : `Pay ${cartTotal.toFixed(2)} ETB`}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </main>
  );
}
