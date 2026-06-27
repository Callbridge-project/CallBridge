import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Android: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      {/* Header */}
      <header className="auth-header" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
        <Link to="/" className="logo">
          <img src="/logo.png" className="logo-img" alt="CallBridge" />
        </Link>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </header>

      {/* Main Container */}
      <main className="policy-container" style={{ maxWidth: '900px' }}>
        <div className="policy-card">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="policy-badge" style={{ color: 'var(--accent)', background: 'var(--accent-light)', border: 'none' }}>
              Android Integration
            </span>
          </div>
          <h1 className="policy-title">CallBridge Android Client</h1>
          <p className="policy-subtitle">
            Download the Android background client application to automatically bridge telephony events to your dashboard.
          </p>

          <div className="policy-content" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'var(--bg-main)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>Download CallBridge Mobile Client</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '400px' }}>
                  Stable APK build (v1.0.4) for Android 8.0 Oreo and above. Supports light-weight background services.
                </p>
              </div>
              <button className="btn-primary" style={{ maxWidth: '240px' }} onClick={() => alert('APK download will start in a simulated background task.')}>
                Download APK File
              </button>
            </div>

            <section className="policy-section" style={{ marginTop: '24px' }}>
              <h2 className="policy-section-title">Setup Instructions</h2>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <li>Download and install the APK on your target Android hardware.</li>
                <li>Ensure you have enabled <strong>Unknown Sources</strong> installation in your Android settings.</li>
                <li>Launch the app and enter your CallBridge web dashboard credentials to link the device.</li>
                <li>Grant standard phone state permissions, SMS state permissions, and background activity permissions so metadata can sync in real-time.</li>
              </ol>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="logo">
              <img src="/logo.png" className="logo-img" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} alt="CallBridge" />
            </span>
            <span className="footer-brand" style={{ color: '#a3b3cc' }}>
              © 2024 CallBridge. All rights reserved.
            </span>
          </div>
          <div className="footer-links">
            <Link to="/policy" className="footer-link">Privacy Policy</Link>
            <a href="#terms" className="footer-link">Terms of Service</a>
            <a href="#support" className="footer-link">Support Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Android;
