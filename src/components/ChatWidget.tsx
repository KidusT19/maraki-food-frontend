"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppContext } from '@/context/AppContext';

export default function ChatWidget() {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect socket
  useEffect(() => {
    if (!user || (user.role !== 'restaurant' && user.role !== 'driver')) return;

    const token = localStorage.getItem('token');
    const newSocket = io('https://maraki-food-backend.onrender.com', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // Since we fetch all messages for active contact, just append
        // Ideally we only append if msg belongs to activeContact, but for MVP it's okay.
        return [...prev, msg];
      });
      if (String(msg.sender_id) !== String(user.id)) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    setSocket(newSocket);

    // Fetch contacts
    fetch('https://maraki-food-backend.onrender.com/api/chat/contacts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setContacts(data || []))
      .catch(console.error);

    // Fetch initial unread count
    fetchUnreadCount(token);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchUnreadCount = async (token: string) => {
    try {
      const res = await fetch('https://maraki-food-backend.onrender.com/api/chat/unread', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && typeof data.unread === 'number') {
        setUnreadCount(data.unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // We don't reset unread count to 0 completely, just rely on fetching
  // But for immediate feedback if they close without opening a chat
  useEffect(() => {
    if (isOpen) {
      // It's possible we shouldn't reset it until they select a contact, 
      // but if we do, the badge disappears immediately upon opening
      // Let's leave it as is, and it will re-fetch accurately when they click a contact.
    }
  }, [isOpen]);

  // We can remove the old useEffects that blindly set unreadCount to 0


  const loadHistory = async (contact: any) => {
    setActiveContact(contact);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://maraki-food-backend.onrender.com/api/chat/history/${contact.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data || []);
      
      // Update unread count after history is fetched (which marks them as read)
      if (token) fetchUnreadCount(token);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || !socket) return;

    const msgData = {
      receiver_id: activeContact.id,
      message: newMessage.trim()
    };

    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  if (!user || (user.role !== 'restaurant' && user.role !== 'driver')) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--primary)', color: '#fff', border: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
            fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-5px',
              background: '#ef4444', color: '#fff', fontSize: '0.8rem',
              width: '24px', height: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', border: '2px solid #0f172a'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '700px', height: '500px', maxWidth: '90vw', maxHeight: '80vh',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'flex', overflow: 'hidden'
        }}>
          
          {/* Left Sidebar - Contacts */}
          <div style={{ width: '250px', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Chats</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {contacts.length === 0 ? (
                <p style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>No contacts yet.</p>
              ) : (
                contacts.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => loadHistory(c)}
                    style={{
                      padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer', background: activeContact?.id === c.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <p style={{ margin: 0, color: '#f8fafc', fontWeight: 600 }}>{c.name}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>{c.role}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area - Chat Room */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
            
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f8fafc' }}>
                {activeContact ? activeContact.name : 'Select a contact'}
              </h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!activeContact ? (
                <div style={{ margin: 'auto', color: '#64748b' }}>Select someone from the list to start chatting.</div>
              ) : messages.length === 0 ? (
                <div style={{ margin: 'auto', color: '#64748b' }}>No messages yet. Say hi!</div>
              ) : (
                messages.filter(m => m.sender_id === activeContact.id || m.receiver_id === activeContact.id).map((msg, idx) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={idx} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.message}</p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            {activeContact && (
              <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none'
                  }}
                />
                <button type="submit" style={{
                  background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%',
                  width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
                  ➤
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
