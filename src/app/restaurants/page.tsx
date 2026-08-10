"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RestaurantsPage() {
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
        <h1 className="section-title">Explore Restaurants</h1>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading restaurants...</p>
        ) : (
          <div className="grid grid-cols-3">
            {restaurants.map((restaurant: any) => (
              <Link href={`/restaurants/detail?id=${restaurant.id}`} key={restaurant.id}>
                <div className="card">
                  <div className="card-icon">
                     ⭐ {restaurant.rating}
                  </div>
                  <h3 className="card-title">{restaurant.name}</h3>
                  <p className="card-desc">{restaurant.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
