import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import { SCHEDULE_DATES, getCurrentOutageGroups, getNextSlot } from './data';
import {
  Zap, Power, PowerOff, Bell, BellOff, Calendar, Search,
  Home, CalendarDays, MessageSquare, Settings,
  CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  AlertTriangle, Share2, MapPin, Clock, ChevronRight
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────────── */
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function exportICS(region, group, area, slots) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DumsorTracker//EN\n';
  slots.forEach(s => {
    const ds = s.date.replace(/-/g,'') + 'T' + s.start.replace(':','') + '00';
    const de = s.date.replace(/-/g,'') + 'T' + (s.end==='00:00'?'235959':s.end.replace(':','')+'00');
    ics += `BEGIN:VEVENT\nSUMMARY:⚡ ECG Outage – ${area}\nDTSTART:${ds}\nDTEND:${de}\nDESCRIPTION:Load shedding – ${region} Group ${group}\nALARM:TRIGGER:-PT60M\nEND:VEVENT\n`;
  });
  ics += 'END:VCALENDAR';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type:'text/calendar' }));
  a.download = `ecg_${area.replace(/\s+/g,'-')}.ics`;
  a.click();
}

function requestNotification(cb) {
  if (!('Notification' in window)) return cb(false);
  if (Notification.permission === 'granted') return cb(true);
  Notification.requestPermission().then(p => cb(p === 'granted'));
}

function scheduleAlert(areaName, slotDate, slotStart) {
  if (Notification.permission !== 'granted') return;
  const [h, m] = slotStart.split(':').map(Number);
  const outageTime = new Date(`${slotDate}T${slotStart}:00`);
  const alertTime  = new Date(outageTime.getTime() - 60 * 60 * 1000); // 1hr before
  const delay      = alertTime.getTime() - Date.now();
  if (delay > 0 && delay < 86400000) { // only if within 24h
    setTimeout(() => {
      new Notification('⚡ DumsorTracker Alert', {
        body: `Power outage in ${areaName} starts in 1 hour (${slotStart}).`,
        icon: '/favicon.ico',
      });
    }, delay);
  }
}

/* ─────────────────────────────────────────────────────── */
export default function App() {
  const [userInfo, setUserInfo]       = useState(null); // { area, group, region }
  const [tab, setTab]                 = useState('home');
  const [selectedDay, setSelectedDay] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [alertOneHr, setAlertOneHr]   = useState(true);
  const [alertMorning, setAlertMorning] = useState(true);
  const [alertRestore, setAlertRestore] = useState(false);
  const [showPermBanner, setShowPermBanner] = useState(true);
  const [reports, setReports] = useState([
    { user:'Kwesi A.',  text:'Power just went off in East Legon. About 10 mins early!',  time:'2m ago',  type:'off', upvotes:14, downvotes:0 },
    { user:'Amma O.',   text:'Osu still on. Fingers crossed 🤞',                          time:'18m ago', type:'on',  upvotes:7,  downvotes:1 },
    { user:'Nana B.',   text:'Sakumono (Group C) came back on at 18:05 — right on time!', time:'35m ago', type:'on',  upvotes:9,  downvotes:0 },
    { user:'Esi M.',    text:'Adabraka still off as of 7pm. Anyone else affected?',        time:'1h ago',  type:'off', upvotes:4,  downvotes:0 },
  ]);

  /* ── Selected day ───────────────────────────────────── */
  useEffect(() => {
    if (!selectedDay) {
      const today = new Date().toISOString().split('T')[0];
      const found = SCHEDULE_DATES.find(d => d.date === today) || SCHEDULE_DATES[0];
      setSelectedDay(found.date);
    }
  }, [selectedDay]);

  /* ── Live status for user's group ───────────────────── */
  const status = useMemo(() => {
    if (!userInfo) return { isPowerOn: true, next: '' };
    const off = getCurrentOutageGroups();
    const isOff = off.includes(userInfo.group);
    const next  = getNextSlot(userInfo.group);
    const label = next ? `${next.day}, ${next.start} – ${next.end}` : 'No more outages this week';
    return { isPowerOn: !isOff, next: label };
  }, [userInfo]);

  /* ── My week slots ──────────────────────────────────── */
  const mySlots = useMemo(() => {
    if (!userInfo) return [];
    return SCHEDULE_DATES.flatMap(d =>
      d.slots.filter(s => s.group === userInfo.group).map(s => ({ ...s, date: d.date, day: d.day }))
    );
  }, [userInfo]);

  /* ── Selected day detail ────────────────────────────── */
  const dayDetail = useMemo(() => {
    if (!selectedDay || !userInfo) return null;
    const dayData = SCHEDULE_DATES.find(d => d.date === selectedDay);
    if (!dayData) return null;
    return {
      ...dayData,
      mySlot: dayData.slots.find(s => s.group === userInfo.group) || null,
    };
  }, [selectedDay, userInfo]);

  /* ── Enable notifications ───────────────────────────── */
  const handleEnableNotif = useCallback(() => {
    requestNotification(granted => {
      setNotifEnabled(granted);
      setShowPermBanner(false);
      if (granted && mySlots.length > 0 && userInfo) {
        mySlots.forEach(s => scheduleAlert(userInfo.area, s.date, s.start));
        new Notification('✅ DumsorTracker', {
          body: `Alerts enabled for ${userInfo.area}. You'll be notified 1 hour before outages.`,
        });
      }
    });
  }, [mySlots, userInfo]);

  /* ── Vote ───────────────────────────────────────────── */
  const handleVote = (i, dir) => {
    setReports(prev => prev.map((r, idx) =>
      idx !== i ? r : { ...r, [dir==='up'?'upvotes':'downvotes']: r[dir==='up'?'upvotes':'downvotes'] + 1 }
    ));
  };

  /* ── Add report ─────────────────────────────────────── */
  const handleReport = (type) => {
    const text = prompt(type === 'off' ? 'Describe the outage:' : 'Describe the power status:');
    if (text) setReports(prev => [{ user:'You', text, time:'Just now', type, upvotes:0, downvotes:0 }, ...prev]);
  };

  /* ── Share ──────────────────────────────────────────── */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title:'DumsorTracker', text:`Check your ECG outage schedule at DumsorTracker Ghana!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  /* ── Onboarding ─────────────────────────────────────── */
  if (!userInfo) return <Onboarding onSelect={info => { setUserInfo(info); setTab('home'); }} />;

  const today = new Date().toISOString().split('T')[0];

  /* ── RENDER ─────────────────────────────────────────── */
  return (
    <>
      <div className="app-shell">
        {/* ── Nav ── */}
        <div className="top-nav">
          <div className="nav-logo">
            <div className="nav-logo-icon"><Zap size={18} color="#000" fill="#000" /></div>
            <h1>DumsorTracker</h1>
          </div>
          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setTab('search')} title="Search area">
              <Search size={17} />
            </button>
            <button className={`icon-btn ${notifEnabled ? 'active' : ''}`} onClick={handleEnableNotif} title="Notifications">
              {notifEnabled ? <Bell size={17} /> : <BellOff size={17} />}
            </button>
          </div>
        </div>

        {/* ══════════ HOME TAB ══════════ */}
        {tab === 'home' && (
          <>
            {/* My area header */}
            <div className="area-header fu">
              <div className="area-tag">
                <MapPin size={11} /> {userInfo.region.name} · Group {userInfo.group}
              </div>
              <h2 className="area-name">{userInfo.area}</h2>
              <p className="area-meta">ECG Load Management · Apr 25 – May 1, 2026</p>
              <button className="change-area-btn" onClick={() => setUserInfo(null)}>Change area</button>
            </div>

            {/* Notification permission banner */}
            {showPermBanner && !notifEnabled && (
              <div className="perm-banner fu fu1">
                <Bell size={20} color="var(--purple)" />
                <div>
                  <h4>Get outage alerts</h4>
                  <p>We'll notify you 1 hour before power goes out in {userInfo.area}.</p>
                  <div className="perm-actions">
                    <button className="perm-yes" onClick={handleEnableNotif}>Enable Alerts</button>
                    <button className="perm-no"  onClick={() => setShowPermBanner(false)}>Not now</button>
                  </div>
                </div>
              </div>
            )}

            {/* Power status */}
            <div className={`power-card ${status.isPowerOn ? 'on' : 'off'} fu fu2`}>
              <div className="power-card-glow" />
              <div className="power-row">
                <div className="power-icon">
                  {status.isPowerOn ? <Power size={22} color="var(--green)" /> : <PowerOff size={22} color="var(--red)" />}
                </div>
                <div>
                  <div className={`power-status-label`}>
                    <span style={{ width:6,height:6,borderRadius:'50%',
                background: status.isPowerOn ? 'var(--primary)' : 'var(--danger)',
                display:'inline-block',animation:'ripple 2s infinite' }} />
                    {status.isPowerOn ? 'Power is Stable' : 'Outage Active'}
                  </div>
                  <div className="power-headline">{status.isPowerOn ? 'Power is ON' : 'Power is OFF'}</div>
                  <p className="power-next">
                    {status.isPowerOn ? 'Next outage: ' : 'Expected restoration: '}
                    <strong>{status.next}</strong>
                  </p>
                </div>
              </div>

              {/* Confirm buttons */}
              <p style={{ fontSize:'0.76rem', color:'var(--muted)', marginBottom:8 }}>Is this correct for your area?</p>
              <div className="confirm-row">
                <button className="confirm-btn yes" onClick={() => handleReport('on')}>
                  <CheckCircle size={15} /> Yes, power is ON
                </button>
                <button className="confirm-btn no" onClick={() => handleReport('off')}>
                  <XCircle size={15} /> No, it's OFF
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="action-row fu fu3">
              <button className="action-btn primary" onClick={() => exportICS(userInfo.region.name, userInfo.group, userInfo.area, mySlots)}>
                <Calendar size={16} /> Add to Calendar
              </button>
              <button className="action-btn" onClick={handleShare}>
                <Share2 size={16} /> Share
              </button>
            </div>

            {/* This week strip */}
            <div className="section-hd fu fu3">
              <h3>This Week</h3>
              <a href="#" onClick={e=>{e.preventDefault();setTab('schedule');}}>
                View full schedule <ChevronRight size={14} style={{verticalAlign:'middle'}} />
              </a>
            </div>

            <div className="week-strip fu fu4">
              {SCHEDULE_DATES.map(d => {
                const hasOutage = d.slots.some(s => s.group === userInfo.group);
                const isToday   = d.date === today;
                const isSelected = d.date === selectedDay;
                const dayAbbr = d.day.slice(0,3).toUpperCase();
                const dateNum = new Date(d.date).getDate();
                return (
                  <div key={d.date}
                    className={`week-day ${hasOutage?'outage':'stable'} ${isToday?'today':''} ${isSelected?'selected':''}`}
                    onClick={() => { setSelectedDay(d.date); setTab('schedule'); }}
                  >
                    <span className="week-day-abbr">{dayAbbr}</span>
                    <span className="week-day-num">{dateNum}</span>
                    <span className="week-day-dot"
                      style={{background: hasOutage ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}} />
                  </div>
                );
              })}
            </div>

            {/* Community preview */}
            <div className="section-hd fu fu5">
              <h3>Nearby Reports</h3>
              <a href="#" onClick={e=>{e.preventDefault();setTab('community');}}>
                See all <ChevronRight size={14} style={{verticalAlign:'middle'}} />
              </a>
            </div>
            <div className="alert-card fu fu5" style={{padding:'16px 20px'}}>
              {reports.slice(0,2).map((r,i) => (
                <div key={i} className="feed-item">
                  <div className="feed-av">{initials(r.user)}</div>
                  <div>
                    <div><span className="feed-user">{r.user}</span><span className="feed-when">{r.time}</span>
                      <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟢 ON'}</span>
                    </div>
                    <p className="feed-text">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ SCHEDULE TAB ══════════ */}
        {tab === 'schedule' && (
          <>
            <div className="area-header fu" style={{marginBottom:16}}>
              <div className="area-tag"><Clock size={11} /> {userInfo.region.name} · Group {userInfo.group}</div>
              <h2 className="area-name" style={{fontSize:'1.3rem'}}>My Outage Schedule</h2>
              <p className="area-meta">{userInfo.area} · Apr 25 – May 1, 2026</p>
              <button className="change-area-btn" onClick={() => setUserInfo(null)}>Change area</button>
            </div>

            {/* Day strip */}
            <div className="week-strip fu fu1">
              {SCHEDULE_DATES.map(d => {
                const hasOutage = d.slots.some(s => s.group === userInfo.group);
                const isToday   = d.date === today;
                const isSelected = d.date === selectedDay;
                return (
                  <div key={d.date}
                    className={`week-day ${hasOutage?'outage':'stable'} ${isToday?'today':''} ${isSelected?'selected':''}`}
                    onClick={() => setSelectedDay(d.date)}
                  >
                    <span className="week-day-abbr">{d.day.slice(0,3).toUpperCase()}</span>
                    <span className="week-day-num">{new Date(d.date).getDate()}</span>
                    <span className="week-day-dot"
                      style={{background: hasOutage ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}} />
                  </div>
                );
              })}
            </div>

            {/* Day detail */}
            {dayDetail && (
              <div className="outage-detail fu fu2">
                {/* Date hero */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div>
                    <p style={{fontSize:'0.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,marginBottom:4}}>
                      {dayDetail.mySlot ? '⚡ Outage Scheduled' : '✓ No Outage'}
                    </p>
                    <h2 style={{fontSize:'1.8rem',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1,fontFamily:'Outfit,sans-serif'}}>
                      {dayDetail.day}
                    </h2>
                    <p style={{fontSize:'0.95rem',color:'var(--muted2)',fontWeight:600,marginTop:4}}>
                      {new Date(dayDetail.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                    </p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    {dayDetail.mySlot ? (
                      <>
                        <span className="slot-chip off" style={{display:'block',marginBottom:8}}>Your Outage</span>
                        <p style={{fontSize:'1.15rem',fontWeight:800,color:'var(--danger)',fontFamily:'Outfit,sans-serif'}}>
                          {dayDetail.mySlot.start}<span style={{color:'var(--muted)',fontWeight:400,fontSize:'0.9rem'}}> – </span>{dayDetail.mySlot.end}
                        </p>
                        <p style={{fontSize:'0.72rem',color:'var(--muted)',marginTop:2}}>6 hour outage</p>
                      </>
                    ) : (
                      <span style={{fontSize:'0.85rem',color:'var(--muted)'}}>Power stable</span>
                    )}
                  </div>
                </div>

                <button className="action-btn" style={{width:'100%'}}
                  onClick={() => exportICS(userInfo.region.name, userInfo.group, userInfo.area,
                    dayDetail.slots.filter(s=>s.group===userInfo.group).map(s=>({...s,date:dayDetail.date,day:dayDetail.day}))
                  )}>
                  <Calendar size={15} /> Save {dayDetail.day} to Calendar
                </button>
              </div>
            )}

            {/* All my slots */}
            <div className="section-hd fu fu3" style={{marginTop:4}}>
              <h3>Full Week — My Outages</h3>
              <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{mySlots.length} slot{mySlots.length!==1?'s':''}</span>
            </div>
            <div className="outage-detail fu fu4" style={{padding:'8px 20px'}}>
              {mySlots.length === 0 && (
                <p style={{color:'var(--muted)',fontSize:'0.85rem',padding:'12px 0'}}>No outages scheduled for your area this week.</p>
              )}
              {mySlots.map((s, i) => (
                <div key={i} className="outage-slot"
                  style={{cursor:'pointer'}}
                  onClick={() => setSelectedDay(s.date)}
                >
                  {/* Left: day + date as primary info */}
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{
                      minWidth:52,textAlign:'center',
                      background: s.date===selectedDay ? 'var(--primary-g)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${s.date===selectedDay ? 'rgba(250,204,21,0.3)' : 'var(--border)'}`,
                      borderRadius:12,padding:'8px 6px'
                    }}>
                      <p style={{fontSize:'0.6rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>
                        {new Date(s.date).toLocaleDateString('en-GB',{month:'short'})}
                      </p>
                      <p style={{fontSize:'1.3rem',fontWeight:900,lineHeight:1,fontFamily:'Outfit,sans-serif',
                        color: s.date===selectedDay ? 'var(--primary)' : 'var(--text)'}}>
                        {new Date(s.date).getDate()}
                      </p>
                    </div>
                    <div>
                      <p style={{fontWeight:700,fontSize:'1rem',marginBottom:3,fontFamily:'Outfit,sans-serif'}}>{s.day}</p>
                      <div className="slot-time">
                        <Clock size={12}/>
                        <span>{s.start} – {s.end}</span>
                        <span style={{fontSize:'0.7rem',color:'var(--muted)'}}>· 6 hrs</span>
                      </div>
                    </div>
                  </div>
                  {/* Right: badge */}
                  <span className="slot-chip off">Outage</span>
                </div>
              ))}
            </div>

            <button className="action-btn primary fu fu5" style={{width:'100%'}}
              onClick={() => exportICS(userInfo.region.name, userInfo.group, userInfo.area, mySlots)}>
              <Calendar size={16} /> Export Full Week to Calendar
            </button>
          </>
        )}

        {/* ══════════ COMMUNITY TAB ══════════ */}
        {tab === 'community' && (
          <>
            <div className="section-hd fu" style={{marginTop:8,marginBottom:16}}>
              <h3>Community Reports</h3>
              <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{reports.length} reports</span>
            </div>

            <div className="report-row fu fu1">
              <button className="report-btn success" onClick={()=>handleReport('on')}>
                <Zap size={15} color="var(--primary)"/> Report Power ON
              </button>
              <button className="report-btn danger" onClick={()=>handleReport('off')}>
                <AlertTriangle size={15} color="var(--danger)"/> Report Outage
              </button>
            </div>

            <div className="alert-card fu fu2" style={{marginTop:16,padding:'4px 20px'}}>
              {reports.map((r, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-av">{initials(r.user)}</div>
                  <div style={{flex:1}}>
                    <div>
                      <span className="feed-user">{r.user}</span>
                      <span className="feed-when">{r.time}</span>
                      <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟢 ON'}</span>
                    </div>
                    <p className="feed-text">{r.text}</p>
                    <div className="vote-row">
                      <button className="vote-btn" onClick={()=>handleVote(i,'up')}><ThumbsUp size={12}/>{r.upvotes}</button>
                      <button className="vote-btn" onClick={()=>handleVote(i,'down')}><ThumbsDown size={12}/>{r.downvotes}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ ALERTS TAB ══════════ */}
        {tab === 'alerts' && (
          <>
            <div className="area-header fu" style={{marginBottom:16}}>
              <div className="area-tag"><Bell size={11}/> Alert Settings</div>
              <h2 className="area-name" style={{fontSize:'1.3rem'}}>My Alerts</h2>
              <p className="area-meta">{userInfo.area}</p>
            </div>

            {/* Master toggle */}
            <div className="alert-card fu fu1">
              <div className="alert-row">
                <div className="alert-info">
                  <h4>Push Notifications</h4>
                  <p>{notifEnabled ? 'Alerts are active for your browser' : 'Enable browser notifications'}</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifEnabled}
                    onChange={() => notifEnabled ? setNotifEnabled(false) : handleEnableNotif()} />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
              <div className="alert-row">
                <div className="alert-info">
                  <h4>1 Hour Before Outage</h4>
                  <p>Get a heads-up before power goes out</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={alertOneHr} onChange={() => setAlertOneHr(p=>!p)} />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
              <div className="alert-row">
                <div className="alert-info">
                  <h4>Morning Summary</h4>
                  <p>Daily 7am reminder of today's schedule</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={alertMorning} onChange={() => setAlertMorning(p=>!p)} />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
              <div className="alert-row">
                <div className="alert-info">
                  <h4>Power Restored Alert</h4>
                  <p>Notify me when outage is expected to end</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={alertRestore} onChange={() => setAlertRestore(p=>!p)} />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
            </div>

            {/* Calendar export */}
            <div className="alert-card fu fu2">
              <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Calendar Integration</h3>
              <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:16,lineHeight:1.6}}>
                Save all your outage slots to Google Calendar, Apple Calendar, or Outlook. The file includes a 1-hour reminder alarm.
              </p>
              <button className="action-btn primary" style={{width:'100%'}}
                onClick={() => exportICS(userInfo.region.name, userInfo.group, userInfo.area, mySlots)}>
                <Calendar size={16}/> Export {mySlots.length} Outage{mySlots.length!==1?'s':''} to Calendar
              </button>
            </div>

            {/* Share */}
            <div className="alert-card fu fu3">
              <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Share with Family</h3>
              <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:12,lineHeight:1.6}}>
                Let others know about DumsorTracker so they can check their own schedule.
              </p>
              <button className="action-btn" style={{width:'100%'}} onClick={handleShare}>
                <Share2 size={16}/> Share DumsorTracker
              </button>
            </div>
          </>
        )}

        {/* ══════════ SEARCH TAB ══════════ */}
        {tab === 'search' && (
          <div style={{paddingTop:8}}>
            <h3 className="fu" style={{fontSize:'1.1rem',marginBottom:16}}>Search Any Area</h3>
            <Onboarding onSelect={info => { setUserInfo(info); setTab('home'); }} />
          </div>
        )}
      </div>

      {/* ── Bottom Tab Bar ── */}
      <div className="tab-bar">
        {[
          { id:'home',      icon:Home,           label:'Home'      },
          { id:'schedule',  icon:CalendarDays,   label:'Schedule'  },
          { id:'community', icon:MessageSquare,  label:'Community' },
          { id:'alerts',    icon:Bell,           label:'Alerts'    },
        ].map(({ id, icon:Icon, label }) => (
          <button key={id} className={`tab-item ${tab===id?'active':''}`} onClick={() => setTab(id)}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
