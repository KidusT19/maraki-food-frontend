"use client";

import { useState } from 'react';

export default function RestaurantDrivers() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/auth/register-driver', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully created driver account for ${data.name}!`);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg(data.error || "Failed to create driver");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create driver due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>Driver Management</h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Create login credentials for your delivery drivers.</p>
      </div>

      <div style={{ maxWidth: '500px', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>Register New Driver</h3>
        
        {successMsg && <div style={{ backgroundColor: '#10b98122', color: '#10b981', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{successMsg}</div>}
        {errorMsg && <div style={{ backgroundColor: '#ef444422', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{errorMsg}</div>}

        <form onSubmit={handleCreateDriver} autoComplete="off" style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Driver Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              required
              autoComplete="off"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              required
              autoComplete="off"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              required
              autoComplete="new-password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              minLength={6}
            />
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Share these credentials with the driver so they can log into the Driver Portal.</p>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating...' : 'Create Driver Account'}
          </button>
        </form>
      </div>
    </>
  );
}
