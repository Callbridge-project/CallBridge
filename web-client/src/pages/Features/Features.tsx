import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const Features: React.FC = () => {
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
              System Features
            </span>
          </div>
          <h1 className="policy-title">Telephony Synchronizer Capabilities</h1>
          <p className="policy-subtitle">
            CallBridge offers a full-featured real-time bridge connecting Android telephony metadata to active web dashboard consoles.
          </p>

          <div className="policy-content" style={{ marginTop: '30px' }}>
            <div className="policy-grid">
              <div className="policy-subcard">
                <div className="policy-subcard-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="policy-subcard-title">Real-Time Call Logging</h3>
                <p className="policy-subcard-text">
                  Automatically sync incoming and outgoing call statuses, duration, caller details, and event time records immediately.
                </p>
              </div>

              <div className="policy-subcard">
                <div className="policy-subcard-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="policy-subcard-title">SMS Metadata Sync</h3>
                <p className="policy-subcard-text">
                  Safely capture text message status alerts, sender names, and metadata indices for instant status tracking.
                </p>
              </div>

              <div className="policy-subcard">
                <div className="policy-subcard-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="policy-subcard-title">Device Health Status</h3>
                <p className="policy-subcard-text">
                  Stream Android diagnostic telemetry including battery stats, cell network strengths, active brand, and connection status.
                </p>
              </div>

              <div className="policy-subcard">
                <div className="policy-subcard-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="policy-subcard-title">Military-Grade Tunneling</h3>
                <p className="policy-subcard-text">
                  Protect and encrypt all telemetry data packages end-to-end with 256-bit AES protection and TLS SSL handshakes.
                </p>
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

export default Features;
