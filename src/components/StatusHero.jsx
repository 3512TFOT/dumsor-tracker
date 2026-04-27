import { Power, PowerOff, Calendar, Bell, CheckCircle, XCircle } from 'lucide-react';

export default function StatusHero({ isPowerOn, nextOutage, areaName, onExport, onConfirmOn, onConfirmOff }) {
  return (
    <div className={`card status-hero fade-up`}>
      {/* Ambient glow */}
      <div className={`status-hero-bg ${isPowerOn ? 'on' : 'off'}`} />

      <div>
        {/* Status label */}
        <div className={`status-label ${isPowerOn ? 'on' : 'off'}`}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isPowerOn ? 'var(--green)' : 'var(--red)',
            display: 'inline-block',
            boxShadow: isPowerOn ? '0 0 6px var(--green)' : '0 0 6px var(--red)',
            animation: 'pulse-dot 2s infinite'
          }} />
          {isPowerOn ? 'Power Stable' : 'Outage Active'}
        </div>

        {/* Headline */}
        <div className="status-indicator" style={{ marginTop: 14 }}>
          <div className={`power-ring ${isPowerOn ? 'on' : 'off'}`}>
            {isPowerOn
              ? <Power size={22} color="var(--green)" />
              : <PowerOff size={22} color="var(--red)" />}
          </div>
          <div>
            <h2 className="status-headline">
              {isPowerOn ? 'Power is ON' : 'Power is OFF'}
            </h2>
            <p className="status-sub">{areaName}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--muted2)', marginTop: 8 }}>
          {isPowerOn ? '⏱ Next outage:' : '🔄 Expected restoration:'}&nbsp;
          <strong style={{ color: 'var(--text)' }}>{nextOutage}</strong>
        </p>
      </div>

      {/* Actions */}
      <div className="hero-actions">
        <button className="btn btn-blue" onClick={onExport}>
          <Calendar size={16} /> Add to Calendar
        </button>
        <button className="btn btn-ghost">
          <Bell size={16} /> Set Alert
        </button>
        <button className="btn btn-confirm" onClick={onConfirmOn}>
          <CheckCircle size={16} /> Power ON
        </button>
        <button className="btn btn-deny" onClick={onConfirmOff}>
          <XCircle size={16} /> Power OFF
        </button>
      </div>
    </div>
  );
}
