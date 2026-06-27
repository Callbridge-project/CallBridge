import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export const Signup: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeDeviceBrand, setActiveDeviceBrand] = useState('Samsung');
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Frontend Validations
    if (!fullName || !email || !password || !confirmPassword) {
      setValidationError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Password and Confirm Password must match exactly.');
      return;
    }

    if (!agreeToPolicy) {
      setValidationError('You must agree to the Terms & Privacy Policy to create an account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const brand = activeDeviceBrand !== 'None' ? activeDeviceBrand : undefined;
      await register(fullName, email, password, brand);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <header className="auth-header">
        <Link to="/" className="logo">
          <img src="/logo.png" className="logo-img" alt="CallBridge" />
        </Link>
        <nav className="nav-links">
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/preview" className="nav-link" onClick={(e) => e.preventDefault()}>Dashboard Preview</Link>
          <Link to="/android" className="nav-link" onClick={(e) => e.preventDefault()}>Android</Link>
          <Link to="/contact" className="nav-link" onClick={(e) => e.preventDefault()}>Contact</Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/login" className="nav-link" style={{ fontWeight: 700 }}>Login</Link>
          <Link to="/signup" className="nav-btn solid">Sign Up</Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="auth-container">
        {/* Left Hero Column */}
        <section className="auth-hero">
          <span className="hero-tag" style={{ color: 'var(--accent)', background: 'var(--accent-light)', border: 'none' }}>
            Real-Time Telephony Platform
          </span>
          <h1 className="hero-title">
            Create Your <br />
            CallBridge Account
          </h1>
          <p className="hero-description">
            Securely synchronize your Android call logs, SMS activity, and device monitoring data with your personalized web dashboard.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span>Real-time synchronization</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span>Secure monitoring access</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </span>
              <span>Lightweight Android integration</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
              </span>
              <span>Personal dashboard visibility</span>
            </div>
          </div>

          <div className="hero-mockup-wrapper">
            <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', padding: '20px' }}>
              <rect width="400" height="280" rx="16" fill="#f8fafc" />
              <rect x="50" y="30" width="300" height="170" rx="8" fill="#1e293b" />
              <rect x="58" y="38" width="284" height="154" rx="4" fill="#ffffff" />
              <path d="M30 200 L370 200 L390 216 L10 216 Z" fill="#94a3b8" />
              <rect x="180" y="200" width="40" height="4" rx="2" fill="#64748b" />
              <rect x="68" y="48" width="80" height="40" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
              <circle cx="82" cy="68" r="8" fill="#2c6bed" />
              <rect x="96" y="64" width="40" height="8" rx="2" fill="#cbd5e1" />
              <rect x="160" y="48" width="80" height="40" rx="4" fill="#f0fdf4" stroke="#bbf7d0" />
              <circle cx="174" cy="68" r="8" fill="#10b981" />
              <rect x="188" y="64" width="40" height="8" rx="2" fill="#cbd5e1" />
              <rect x="252" y="48" width="80" height="40" rx="4" fill="#fff7ed" stroke="#fed7aa" />
              <circle cx="266" cy="68" r="8" fill="#f59e0b" />
              <rect x="280" y="64" width="40" height="8" rx="2" fill="#cbd5e1" />
              <path d="M68 170 L120 130 L180 150 L240 100 L300 120 L330 110" stroke="#15305b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Floating badges */}
            <div className="floating-badge" style={{ top: '65px', left: '10px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              <span>Calls Synced</span>
            </div>

            <div className="floating-badge" style={{ top: '100px', right: '15px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>SMS Activity</span>
            </div>

            <div className="mockup-badge" style={{ bottom: '15px', right: '15px' }}>
              <span className="badge-dot"></span>
              Monitoring Active
            </div>
          </div>
        </section>

        {/* Right Form Card Section */}
        <section className="auth-card-wrapper">
          <div style={{ width: '100%' }}>
            <div className="auth-card">
              <h2 className="card-title">Get Started</h2>
              <p className="card-subtitle">Create your account to continue</p>

              {(validationError || error) && (
                <div className="error-banner">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{validationError || error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      id="fullName"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Passwords (Side by side) */}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: '16px', fontSize: '13px' }}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        style={{ paddingLeft: '16px', fontSize: '13px' }}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Show passwords checkbox */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                </div>

                {/* Android Device Brand Selection */}
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" htmlFor="activeDevice">Android Device Brand</label>
                  <div className="input-wrapper">
                    <select
                      id="activeDevice"
                      className="form-select"
                      style={{ paddingLeft: '16px' }}
                      value={activeDeviceBrand}
                      onChange={(e) => setActiveDeviceBrand(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="Samsung">Samsung</option>
                      <option value="Google Pixel">Google Pixel</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="None">None/Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Information subtext below dropdown */}
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left', lineHeight: '1.4', marginBottom: '20px', fontWeight: 500 }}>
                  Your dashboard will automatically sync once the Android app permissions are enabled.
                </p>

                {/* Terms agreement checkbox */}
                <div className="terms-agreement">
                  <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      style={{ marginTop: '3px' }}
                      checked={agreeToPolicy}
                      onChange={(e) => setAgreeToPolicy(e.target.checked)}
                      disabled={isSubmitting}
                      required
                    />
                    <span>
                      I agree to the <Link to="/policy" style={{ color: 'var(--accent)', fontWeight: 700 }}>Terms</Link> & <Link to="/policy" style={{ color: 'var(--accent)', fontWeight: 700 }}>Privacy Policy</Link>
                    </span>
                  </label>
                </div>

                {/* Create Account button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loader-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', marginBottom: 0, marginRight: '8px' }}></div>
                      Registering Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="divider">OR</div>

              {/* Google OAuth alternative */}
              <button
                type="button"
                className="btn-social"
                onClick={() => alert('Social Authentication is disabled in this environment.')}
                disabled={isSubmitting}
              >
                <svg viewBox="0 0 24 24" className="social-logo-img">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <p className="card-footer-text">
                Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
              </p>
              
              {/* Three bottom inline badges inside card */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '32px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted Sync
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Dashboard
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Lightweight Ops
                </div>
              </div>
            </div>
          </div>
        </section>
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

export default Signup;