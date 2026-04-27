import { Search, Clock } from 'lucide-react';

export default function ScheduleList({ schedule, onSearch, searchQuery }) {
  return (
    <div className="premium-card" style={{ flex: 1.5 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <h3 style={{ fontSize:"1.15rem" }}>Weekly Outage Schedule</h3>
        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
          <Search size={15} style={{ position:"absolute", left:"10px", color:"var(--text-muted)" }} />
          <input type="text" placeholder="Search your area..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--card-border)", borderRadius:"12px",
              padding:"8px 12px 8px 32px", color:"#fff", outline:"none", width:"190px", fontSize:"0.85rem" }}
          />
        </div>
      </div>

      {searchQuery && (
        <div style={{ marginBottom:"16px", padding:"10px 14px", borderRadius:"12px",
          background:"rgba(250,204,21,0.08)", border:"1px solid rgba(250,204,21,0.2)", fontSize:"0.85rem", color:"var(--primary)" }}>
          Showing schedule for: <strong>{searchQuery}</strong>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {schedule.map((item, idx) => (
          <div key={idx} className="premium-card"
            style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
              borderLeft: `4px solid var(--danger)` }}>
            <div style={{ display:"flex", gap:"14px", alignItems:"center" }}>
              <div style={{ background:"rgba(239,68,68,0.08)", width:"52px", height:"52px", borderRadius:"12px",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:"0.55rem", color:"var(--text-muted)", textTransform:"uppercase" }}>
                  {item.date?.slice(5)}
                </span>
                <span style={{ fontWeight:"700", fontSize:"0.95rem" }}>
                  {item.day?.slice(0,3)}
                </span>
              </div>
              <div>
                <p style={{ fontWeight:"600", marginBottom:"3px" }}>{item.day}</p>
                <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"0.82rem", color:"var(--text-muted)" }}>
                  <Clock size={12} />
                  <span>{item.start} – {item.end}</span>
                </div>
              </div>
            </div>
            <span className="status-badge status-off">Outage</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop:"16px", fontSize:"0.75rem", color:"var(--text-muted)", textAlign:"center" }}>
        Each slot = 6 hours. Groups rotate daily per ECG schedule.
      </p>
    </div>
  );
}
