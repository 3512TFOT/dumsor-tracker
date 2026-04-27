import { MessageSquare, ThumbsUp, ThumbsDown, User } from 'lucide-react';

export default function ReportingHub({ reports, onReport }) {
  return (
    <div className="premium-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Community Reports</h3>
        <button 
          className="glow-button" 
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={onReport}
        >
          <MessageSquare size={16} /> Report Now
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reports.map((report, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={20} color="var(--text-muted)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{report.user}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.time}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {report.text}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}>
                  <ThumbsUp size={14} /> {report.upvotes}
                </button>
                <button style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}>
                  <ThumbsDown size={14} /> {report.downvotes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
