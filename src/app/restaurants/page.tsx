"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

export default function RestaurantsPage() {
  const { t } = useAppContext();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from backend, but provide fallback for smooth UI demo
    fetch('https://maraki-food-backend.onrender.com/api/restaurants')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else {
          throw new Error('API did not return an array');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch restaurants:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="section bg-surface" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="section-title">{t('explore_restaurants')}</h1>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>{t('loading_restaurants')}</p>
        ) : (
          <div className="grid grid-cols-3">
            {restaurants.map((restaurant: any) => (
              <Link href={`/restaurants/detail?id=${restaurant.id}`} key={restaurant.id}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                  {restaurant.image_url && (
                    <div style={{ width: '100%', height: '200px' }}>
                      <img src={restaurant.image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '2rem' }}>
                    <div className="card-icon" style={{ position: 'absolute', top: '1rem', right: '1rem', margin: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fbbf24' }}>
                       ⭐ {restaurant.rating}
                    </div>
                    <h3 className="card-title">{restaurant.name}</h3>
                    <p className="card-desc">{restaurant.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
