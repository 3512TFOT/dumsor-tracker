import { Zap, LayoutDashboard, CalendarDays, Users, Bell, Settings, MapPin, Radio } from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",    id: "dashboard" },
  { icon: CalendarDays,    label: "Full Schedule", id: "schedule"  },
  { icon: Users,           label: "Community",     id: "community" },
  { icon: Radio,           label: "Live Reports",  id: "live"      },
  { icon: MapPin,          label: "Coverage Map",  id: "map"       },
];

export default function Sidebar({ active, onNav, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} color="#000" fill="#000" />
        </div>
        <div className="logo-text">
          <h1>DumsorTracker</h1>
          <p>Ghana Power Monitor</p>
        </div>
      </div>

      {/* Nav */}
      <span className="sidebar-label">Main Menu</span>
      {NAV.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          className={`nav-item ${active === id ? 'active' : ''}`}
          onClick={() => { onNav(id); setSidebarOpen(false); }}
          style={{ width: '100%', background: 'none', border: '1px solid transparent' }}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}

      <span className="sidebar-label" style={{ marginTop: '24px' }}>Settings</span>
      <button className="nav-item" style={{ width: '100%', background: 'none', border: '1px solid transparent' }}>
        <Bell size={17} /> Notifications
      </button>
      <button className="nav-item" style={{ width: '100%', background: 'none', border: '1px solid transparent' }}>
        <Settings size={17} /> Preferences
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="live-badge">
          <div className="live-dot" />
          ECG Data Live
        </div>
        <p style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '6px' }}>
          Apr 25 – May 1, 2026
        </p>
      </div>
    </aside>
  );
}
