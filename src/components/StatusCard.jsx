import { Power, PowerOff, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatusCard({ isPowerOn, nextOutage, areaName }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card" 
      style={{ 
        flex: 1, 
        minHeight: '240px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        right: '-20px', 
        opacity: 0.05 
      }}>
        {isPowerOn ? <Power size={200} /> : <PowerOff size={200} />}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span className={`status-badge ${isPowerOn ? 'status-on' : 'status-off'}`}>
            {isPowerOn ? 'Current Status: Stable' : 'Current Status: Outage'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{areaName}</span>
        </div>
        
        <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {isPowerOn ? 'Power is ON' : 'Power is OFF'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isPowerOn 
            ? `Next scheduled outage: ${nextOutage || 'None scheduled'}`
            : `Scheduled restoration: ${nextOutage || 'Checking...'}`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button 
          onClick={onExport}
          className="glow-button" 
          style={{ background: 'var(--secondary)', color: '#fff' }}
        >
          <Calendar size={18} /> Add to Calendar
        </button>
        <button className="premium-card" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '600' }}>
          Set Reminder
        </button>
      </div>
    </motion.div>
  );
}
