import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConnectionModal, setShowConnectionModal] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CB';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" className="logo-img" alt="CallBridge" />
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/calls" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Calls
          </NavLink>
          <NavLink to="/dashboard/sms" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SMS
          </NavLink>
          <NavLink to="/dashboard/devices" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Devices
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavLink>
          <NavLink to="/dashboard/activity" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Activity logs
          </NavLink>
          <NavLink to="/dashboard/support" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 0A4 4 0 118.05 8.05m6.778 1.122l3.536 3.536m-10.606 0L4.22 9.172m0 0a4 4 0 105.656 5.656l3.536-3.536M9.172 4.22L12.7 7.75" />
            </svg>
            Support
          </NavLink>
          <NavLink to="/dashboard/policy" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Platform policy
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {getInitials(user?.full_name)}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'CallBridge User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="sidebar-btn-logout" onClick={handleLogout}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="dashboard-main" style={{ position: 'relative' }}>
        {/* Floating Quick Action Button inside dashboard */}
        <button
          className="btn-primary"
          style={{ position: 'absolute', top: '40px', right: '40px', maxWidth: '160px', zIndex: 90 }}
          onClick={() => setShowConnectionModal(true)}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Link Device
        </button>

        {/* Viewport for nested routes */}
        <div style={{ marginTop: '20px' }}>
          <Outlet />
        </div>
      </main>

      {/* Download App / Connection Modal */}
      {showConnectionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 26, 44, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setShowConnectionModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '460px',
            padding: '36px',
            position: 'relative',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Close Cross */}
            <button
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                fontSize: '24px',
                fontWeight: 600,
                cursor: 'pointer',
                lineHeight: 1
              }}
              onClick={() => setShowConnectionModal(false)}
            >
              &times;
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>Download the App.</h3>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>Start Monitoring Today.</h3>
              </div>

              {/* QR Code Graphic Mockup */}
              <div style={{ border: '1.5px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                <svg viewBox="0 0 100 100" style={{ width: '120px', height: '120px' }}>
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="25" height="25" fill="var(--primary)" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="var(--primary)" />
                  
                  <rect x="65" y="10" width="25" height="25" fill="var(--primary)" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="var(--primary)" />

                  <rect x="10" y="65" width="25" height="25" fill="var(--primary)" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="var(--primary)" />

                  <rect x="45" y="45" width="10" height="10" fill="var(--primary)" />
                  <rect x="55" y="65" width="10" height="20" fill="var(--primary)" />
                  <rect x="75" y="75" width="15" height="15" fill="var(--primary)" />
                  <rect x="40" y="75" width="15" height="10" fill="var(--primary)" />
                  <rect x="70" y="45" width="10" height="15" fill="var(--primary)" />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', width: '100%', fontSize: '13px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>1</span>
                  <span>Scan the QR code or click <Link to="/android" style={{ color: 'var(--accent)', fontWeight: 700 }} onClick={() => setShowConnectionModal(false)}>here</Link> to download the APK.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>2</span>
                  <span>Install APK and login using your dashboard credentials.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>3</span>
                  <span>Authorize telemetry background syncing permissions on the app.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;