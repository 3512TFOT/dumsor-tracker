import { MessageSquare, ThumbsUp, ThumbsDown, Zap, AlertTriangle } from 'lucide-react';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function CommunityFeed({ reports, onReport, onVote }) {
  return (
    <div className="card feed-section fade-up delay-3">
      <h3>
        <MessageSquare size={18} color="var(--primary)" />
        Community Reports
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}>
          {reports.length} reports
        </span>
      </h3>

      {reports.map((r, i) => (
        <div key={i} className="feed-item">
          <div className="feed-avatar">{initials(r.user)}</div>
          <div style={{ flex: 1 }}>
            <div>
              <span className="feed-user">{r.user}</span>
              <span className="feed-time">{r.time}</span>
              {r.type === 'outage' && (
                <span style={{ marginLeft: 8, fontSize: '0.7rem', background: 'var(--red-g)', color: 'var(--red)',
                  padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  🔴 OFF
                </span>
              )}
              {r.type === 'stable' && (
                <span style={{ marginLeft: 8, fontSize: '0.7rem', background: 'var(--green-g)', color: 'var(--green)',
                  padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  🟢 ON
                </span>
              )}
            </div>
            <p className="feed-text">{r.text}</p>
            <div className="feed-votes">
              <button className="vote-btn" onClick={() => onVote(i, 'up')}>
                <ThumbsUp size={13} /> {r.upvotes}
              </button>
              <button className="vote-btn" onClick={() => onVote(i, 'down')}>
                <ThumbsDown size={13} /> {r.downvotes}
              </button>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onReport('stable')}>
          <Zap size={15} color="var(--green)" /> Report Power ON
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onReport('outage')}>
          <AlertTriangle size={15} color="var(--red)" /> Report Outage
        </button>
      </div>
    </div>
  );
}
