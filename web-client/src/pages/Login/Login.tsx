import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-fill email on mount if "Remember Me" was enabled previously
  useEffect(() => {
    clearError();
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic Validation
    if (!email || !password) {
      setValidationError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login submit error:', err);
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
          <Link to="/login" className="nav-link" style={{ fontWeight: 700, color: 'var(--accent)' }}>Login</Link>
          <Link to="/signup" className="nav-btn outline">Sign Up</Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="auth-container">
        {/* Hero Section */}
        <section className="auth-hero">
          <span className="hero-tag" style={{ color: 'var(--accent)', background: 'var(--accent-light)', border: 'none' }}>
            Secure Real-Time Monitoring
          </span>
          <h1 className="hero-title">
            Welcome Back to <br />
            <span style={{ color: 'var(--primary)' }}>CallBridge</span>
          </h1>
          <p className="hero-description">
            Access your synchronized dashboard to monitor call logs, SMS activity, and Android device status securely in real time.
          </p>

          <div className="hero-mockup-wrapper">
            <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', padding: '20px' }}>
              <rect width="400" height="280" rx="16" fill="#f8fafc" />
              <rect x="140" y="30" width="120" height="220" rx="18" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
              <rect x="145" y="35" width="110" height="210" rx="14" fill="#ffffff" />
              <rect x="180" y="35" width="40" height="10" rx="5" fill="#1e293b" />
              <rect x="155" y="60" width="90" height="12" rx="3" fill="#eff6ff" />
              <rect x="155" y="80" width="42" height="30" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
              <rect x="203" y="80" width="42" height="30" rx="4" fill="#f0fdf4" stroke="#bbf7d0" />
              <rect x="155" y="120" width="90" height="50" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
              <line x1="160" y1="130" x2="210" y2="130" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              <line x1="160" y1="140" x2="230" y2="140" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              <line x1="160" y1="150" x2="190" y2="150" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              <path d="M150 205 L170 190 L190 200 L210 185 L230 205 L250 195" stroke="#2c6bed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Floating badges */}
            <div className="floating-badge" style={{ top: '65px', left: '10px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Calls Synced</span>
            </div>

            <div className="floating-badge" style={{ top: '110px', right: '10px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>SMS Monitored</span>
            </div>

            <div className="floating-badge" style={{ bottom: '90px', right: '15px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
              <span>Call Activity Updated</span>
            </div>

            <div className="floating-badge" style={{ bottom: '90px', left: '15px' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Device Connected</span>
            </div>

            <div className="mockup-badge" style={{ bottom: '15px', right: '15px' }}>
              <span className="badge-dot"></span>
              Monitoring Active
            </div>
            
            <div className="floating-badge" style={{ top: '25px', left: '150px', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: 'white' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Dashboard Secure</span>
            </div>
          </div>
        </section>

        {/* Form Card Section */}
        <section className="auth-card-wrapper">
          <div style={{ width: '100%' }}>
            <div className="auth-card">
              <h2 className="card-title">Login</h2>
              <p className="card-subtitle">Sign in to continue to your dashboard</p>

              {(validationError || error) && (
                <div className="error-banner">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{validationError || error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '16px', paddingRight: '44px' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Password Row */}
                <div className="remember-forgot-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isSubmitting}
                    />
                    Remember me
                  </label>
                  <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Reset password function is not implemented in this version.'); }}>
                    Forgot Password?
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loader-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', marginBottom: 0, marginRight: '8px' }}></div>
                      Authenticating...
                    </>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>
              </form>

              <div className="divider">OR</div>

              {/* OAuth options */}
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
                Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign Up</Link>
              </p>
            </div>

            {/* Status cards below Login Card */}
            <div className="login-status-cards">
              <div className="status-card">
                <span className="status-card-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <div className="status-card-text">
                  <span className="status-card-title">Secure Authentication</span>
                  <span className="status-card-desc">256-bit AES protection</span>
                </div>
              </div>

              <div className="status-card">
                <span className="status-card-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4a2 2 0 002-2m-2 4a2 2 0 002 2m-5-4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <div className="status-card-text">
                  <span className="status-card-title">Encrypted Synchronization</span>
                  <span className="status-card-desc">End-to-end data tunnel</span>
                </div>
              </div>

              <div className="status-card">
                <span className="status-card-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <div className="status-card-text">
                  <span className="status-card-title">Real-Time Monitoring Access</span>
                  <span className="status-card-desc">Instant low-latency logs</span>
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

export default Login;