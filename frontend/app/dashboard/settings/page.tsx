'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: profile
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new_password !== password.new_password_confirmation) {
        setMessage({ type: 'error', text: 'New password confirmation does not match' });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiRequest('/auth/password', {
        method: 'PUT',
        body: password
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPassword({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Account Settings</h1>

      {message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontWeight: 500
        }}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Profile Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            Save Profile
          </button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Change Password</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Current Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password.current_password}
              onChange={e => setPassword({ ...password, current_password: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">New Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password.new_password}
              onChange={e => setPassword({ ...password, new_password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Confirm New Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password.new_password_confirmation}
              onChange={e => setPassword({ ...password, new_password_confirmation: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
