"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function MenuManager() {
  const { user, t } = useAppContext();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (user?.restaurant_id) {
      fetch(`https://maraki-food-backend.onrender.com/api/restaurants/${user.restaurant_id}`)
        .then(res => res.json())
        .then(data => {
          setRestaurant(data);
          setLoading(false);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/menu_items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRestaurant({
          ...restaurant,
          menu_items: restaurant.menu_items.filter((item: any) => item.id !== id)
        });
      } else {
        alert("Failed to delete item");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', item.name);
    formData.append('description', item.description);
    formData.append('price', item.price);
    formData.append('is_available', (item.is_available === 1 || item.is_available === true) ? 'false' : 'true');

    try {
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/menu_items/${item.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setRestaurant({
          ...restaurant,
          menu_items: restaurant.menu_items.map((m: any) => m.id === item.id ? updatedItem : m)
        });
      } else {
        alert("Failed to update availability");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setImage(null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (image) formData.append('image', image);

    try {
      const url = editingId 
        ? `https://maraki-food-backend.onrender.com/api/menu_items/${editingId}`
        : 'https://maraki-food-backend.onrender.com/api/menu_items';
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const savedItem = await res.json();
        setRestaurant({
          ...restaurant,
          menu_items: editingId 
            ? restaurant.menu_items.map((m: any) => m.id === editingId ? savedItem : m)
            : [...restaurant.menu_items, savedItem]
        });
        handleCancelForm();
      } else {
        alert("Failed to save item");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading menu...</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ color: '#f8fafc', margin: 0 }}>{t('menu_manager' as any) || 'Menu Manager'}</h1>
        <button className="btn-primary" onClick={isAdding ? handleCancelForm : () => setIsAdding(true)}>
          {isAdding ? (t('cancel' as any) || 'Cancel') : (t('add_dish' as any) || '+ Add New Dish')}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>{editingId ? (t('edit_dish' as any) || 'Edit Dish') : (t('add_dish' as any) || 'Add New Dish')}</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input type="text" placeholder={t('dish_name' as any) || 'Dish Name'} className="input-field" required value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder={t('description' as any) || 'Description'} className="input-field" required value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: '100px' }} />
            <input type="number" placeholder={t('price_etb' as any) || 'Price (ETB)'} className="input-field" required value={price} onChange={e => setPrice(e.target.value)} />
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                {editingId ? (t('upload_new_image' as any) || 'Upload new image (optional)') : (t('upload_image' as any) || 'Upload image (optional)')}
              </p>
              <input type="file" accept="image/*" className="input-field" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} />
            </div>
            <button type="submit" className="btn-primary">{editingId ? (t('save_changes' as any) || 'Save Changes') : (t('save_dish' as any) || 'Save Dish')}</button>
          </div>
        </form>
      )}

      {restaurant?.menu_items?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p>{t('no_items_menu' as any) || 'No items in your menu yet.'}</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {restaurant?.menu_items?.map((item: any) => (
            <div key={item.id} style={{ 
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {item.image_url ? (
                 <img src={`https://maraki-food-backend.onrender.com${item.image_url}`} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                 <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
              )}
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{item.price} ETB</span>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                  {item.description}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleToggleAvailability(item)} 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: (item.is_available === 1 || item.is_available === true) ? 'rgba(234, 88, 12, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                      color: (item.is_available === 1 || item.is_available === true) ? '#fb923c' : '#34d399', 
                      border: `1px solid ${(item.is_available === 1 || item.is_available === true) ? 'rgba(234, 88, 12, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer', 
                      fontWeight: 'bold' 
                    }}
                  >
                    {(item.is_available === 1 || item.is_available === true) ? (t('mark_sold_out' as any) || 'Mark Sold Out') : (t('mark_available' as any) || 'Mark Available')}
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditClick(item)} style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>
                      {t('edit' as any) || 'Edit'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>
                      {t('delete' as any) || 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
