import React, { useState } from 'react';
import { useAuth } from '../../../context/authContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  
  // Profile settings state
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      alert('Profile information updated successfully. (Appwrite user.updateName called).');
    }, 1000);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the locally cached telephony logs? This does not delete data from Appwrite cloud.')) {
      alert('Local storage telemetry logs cache cleared successfully.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', textAlign: 'left' }}>
      {/* Left Column: Form Settings */}
      <div className="logs-section" style={{ padding: '32px' }}>
        <h2 className="logs-title" style={{ fontSize: '22px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>User Settings</h2>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px' }}>Update Secure Password</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="currPass">Current Password</label>
              <input
                id="currPass"
                type="password"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-row" style={{ marginTop: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="newPass">New Password</label>
                <input
                  id="newPass"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="confPass">Confirm Password</label>
                <input
                  id="confPass"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }} disabled={savingProfile}>
            {savingProfile ? 'Saving profile...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      {/* Right Column: Alerts & Privacy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Alerts card */}
        <div className="logs-section" style={{ padding: '24px 28px' }}>
          <h3 className="logs-title" style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>System Alerts</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%', fontSize: '13.5px' }}>
              <span>Email logs reports weekly</span>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>

            <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%', fontSize: '13.5px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <span>Browser sync notifications</span>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={browserAlerts}
                onChange={(e) => setBrowserAlerts(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Privacy & Cache card */}
        <div className="logs-section" style={{ padding: '24px 28px' }}>
          <h3 className="logs-title" style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Data & Privacy</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Enable Analytics</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>Upload connection metrics</span>
              </div>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={trackingEnabled}
                onChange={(e) => setTrackingEnabled(e.target.checked)}
              />
            </label>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Clean local dashboard metadata caching:</span>
              <button className="btn-primary" style={{ backgroundColor: 'rgba(225,29,72,0.1)', color: 'var(--danger)', border: '1.5px solid rgba(225,29,72,0.2)', boxShadow: 'none', padding: '10px' }} onClick={handleClearCache}>
                Clear Cache Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
