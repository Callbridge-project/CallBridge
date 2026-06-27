import React, { useState } from 'react';
import { useAuth } from '../../../context/authContext';

interface SyncHistoryItem {
  id: string;
  time: string;
  status: 'Success' | 'Failed';
  details: string;
}

export const Devices: React.FC = () => {
  const { user } = useAuth();
  const [syncHistory] = useState<SyncHistoryItem[]>([
    { id: '1', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'Success', details: 'Synced 12 calls and 48 SMS feeds successfully.' },
    { id: '2', time: new Date(Date.now() - 1000 * 60 * 65).toISOString(), status: 'Success', details: 'Synced 4 calls and 12 SMS feeds successfully.' },
    { id: '3', time: new Date(Date.now() - 1000 * 60 * 125).toISOString(), status: 'Failed', details: 'Network timeout during packet transmission. Re-trying.' },
    { id: '4', time: new Date(Date.now() - 1000 * 60 * 185).toISOString(), status: 'Success', details: 'Initial background link handshake completed.' }
  ]);

  const triggerManualSync = () => {
    alert('Requesting target Android app to pack and stream telephony metadata.');
  };

  const disconnectDevice = () => {
    if (window.confirm('Are you sure you want to disconnect this device? Active telemetry syncs will stop immediately.')) {
      alert('Simulated disconnect successful. In a production system, this updates Appwrite active_device fields to null.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px' }}>
        {/* Left Side: Mock Phone Visualization Card */}
        <div className="logs-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ width: '100%', maxWidth: '240px', padding: '20px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            <svg viewBox="0 0 160 260" style={{ width: '100%', height: 'auto' }}>
              <rect x="20" y="10" width="120" height="240" rx="18" fill="#1e293b" />
              <rect x="25" y="15" width="110" height="230" rx="14" fill="#f8fafc" />
              <rect x="65" y="15" width="30" height="8" rx="4" fill="#1e293b" />
              
              {/* Telemetry visuals */}
              <circle cx="80" cy="80" r="30" fill="rgba(44, 107, 237, 0.1)" stroke="var(--accent)" strokeWidth="2" />
              <path d="M 68,80 A 12,12 0 0,1 92,80" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="80" cy="80" r="4" fill="var(--primary)" />
              
              {/* Battery level inside graphic */}
              <rect x="60" y="140" width="40" height="18" rx="3" fill="#cbd5e1" />
              <rect x="62" y="142" width="36" height="14" rx="2" fill="#10b981" />
              <text x="80" y="153" fontSize="8" fill="white" fontWeight="800" textAnchor="middle">97%</text>

              {/* Status items */}
              <rect x="40" y="180" width="80" height="12" rx="3" fill="#e2e8f0" />
              <rect x="40" y="200" width="80" height="12" rx="3" fill="#e2e8f0" />
            </svg>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 800, marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span className="badge-dot" style={{ backgroundColor: '#10b981' }}></span>
              Device Status: Online
            </div>
          </div>
        </div>

        {/* Right Side: Specifications and Info */}
        <div className="logs-section" style={{ textAlign: 'left', padding: '32px' }}>
          <h2 className="logs-title" style={{ fontSize: '22px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>Active Device Diagnostics</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13.5px', marginBottom: '32px' }}>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Device Brand</span>
              <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{user?.active_device_name || 'Samsung Galaxy S23'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Connection ID</span>
              <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{user?.active_device_id || 'dev_samsung23'}</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Android Version</span>
              <strong style={{ color: 'var(--primary)' }}>Android 14 (API 34)</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>App Version</span>
              <strong style={{ color: 'var(--primary)' }}>CallBridge Client v1.0.4</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Power Status</span>
              <strong style={{ color: 'var(--success)' }}>97% Charging</strong>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--text-light)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Handshake Time</span>
              <strong style={{ color: 'var(--primary)' }}>Active Session (12ms)</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={triggerManualSync}>
              Trigger Manual Sync
            </button>
            <button className="btn-primary" style={{ flex: 1, backgroundColor: 'rgba(225,29,72,0.1)', color: 'var(--danger)', border: '1.5px solid rgba(225,29,72,0.2)', boxShadow: 'none' }} onClick={disconnectDevice}>
              Disconnect Device
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Synchronization History Table */}
      <div className="logs-section" style={{ padding: '32px' }}>
        <h3 className="logs-title" style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'left' }}>Device Synchronization History</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--primary)', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Details / Synced Packets</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }} className="log-row-tr">
                  <td style={{ padding: '12px 16px', color: 'var(--text-light)', fontWeight: 600 }}>
                    {new Date(item.time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: item.status === 'Success' ? '#d1fae5' : '#fee2e2',
                      color: item.status === 'Success' ? '#065f46' : '#991b1b'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Devices;
