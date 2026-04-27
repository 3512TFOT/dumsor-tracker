import { Zap, MapPin, Bell } from 'lucide-react';

export default function Header({ userArea, onLocate }) {
  return (
    <header className="premium-card" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '32px',
      borderRadius: '0 0 24px 24px',
      borderTop: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'var(--primary)', 
          padding: '8px', 
          borderRadius: '12px',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          <Zap size={24} color="#000" fill="#000" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>DumsorTracker</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stay Informed, Stay Powered</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Location</p>
          <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{userArea?.name || 'Locating...'}</p>
        </div>
        <button 
          onClick={onLocate}
          className="glow-button" 
          style={{ padding: '10px' }}
          title="Auto-detect location"
        >
          <MapPin size={20} />
        </button>
        <button 
          className="premium-card" 
          style={{ padding: '10px', borderRadius: '12px' }}
          title="Notifications"
        >
          <Bell size={20} color="var(--primary)" />
        </button>
      </div>
    </header>
  );
}
