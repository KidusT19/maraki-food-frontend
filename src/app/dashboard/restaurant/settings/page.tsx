"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function RestaurantSettings() {
  const { user, setUser } = useAppContext();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setNewName(user.name);
      if (user.email) setNewEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
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
        alert("Profile updated successfully");
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
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>Settings</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Manage your account security.</p>
      </div>

      <div style={{ maxWidth: '500px', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>Update Profile</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Account Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              required
              value={newEmail} 
              onChange={e => setNewEmail(e.target.value)} 
            />
          </div>

          <div style={{ margin: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>New Password (Optional)</label>
            <input 
              type="password" 
              className="input-field" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              minLength={6}
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
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
}
