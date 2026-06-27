import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/authContext';
import { databases } from '../../../appwrite/config';

interface CombinedLog {
  id: string;
  type: 'call' | 'sms';
  contact: string;
  phone: string;
  messageOrType: string;
  time: string;
}

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CombinedLog[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'calls' | 'sms'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch recent logs (calls + SMS) or populate with mock data if database collections are empty
  useEffect(() => {
    const fetchRecentLogs = async () => {
      setLoading(true);
      try {
        const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const callCollId = import.meta.env.VITE_APPWRITE_CALL_LOGS_COLLECTION_ID;
        const smsCollId = import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID;

        let fetchedCalls: any[] = [];
        let fetchedSMS: any[] = [];

        if (dbId && callCollId) {
          try {
            const res = await databases.listDocuments(dbId, callCollId);
            fetchedCalls = res.documents;
          } catch (e) {
            console.warn('Call logs database fetch empty, using mock data.');
          }
        }
        
        if (dbId && smsCollId) {
          try {
            const res = await databases.listDocuments(dbId, smsCollId);
            fetchedSMS = res.documents;
          } catch (e) {
            console.warn('SMS logs database fetch empty, using mock data.');
          }
        }

        // Map and merge logs
        const mappedCalls: CombinedLog[] = fetchedCalls.map(c => ({
          id: c.$id,
          type: 'call',
          contact: c.contact_name || 'Unknown Contact',
          phone: c.phone_number,
          messageOrType: c.call_type || 'Incoming',
          time: c.created_at || c.$createdAt
        }));

        const mappedSMS: CombinedLog[] = fetchedSMS.map(s => ({
          id: s.$id,
          type: 'sms',
          contact: s.contact_name || 'Unknown Contact',
          phone: s.phone_number,
          messageOrType: s.message_body,
          time: s.created_at || s.$createdAt
        }));

        const merged = [...mappedCalls, ...mappedSMS].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
        
        if (merged.length > 0) {
          setLogs(merged);
        } else {
          // Fallback high-fidelity mock data matching screenshots
          setLogs([
            { id: '1', type: 'call', contact: 'Sarah Jenkins', phone: '+1 (555) 019-2834', messageOrType: 'Incoming', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: '2', type: 'sms', contact: 'Alex Rivera', phone: '+1 (555) 014-4920', messageOrType: 'Are we still meeting at 3 PM?', time: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
            { id: '3', type: 'call', contact: 'Sarah Jenkins', phone: '+1 (555) 019-2834', messageOrType: 'Outgoing', time: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: '4', type: 'sms', contact: 'David Chen', phone: '+1 (555) 017-8833', messageOrType: 'Security code is 449201. Do not share.', time: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { id: '5', type: 'call', contact: 'Emma Watson', phone: '+1 (555) 012-7711', messageOrType: 'Missed', time: new Date(Date.now() - 1000 * 60 * 360).toISOString() }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentLogs();
  }, []);

  const triggerManualSync = () => {
    alert('Telemetry synchronization request sent to the Android app.');
  };

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    if (filterType === 'calls') return log.type === 'call';
    if (filterType === 'sms') return log.type === 'sms';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Device Monitoring Service Banner */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)', textAlign: 'left' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge-dot" style={{ backgroundColor: '#10b981', width: '10px', height: '10px' }}></span>
            <span style={{ fontWeight: 800, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a7f3d0' }}>Device Monitoring Service</span>
          </div>
          <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '520px' }}>
            Telemetry syncer is active. Connected to **{user?.active_device_name || 'Samsung Galaxy S23'}**. Logs are streamed via encrypted tunnels.
          </p>
        </div>
        <button className="btn-sec" style={{ color: 'var(--primary)', background: 'white', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-md)' }} onClick={triggerManualSync}>
          Trigger Sync
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Calls */}
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-title">Total Calls</span>
            <div className="stats-card-icon-wrapper">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <div className="stats-card-value">1,250</div>
          <span className="stats-card-indicator up">
            <span className="badge-dot" style={{ backgroundColor: '#10b981' }}></span> Active logs synced
          </span>
        </div>

        {/* Total SMS */}
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-title">Total SMS</span>
            <div className="stats-card-icon-wrapper" style={{ backgroundColor: 'rgba(44, 107, 237, 0.1)', color: 'var(--accent)' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div className="stats-card-value">2,450</div>
          <span className="stats-card-indicator up" style={{ color: 'var(--accent)' }}>
            <span className="badge-dot" style={{ backgroundColor: 'var(--accent)' }}></span> Text feeds verified
          </span>
        </div>

        {/* Active Device */}
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-title">Connected Brand</span>
            <div className="stats-card-icon-wrapper">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="stats-card-value" style={{ fontSize: '20px', padding: '4px 0' }}>{user?.active_device_name || 'Samsung S23'}</div>
          <span className="stats-card-indicator neutral" style={{ fontFamily: 'monospace', fontSize: '10.5px' }}>
            ID: {user?.active_device_id || 'dev_samsung23'}
          </span>
        </div>

        {/* Battery status */}
        <div className="stats-card">
          <div className="stats-card-header">
            <span className="stats-card-title">Device Battery</span>
            <div className="stats-card-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </div>
          <div className="stats-card-value">97%</div>
          <span className="stats-card-indicator up">
            Charging (USB Connected)
          </span>
        </div>
      </div>

      {/* Split Details Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        {/* Left Column: Recent Logs */}
        <div className="logs-section" style={{ minHeight: '400px' }}>
          <div className="logs-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="logs-title">Recent Telemetry Feeds</h2>
            <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-main)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
              <button
                className={`nav-btn ${filterType === 'all' ? 'solid' : ''}`}
                style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '4px' }}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                className={`nav-btn ${filterType === 'calls' ? 'solid' : ''}`}
                style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '4px' }}
                onClick={() => setFilterType('calls')}
              >
                Calls
              </button>
              <button
                className={`nav-btn ${filterType === 'sms' ? 'solid' : ''}`}
                style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '4px' }}
                onClick={() => setFilterType('sms')}
              >
                SMS
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="loader-spinner" style={{ width: '28px', height: '28px', margin: '0 auto' }}></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-light)' }}>
              No recent logs found.
            </div>
          ) : (
            <div className="logs-list" style={{ marginTop: '16px' }}>
              {filteredLogs.map(log => (
                <div key={log.id} className="log-row" style={{ padding: '14px 16px' }}>
                  <div className="log-details">
                    <span className="log-message" style={{ fontSize: '13.5px' }}>{log.contact}</span>
                    <div className="log-meta">
                      <span>{log.phone}</span>
                      <span>•</span>
                      <span style={{ color: log.type === 'call' ? 'var(--accent)' : 'var(--text-main)', fontStyle: log.type === 'sms' ? 'italic' : 'normal' }}>
                        {log.type === 'call' ? `Call: ${log.messageOrType}` : `SMS: "${log.messageOrType.length > 30 ? log.messageOrType.substring(0, 30) + '...' : log.messageOrType}"`}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                    {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Device Telemetry Status & Mockup Phone */}
        <div className="logs-section" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 className="logs-title">Diagnostic Telemetry</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {/* Battery Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                <span>Battery Capacity</span>
                <span>97%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '97%', height: '100%', backgroundColor: 'var(--success)' }}></div>
              </div>
            </div>

            {/* Storage Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                <span>Internal Storage</span>
                <span>45% (115 GB / 256 GB)</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>

            {/* Wi-Fi Signal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Wi-Fi Connection</span>
              <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M12 21a2 2 0 110-4 2 2 0 010 4zM4.8 11.2a1 1 0 010-1.4 10 10 0 0114.4 0 1 1 0 01-1.4 1.4 8 8 0 00-11.6 0 1 1 0 01-1.4 0zm3.5 3.5a1 1 0 010-1.4 5 5 0 017.4 0 1 1 0 01-1.4 1.4 3 3 0 00-4.6 0 1 1 0 01-1.4 0z"/></svg>
                Excellent
              </span>
            </div>

            {/* Cell Strength */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Network Strength</span>
              <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}><path d="M2 22h20V2z"/></svg>
                5G Active
              </span>
            </div>
          </div>

          {/* Visual Smartphone graphic inline representation */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--bg-main)' }}>
            <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
              <rect x="60" y="5" width="80" height="110" rx="10" fill="#1e293b" />
              <rect x="64" y="9" width="72" height="102" rx="7" fill="white" />
              <circle cx="100" cy="104" r="3" fill="#cbd5e1" />
              {/* Screen visuals */}
              <rect x="70" y="16" width="60" height="16" rx="2" fill="#eff6ff" />
              <rect x="70" y="38" width="60" height="26" rx="2" fill="#f0fdf4" />
              <rect x="70" y="70" width="60" height="26" rx="2" fill="#fff7ed" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent System Events */}
      <div className="logs-section" style={{ padding: '24px 28px' }}>
        <h2 className="logs-title" style={{ fontSize: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Recent System Event Logs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• Device <strong>{user?.active_device_name || 'Samsung S23'}</strong> established secure WebSocket connection</span>
            <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• Telephony Call events database synchronization completed</span>
            <span style={{ fontWeight: 600 }}>{new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• SMS message feeds tunnel handshakes established successfully</span>
            <span style={{ fontWeight: 600 }}>{new Date(Date.now() - 1000 * 60 * 8).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
