"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

function RestaurantDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use global context instead of local state
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, user } = useAppContext();

  useEffect(() => {
    if (!id) return;
    fetch(`https://maraki-food-backend.onrender.com/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.name) {
          setRestaurant(data);
        } else {
          throw new Error('Not found');
        }
      })
      .catch(err => {
        console.error('Failed to fetch menu:', err);
      });
      
    fetch(`https://maraki-food-backend.onrender.com/api/restaurants/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (!user) {
      alert("Please log in to place an order.");
      router.push('/login');
      return;
    }
    
    // Redirect to the dedicated checkout page
    router.push('/checkout');
  };

  if (!restaurant) return <div style={{ paddingTop: '10rem', textAlign: 'center' }}>Loading menu...</div>;

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #0f172a, #1e293b)' }}></div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f172a, transparent)' }}></div>
        <div className="container" style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{restaurant.name}</h1>
          {restaurant.description && (
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '800px', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>{restaurant.description}</p>
          )}
        </div>
      </div>
      
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Menu</h2>
          <input 
            type="text" 
            placeholder="Search for a dish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', minWidth: '250px' }}
          />
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {restaurant.menu_items?.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
            <div className="card" key={item.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: (item.is_available === 0 || item.is_available === false) ? 0.6 : 1, overflow: 'hidden' }}>
              {item.image_url && (
                <div style={{ margin: '-1.5rem -1.5rem 1.5rem -1.5rem', height: '200px', overflow: 'hidden' }}>
                  <img 
                    src={item.image_url.startsWith('/uploads') ? `https://maraki-food-backend.onrender.com${item.image_url}` : item.image_url} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="card-title">{item.name}</h3>
                  {(item.is_available === 0 || item.is_available === false) && (
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Sold Out
                    </span>
                  )}
                </div>
                <p className="card-desc" style={{ marginBottom: '1.5rem' }}>{item.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{item.price} ETB</span>
                <button 
                  className="btn-primary" 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.9rem',
                    opacity: (item.is_available === 0 || item.is_available === false) ? 0.5 : 1,
                    cursor: (item.is_available === 0 || item.is_available === false) ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={() => {
                    if (item.is_available === 0 || item.is_available === false) return;
                    if (!user) {
                      alert("Please log in to start ordering food.");
                      router.push('/login');
                      return;
                    }
                    addToCart({ ...item, quantity: 1, restaurant_id: restaurant.id })
                  }}
                  disabled={item.is_available === 0 || item.is_available === false}
                >
                  {(item.is_available === 0 || item.is_available === false) ? 'Unavailable' : 'Add to Order'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews Section */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '3rem 0 1.5rem 0' }}>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p style={{ opacity: 0.8 }}>No reviews yet. Order and be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{review.user_name}</span>
                  <span style={{ color: '#eab308', fontSize: '1.2rem', letterSpacing: '2px' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>"{review.comment}"</p>}
                <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Basic Cart UI */}
        {cart.length > 0 && (
          <div className="glass animate-fade-in-up" style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1.5rem', borderRadius: '1.5rem', width: '320px', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.2rem' }}>Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h3>
            <ul style={{ listStyle: 'none', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
              {cart.map((c, i) => (
                <li key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem', opacity: 0.9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontWeight: 600 }}>{(parseFloat(c.price) * c.quantity).toFixed(2)} ETB</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '2rem', background: 'var(--surface)' }}>
                      <button onClick={() => updateQuantity(c.id, -1)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>-</button>
                      <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '1rem', fontWeight: 600 }}>{c.quantity}</span>
                      <button onClick={() => updateQuantity(c.id, 1)} style={{ background: 'none', border: 'none', color: 'var(--foreground)', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.25rem', fontSize: '1.1rem' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>{cartTotal.toFixed(2)} ETB</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleCheckout}>
              {user ? 'Proceed to Checkout' : 'Log in to Checkout'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RestaurantDetailPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '10rem', textAlign: 'center' }}>Loading...</div>}>
      <RestaurantDetailContent />
    </Suspense>
  );
}
