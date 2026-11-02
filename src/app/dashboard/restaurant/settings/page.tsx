"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function RestaurantSettings() {
  const { user, setUser, t } = useAppContext();
  
  // Restaurant Profile state
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDesc, setRestaurantDesc] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [restLoading, setRestLoading] = useState(false);
  const [restSuccess, setRestSuccess] = useState('');

  // Account Security state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');

  // Fetch restaurant details
  useEffect(() => {
    if (user?.restaurant_id) {
      fetch(`https://maraki-food-backend.onrender.com/api/restaurants/${user.restaurant_id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setRestaurantName(data.name || '');
            setRestaurantDesc(data.description || '');
            setCurrentImage(data.image_url || '');
          }
        })
        .catch(err => console.error("Error fetching restaurant:", err));
    }
  }, [user]);

  // Pre-fill user profile info
  useEffect(() => {
    if (user) {
      if (user.name) setNewName(user.name);
      if (user.email) setNewEmail(user.email);
    }
  }, [user]);

  // Handle Restaurant Info Update (Rename, Description, Image)
  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurant_id) return;

    setRestLoading(true);
    setRestSuccess('');
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('name', restaurantName);
      formData.append('description', restaurantDesc);
      if (newImage) {
        formData.append('image', newImage);
      }

      const res = await fetch(`https://maraki-food-backend.onrender.com/api/restaurants/${user.restaurant_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setRestSuccess('Restaurant details updated successfully!');
        if (data.image_url) {
          setCurrentImage(data.image_url);
        }
        setNewImage(null);
      } else {
        alert(data.error || 'Failed to update restaurant details');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update restaurant details');
    } finally {
      setRestLoading(false);
    }
  };

  // Handle User Credentials Update
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setUserLoading(true);
    setUserSuccess('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          newName: newName !== user?.name ? newName : undefined, 
          newEmail: newEmail !== user?.email ? newEmail : undefined,
          newPassword: newPassword ? newPassword : undefined 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUserSuccess("Admin profile updated successfully!");
        setNewPassword('');
        setConfirmPassword('');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>{t('settings' as any) || 'Restaurant Settings'}</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Manage your restaurant details, branding, and account security.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', maxWidth: '1000px' }}>
        
        {/* 1. Restaurant Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>🏪 Restaurant Details</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Change your restaurant name, description, and cover photo.</p>

          {restSuccess && (
            <div style={{ backgroundColor: '#10b98122', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              ✓ {restSuccess}
            </div>
          )}

          <form onSubmit={handleRestaurantSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                Restaurant Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                required
                value={restaurantName} 
                onChange={e => setRestaurantName(e.target.value)} 
                placeholder="e.g. Sheger Vegan"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                Description
              </label>
              <textarea 
                className="input-field" 
                rows={3}
                value={restaurantDesc} 
                onChange={e => setRestaurantDesc(e.target.value)} 
                placeholder="Short bio or description of your restaurant..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                Restaurant Cover Image
              </label>
              {currentImage && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <img 
                    src={currentImage} 
                    alt="Restaurant Cover" 
                    style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setNewImage(e.target.files[0]);
                  }
                }} 
                style={{ color: '#94a3b8', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={restLoading} style={{ marginTop: '0.5rem' }}>
              {restLoading ? 'Saving Changes...' : 'Save Restaurant Details'}
            </button>
          </form>
        </div>

        {/* 2. Admin Security & Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>🔐 Admin Account & Security</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Update your login email and password.</p>

          {userSuccess && (
            <div style={{ backgroundColor: '#10b98122', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              ✓ {userSuccess}
            </div>
          )}

          <form onSubmit={handleUserSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Account Name</label>
              <input 
                type="text" 
                className="input-field" 
                required
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Login Email</label>
              <input 
                type="email" 
                className="input-field" 
                required
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
              />
            </div>

            <div style={{ margin: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>New Password (Optional)</label>
              <input 
                type="password" 
                className="input-field" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                minLength={6}
                placeholder="Leave blank to keep same"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Confirm New Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                minLength={6}
                placeholder="Confirm password"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={userLoading} style={{ marginTop: '0.5rem' }}>
              {userLoading ? 'Updating Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
