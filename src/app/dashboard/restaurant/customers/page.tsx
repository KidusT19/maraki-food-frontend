"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

interface CustomerData {
  id: number;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

export default function CustomersPage() {
  const { user, t } = useAppContext();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    fetch('https://maraki-food-backend.onrender.com/api/orders/restaurant/customers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>{t('customer_directory' as any) || 'Customer Directory'}</h2>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>{t('customer_directory_desc' as any) || 'A list of all customers who have ordered from your restaurant.'}</p>

      {customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('no_customers' as any) || 'No Customers Yet'}</h3>
          <p style={{ opacity: 0.7 }}>{t('when_users_order' as any) || 'When users place orders, they will appear here.'}</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{t('name' as any) || 'Name'}</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{t('email_th' as any) || 'Email'}</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{t('total_orders' as any) || 'Total Orders'}</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{t('total_spent' as any) || 'Total Spent'}</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{t('last_order_date' as any) || 'Last Order Date'}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{customer.name}</td>
                  <td style={{ padding: '1rem', opacity: 0.8 }}>{customer.email}</td>
                  <td style={{ padding: '1rem' }}>{customer.total_orders}</td>
                  <td style={{ padding: '1rem', color: '#10b981', fontWeight: 600 }}>
                    ${Number(customer.total_spent).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', opacity: 0.8 }}>
                    {new Date(customer.last_order_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
