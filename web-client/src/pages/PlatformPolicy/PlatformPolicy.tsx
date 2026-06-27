import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const PlatformPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      {/* Header */}
      <header className="policy-header" style={{ justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '6%' }} onClick={() => navigate(-1)}>
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          Platform Policy
        </div>
      </header>

      {/* Main Container */}
      <main className="policy-container">
        <div className="policy-card">
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="policy-badge" style={{ color: 'var(--accent)', background: 'var(--accent-light)', border: 'none' }}>
              Official Documentation
            </span>
          </div>
          <h1 className="policy-title">User Agreements & Privacy Standards</h1>
          <p className="policy-subtitle">
            Transparency and security are the cornerstones of our architecture. At CallBridge, we maintain rigorous standards to ensure your telephony monitoring remains safe, private, and compliant.
          </p>

          <div className="policy-content">
            {/* Section 1 */}
            <section className="policy-section">
              <h2 className="policy-section-title">1. Introduction</h2>
              <p className="policy-section-text">
                Welcome to <strong>CallBridge</strong>. This document outlines our unwavering commitment to providing secure telephony monitoring and bridging solutions. By accessing our platform, you agree to these fundamental standards designed to protect all stakeholders.
              </p>
              <p className="policy-section-text">
                Our mission is to provide enterprise-grade connectivity through fluid crystal clarity. We believe that professional telephony monitoring should be accessible without compromising the integrity of the data being transmitted.
              </p>
            </section>

            {/* Section 2 */}
            <section className="policy-section">
              <h2 className="policy-section-title">2. Data Usage & Synchronization</h2>
              <p className="policy-section-text">
                <strong>CallBridge</strong> facilitates the seamless bridging of voice calls and SMS data. This synchronization occurs in real-time, utilizing our proprietary low-latency cloud infrastructure.
              </p>
              <ul className="policy-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '4px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                  </svg>
                  <span>Real-time metadata capture for operational analysis.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '4px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Temporary storage of session logs for diagnostic purposes, retained for no longer than 30 days.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <svg style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '4px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span>Encrypted synchronization across authorized administrative dashboards.</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="policy-section">
              <h2 className="policy-section-title">3. User Responsibility</h2>
              <p className="policy-section-text">
                Integrity is vital to the <strong>CallBridge</strong> ecosystem. Users are strictly required to verify ownership or explicit authorization for any device integrated into our platform.
              </p>
              <div className="policy-callout" style={{ backgroundColor: '#f0f4f8', borderLeft: '4px solid var(--accent)', color: 'var(--primary)', fontWeight: 500 }}>
                "The platform must not be used for unauthorized surveillance. It is the sole responsibility of the account holder to ensure that the monitoring of telephony data complies with local and international jurisdictional laws."
              </div>
            </section>

            {/* Section 4 */}
            <section className="policy-section">
              <h2 className="policy-section-title">4. Privacy Architecture</h2>
              
              <div className="policy-grid">
                <div className="policy-subcard">
                  <div className="policy-subcard-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="policy-subcard-title">End-to-End Encryption</h3>
                  <p className="policy-subcard-text">
                    All packets transmitted via CallBridge are shielded using military-grade AES-256 encryption, ensuring no mid-flight interception.
                  </p>
                </div>

                <div className="policy-subcard">
                  <div className="policy-subcard-icon">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="policy-subcard-title">Zero-Knowledge Storage</h3>
                  <p className="policy-subcard-text">
                    Our cloud infrastructure is designed so that even our administrators cannot access the content of bridged communications.
                  </p>
                </div>
              </div>

              <p className="policy-section-text">
                Our Fluid Crystal design philosophy extends to our back-end: clear, structured, and impenetrable. We maintain physical and logical separation of data sets to prevent cross-contamination of user information.
              </p>
            </section>

            {/* Section 5 */}
            <section className="policy-section">
              <h2 className="policy-section-title">5. Consent</h2>
              <p className="policy-section-text">
                By utilizing the <strong>CallBridge</strong> platform, you provide explicit consent for the processing of telephony data as described herein. You acknowledge that your interaction with the service constitutes a binding agreement to adhere to these standards.
              </p>
              <p className="policy-section-text">
                We reserve the right to update these terms to reflect evolving regulatory landscapes. Significant changes will be communicated via the platform's primary administrative dashboard.
              </p>
            </section>

            {/* Last Updated Row inside card */}
            <div className="policy-footer-row">
              <div className="policy-footer-left">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Last Updated: October 24, 2024</span>
              </div>
              <div className="policy-footer-right">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4a2 2 0 002-2m-2 4a2 2 0 002 2m-5-4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 113 3v1" />
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
              © 2024 CallBridge Platform. All rights reserved.
            </span>
          </div>
          <div className="footer-links">
            <Link to="/policy" className="footer-link">Terms & Privacy Policy</Link>
            <a href="#support" className="footer-link">Support</a>
          </div>
          <div className="footer-socials">
            <a href="#share" className="footer-icon-circle" onClick={(e) => { e.preventDefault(); alert('Sharing link copied to clipboard!'); }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.028-2.514m0 5.544l-5.028-2.514M18 8a3 3 0 100-6 3 3 0 000 6zm-12 6a3 3 0 100-6 3 3 0 000 6zm12 6a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </a>
            <a href="#support" className="footer-icon-circle">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PlatformPolicy;