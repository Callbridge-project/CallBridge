import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Preview: React.FC = () => {
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
              Dashboard Preview
            </span>
          </div>
          <h1 className="policy-title">Web Console Interface</h1>
          <p className="policy-subtitle">
            Take a look at how real-time device call activity logs and active connections are organized in the main console.
          </p>

          <div style={{ marginTop: '30px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>CallBridge Admin Panel</div>
              <span className="badge-dot" style={{ backgroundColor: '#10b981', width: '10px', height: '10px' }}></span>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="policy-grid" style={{ margin: 0 }}>
                <div className="policy-subcard" style={{ backgroundColor: 'white' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Phones</h4>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>Samsung S24 Ultra</div>
                  <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Sync Status: Active</span>
                </div>
                <div className="policy-subcard" style={{ backgroundColor: 'white' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Metadata Sync</h4>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>12,450 logs</div>
                  <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Sync Speed: 12ms latency</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>Real-Time Activity Telemetry Stream</h4>
                {/* SVG representing a detailed telemetry graph */}
                <svg viewBox="0 0 400 120" style={{ width: '100%', height: 'auto', backgroundColor: '#fafafa', borderRadius: 'var(--radius-sm)' }}>
                  <path d="M 0,100 Q 50,60 100,80 T 200,30 T 300,70 T 400,20 L 400,120 L 0,120 Z" fill="rgba(44, 107, 237, 0.08)" />
                  <path d="M 0,100 Q 50,60 100,80 T 200,30 T 300,70 T 400,20" fill="none" stroke="var(--accent)" strokeWidth="3" />
                  <circle cx="200" cy="30" r="5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                  <circle cx="300" cy="70" r="5" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
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

export default Preview;
