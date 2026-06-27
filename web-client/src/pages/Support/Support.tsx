import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real implementation, this would submit to an API
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

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
      <main className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <section className="auth-card-wrapper" style={{ width: '100%', maxWidth: '560px' }}>
          <div className="auth-card">
            <h2 className="card-title">Contact Support</h2>
            <p className="card-subtitle">Get help with your CallBridge installation and configuration</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <svg style={{ width: '64px', height: '64px', color: 'var(--success)', marginBottom: '16px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Your support ticket has been submitted successfully.</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Our team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    className="form-input"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    className="form-input"
                    style={{ minHeight: '120px', resize: 'vertical', paddingLeft: '16px' }}
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--primary)' }}>Quick Links:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>View <Link to="/policy" style={{ color: 'var(--accent)' }}>Platform Policy</Link></li>
                <li>Email: support@callbridge.io</li>
                <li>Documentation: docs.callbridge.io</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Support;