import { useState } from 'react';
import { X, Zap, AlertTriangle, Send } from 'lucide-react';

export default function ReportModal({ area, onSubmit, onClose }) {
  const [type, setType] = useState('off');
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot trap

  const PRESETS = {
    off: [
      'Power just went out',
      'Been off for over an hour',
      'Went off earlier than scheduled',
      'Still off — no updates',
    ],
    on: [
      'Power just came back on',
      'Back on, right on schedule',
      'Power stable so far',
      'Came back early!',
    ],
  };

  const handleSubmit = () => {
    if (honeypot) return onClose(); // Silent fail for bots
    if (!text.trim() || text.trim().length > 200) return; // Character limit
    onSubmit({ type, text: text.trim() });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        animation: 'fade-up 0.15s ease',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px',
        zIndex: 201,
        maxWidth: 520,
        margin: '0 auto',
        animation: 'slide-up 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'var(--border)', margin: '0 auto 20px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Report Power Status</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{area}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 10, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Type toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, marginBottom: 20,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 4,
        }}>
          <button onClick={() => setType('off')} style={{
            padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
            border: type === 'off' ? '1px solid var(--danger-b)' : '1px solid transparent',
            background: type === 'off' ? 'var(--danger-g)' : 'none',
            color: type === 'off' ? 'var(--danger)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
            <AlertTriangle size={15} /> Power is OFF
          </button>
          <button onClick={() => setType('on')} style={{
            padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
            border: type === 'on' ? '1px solid rgba(250,204,21,0.3)' : '1px solid transparent',
            background: type === 'on' ? 'var(--primary-g)' : 'none',
            color: type === 'on' ? 'var(--primary)' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
            <Zap size={15} /> Power is ON
          </button>
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
          {PRESETS[type].map((p, i) => (
            <button key={i} onClick={() => setText(p)} style={{
              padding: '6px 13px', borderRadius: 99,
              fontSize: '0.78rem', fontWeight: 500,
              background: text === p ? 'var(--primary-g)' : 'var(--card)',
              border: `1px solid ${text === p ? 'rgba(250,204,21,0.3)' : 'var(--border)'}`,
              color: text === p ? 'var(--primary)' : 'var(--muted2)',
              transition: 'all 0.15s',
            }}>
              {p}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          placeholder="Or add more details…"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
          rows={3}
          style={{
            width: '100%', background: 'var(--card)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: '12px 14px', color: 'var(--text)', fontSize: '0.88rem',
            outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5, marginBottom: 14,
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(250,204,21,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {/* Honeypot for bots */}
        <input 
          type="text" 
          name="user_email" 
          tabIndex="-1" 
          autoComplete="off"
          style={{ display: 'none' }} 
          value={honeypot} 
          onChange={e => setHoneypot(e.target.value)} 
        />

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!text.trim()} style={{
          width: '100%', padding: '13px',
          borderRadius: 12, fontWeight: 700, fontSize: '0.92rem',
          background: text.trim() ? 'var(--primary)' : 'var(--card)',
          color: text.trim() ? '#000' : 'var(--muted)',
          border: '1px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
          boxShadow: text.trim() ? '0 0 20px var(--primary-g)' : 'none',
          cursor: text.trim() ? 'pointer' : 'not-allowed',
          fontFamily: 'Inter, sans-serif',
        }}>
          <Send size={16} /> Submit Report
        </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
