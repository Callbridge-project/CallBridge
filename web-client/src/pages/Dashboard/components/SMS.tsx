import React, { useState, useEffect } from 'react';
import { databases } from '../../../appwrite/config';
interface SMSDocument {
  $id: string;
  contact_name: string;
  phone_number: string;
  message_body: string;
  $createdAt: string;
  created_at?: string;
}

export const SMS: React.FC = () => {
  const [smsLogs, setSMSLogs] = useState<SMSDocument[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SMSDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSMSLogs = async () => {
      setLoading(true);
      try {
        const dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collId = import.meta.env.VITE_APPWRITE_SMS_LOGS_COLLECTION_ID;

        let docs: SMSDocument[] = [];
        if (dbId && collId) {
          try {
            const res = await databases.listDocuments<any>(dbId, collId);
            docs = res.documents as SMSDocument[];
          } catch (e) {
            console.warn('SMS logs database empty, using mock data.');
          }
        }

        if (docs.length > 0) {
          setSMSLogs(docs);
        } else {
          // Pre-populated mock data matching SMS view
          setSMSLogs([
            { $id: '1', contact_name: 'Alex Rivera', phone_number: '+1 (555) 014-4920', message_body: 'Are we still meeting at 3 PM for the gateway setup?', $createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
            { $id: '2', contact_name: 'David Chen', phone_number: '+1 (555) 017-8833', message_body: 'Security authentication passcode is 449201. Expiry in 5 minutes.', $createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { $id: '3', contact_name: 'Sarah Jenkins', phone_number: '+1 (555) 019-2834', message_body: 'CallBridge telemetry client initialized successfully.', $createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { $id: '4', contact_name: 'Emma Watson', phone_number: '+1 (555) 012-7711', message_body: 'Let me know once the S23 device battery reaches 100%.', $createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString() },
            { $id: '5', contact_name: 'Alex Rivera', phone_number: '+1 (555) 014-4920', message_body: 'Received your ping. Device status showing excellent Wi-Fi.', $createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString() }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSMSLogs();
  }, []);

  // Search logic
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredLogs(smsLogs);
    } else {
      const q = search.toLowerCase();
      setFilteredLogs(smsLogs.filter(s => 
        s.contact_name.toLowerCase().includes(q) || 
        s.phone_number.includes(q) || 
        s.message_body.toLowerCase().includes(q)
      ));
    }
  }, [smsLogs, search]);

  const downloadCSV = () => {
    const headers = 'Contact Name,Phone Number,Message Body,Timestamp\n';
    const csvContent = filteredLogs.map(s => 
      `"${s.contact_name}","${s.phone_number}","${s.message_body.replace(/"/g, '""')}","${s.created_at || s.$createdAt}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `callbridge_sms_feeds_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="logs-section" style={{ minHeight: '520px', padding: '32px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h2 className="logs-title" style={{ fontSize: '22px' }}>SMS Transmission Feeds</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'left' }}>Monitor background text transmissions and logs</p>
        </div>
        <button className="btn-sec" onClick={downloadCSV} disabled={filteredLogs.length === 0}>
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </button>
      </div>

      {/* Search Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <div className="input-wrapper" style={{ width: '100%', maxWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '16px', paddingRight: '16px', fontSize: '13px' }}
            placeholder="Search contact, sender, body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SMS Table */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="loader-spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }}></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-light)', border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
          No SMS feeds match your query.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--primary)', fontWeight: 700 }}>
                <th style={{ padding: '14px 16px', width: '20%' }}>Sender Name</th>
                <th style={{ padding: '14px 16px', width: '20%' }}>Phone Number</th>
                <th style={{ padding: '14px 16px', width: '45%' }}>Message Body</th>
                <th style={{ padding: '14px 16px', width: '15%' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(s => (
                <tr key={s.$id} style={{ borderBottom: '1px solid var(--border)' }} className="log-row-tr">
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)' }}>{s.contact_name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{s.phone_number}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontStyle: 'italic', wordBreak: 'break-word' }}>"{s.message_body}"</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-light)', fontWeight: 600 }}>
                    {new Date(s.created_at || s.$createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SMS;
