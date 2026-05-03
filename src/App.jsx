import React, { useState, useMemo, useEffect, useCallback, Suspense, lazy, useTransition } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const Onboarding = lazy(() => import('./components/Onboarding'));
const ReportModal = lazy(() => import('./components/ReportModal'));
const LiveMap = lazy(() => import('./components/LiveMap'));
import { SCHEDULE_DATES, getCurrentOutageGroups, getNextSlot } from './data';
import { db } from './firebase';
import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, orderBy, query, limit, serverTimestamp
} from 'firebase/firestore';
import {
  Zap, Power, PowerOff, Bell, BellOff, Calendar, Search,
  Home, CalendarDays, MessageSquare, Map, Activity,
  CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  AlertTriangle, Share2, MapPin, Clock, ChevronRight
} from 'lucide-react';

function initials(n) { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML
    .replace(/[^\w\s\d.,!?'"-]/gi, '') // Strip suspicious characters
    .trim()
    .substring(0, 200);
}

function timeAgo(ts) {
  if (!ts) return 'Just now';
  const sec = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (sec < 60)  return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
  return `${Math.floor(sec/86400)}d ago`;
}

function exportICS(group, area, slots) {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DumsorTracker//EN\n';
  slots.forEach(s => {
    const ds = s.date.replace(/-/g,'')+'T'+s.start.replace(':','')+'00';
    const de = s.date.replace(/-/g,'')+'T'+(s.end==='00:00'?'235959':s.end.replace(':','')+'00');
    ics += `BEGIN:VEVENT\nSUMMARY:⚡ Power Outage – ${area}\nDTSTART:${ds}\nDTEND:${de}\nDESCRIPTION:Planned load shedding – Group ${group}\nALARM:TRIGGER:-PT60M\nEND:VEVENT\n`;
  });
  ics += 'END:VCALENDAR';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
  a.download = `dumsor_${area.replace(/\s+/g,'-')}.ics`;
  a.click();
}

function requestNotif(cb) {
  if (!('Notification' in window)) return cb(false);
  if (Notification.permission==='granted') return cb(true);
  Notification.requestPermission().then(p=>cb(p==='granted'));
}

// Custom hook to persist settings
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {}
  };
  return [storedValue, setValue];
}

// Alert trigger helper (we use this in the unified ticker instead of fire-and-forget timeouts)
function triggerAlert(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}

export default function App() {
  const [userInfo, setUserInfo]           = useLocalStorage('dumsor_user', null);
  const [tab, setTab]                     = useState('home');
  const [selectedDay, setSelectedDay]     = useState(null);
  const [notifEnabled, setNotifEnabled]   = useLocalStorage('dumsor_notif', false);
  const [alertOneHr, setAlertOneHr]       = useLocalStorage('dumsor_alert_1hr', true);
  const [alertMorning, setAlertMorning]   = useLocalStorage('dumsor_alert_morn', true);
  const [alertRestore, setAlertRestore]   = useLocalStorage('dumsor_alert_rest', false);
  const [showBanner, setShowBanner]       = useLocalStorage('dumsor_banner', true);
  const [firedAlerts, setFiredAlerts]     = useLocalStorage('dumsor_fired', {});
  const [lastReport, setLastReport]       = useLocalStorage('dumsor_last_rep', 0);
  const [votedReports, setVotedReports]   = useLocalStorage('dumsor_votes', {});
  const [showModal, setShowModal]         = useState(false);
  const [feedFilter, setFeedFilter]       = useState('local');
  const [reports, setReports]             = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  const [isPending, startTransition]      = useTransition();

  useEffect(()=>{
    if (!selectedDay) {
      const t = new Date().toISOString().split('T')[0];
      const todaySchedule = SCHEDULE_DATES.find(d=>d.date===t);
      startTransition(() => {
        setSelectedDay(todaySchedule ? todaySchedule.date : SCHEDULE_DATES[SCHEDULE_DATES.length - 1].date);
      });
    }
  },[selectedDay]);

  // ── Live Firestore reports ──────────────────────────────
  useEffect(()=>{
    const q = query(
      collection(db,'reports'),
      orderBy('timestamp','desc'),
      limit(500)
    );
    const unsub = onSnapshot(q, snap=>{
      setReports(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      setReportsLoading(false);
    }, ()=>setReportsLoading(false));
    return ()=>unsub();
  },[]);

  const status = useMemo(()=>{
    if (!userInfo) return {isPowerOn:true,next:'',currentSlot:null};
    const isOff = getCurrentOutageGroups().includes(userInfo.group);
    const next  = getNextSlot(userInfo.group);
    return { 
      isPowerOn:!isOff, 
      next: next?`${next.day}, ${next.start} – ${next.end}`:'No more outages this week',
      currentSlot: next
    };
  },[userInfo]);

  const mySlots = useMemo(()=>{
    if (!userInfo) return [];
    return SCHEDULE_DATES.flatMap(d=>d.slots.filter(s=>s.group===userInfo.group).map(s=>({...s,date:d.date,day:d.day})));
  },[userInfo]);

  const localReports = useMemo(()=>{
    if (!userInfo) return reports;
    return reports.filter(r=>r.area === userInfo.area);
  },[reports, userInfo]);

  const isCheckerMode = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastScheduledDate = SCHEDULE_DATES[SCHEDULE_DATES.length - 1].date;
    return today > lastScheduledDate;
  }, []);

  const consensus = useMemo(() => {
    if (!localReports || localReports.length === 0) return null;
    
    const windowMs = 4 * 60 * 60 * 1000; // 4 hour window for live consensus
    const recentReports = localReports.filter(r => {
      const ts = r.timestamp ? (r.timestamp.toMillis ? r.timestamp.toMillis() : Date.now()) : Date.now();
      return (Date.now() - ts) < windowMs;
    });

    if (recentReports.length === 0) {
      const last = localReports[0];
      return { 
        isPowerOn: last.type === 'on', 
        message: `Based on last report ${timeAgo(last.timestamp)}`,
        count: 1,
        isLive: false 
      };
    }

    let on = 0, off = 0;
    recentReports.forEach(r => r.type === 'on' ? on++ : off++);
    const total = on + off;
    
    // 20% Threshold Logic: If 20% or more report an outage, we flag it as OFF
    const isPowerOn = (off / total) < 0.2;

    return { 
      isPowerOn, 
      message: `${total} community reports recently`, 
      count: total,
      isLive: true 
    };
  }, [localReports]);

  const conflictWarning = useMemo(() => {
    if (isCheckerMode || !localReports || localReports.length === 0) return null;
    
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentReports = localReports.filter(r => {
      const ts = r.timestamp ? (r.timestamp.toMillis ? r.timestamp.toMillis() : Date.now()) : Date.now();
      return ts > twoHoursAgo;
    });

    if (recentReports.length < 2) return null;

    let reportedOn = 0, reportedOff = 0;
    recentReports.forEach(r => r.type === 'on' ? reportedOn++ : reportedOff++);

    const total = reportedOn + reportedOff;
    if (status.isPowerOn && (reportedOff / total >= 0.2)) {
      return "ECG Schedule says power should be ON, but community reports indicate it is OFF.";
    }
    if (!status.isPowerOn && (reportedOn / total >= 0.2)) {
      return "ECG Schedule says power should be OFF, but community reports indicate it is ON.";
    }
    return null;
  }, [localReports, status, isCheckerMode]);

  const displayStatus = useMemo(() => {
    if (isCheckerMode) return consensus ? consensus.isPowerOn : true;
    if (conflictWarning) return !status.isPowerOn;
    return status.isPowerOn;
  }, [status.isPowerOn, conflictWarning, isCheckerMode, consensus]);

  const displayedReports = feedFilter==='local' ? localReports : reports;

  // ── Unified Notification Ticker ──────────────────────────────
  useEffect(() => {
    if (!notifEnabled || !userInfo || !mySlots.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      let newFired = { ...firedAlerts };
      let changed = false;

      mySlots.forEach(s => {
        const outTime = new Date(`${s.date}T${s.start}:00`);
        const endTime = new Date(`${s.date}T${s.end==='00:00'?'23:59':s.end}:00`);
        const timeDiff = outTime.getTime() - now.getTime();
        const endDiff = endTime.getTime() - now.getTime();

        // 1-Hour Warning
        if (alertOneHr && timeDiff > 0 && timeDiff <= 3600000 && !newFired[`1hr-${s.date}`]) {
          triggerAlert('⚡ Upcoming Outage', `Power goes off in ${userInfo.area} in 1 hour (${s.start}).`);
          newFired[`1hr-${s.date}`] = true;
          changed = true;
        }

        // Power Restored Alert
        if (alertRestore && endDiff <= 0 && endDiff > -300000 && !newFired[`restored-${s.date}`]) {
          triggerAlert('✅ Power Restored?', `Outage block ended for ${userInfo.area}. Did power come back?`);
          newFired[`restored-${s.date}`] = true;
          changed = true;
        }

        // Morning Summary (7am on outage days)
        if (alertMorning && s.date === todayStr && h === 7 && !newFired[`morn-${todayStr}`]) {
          triggerAlert('📅 Today\'s Schedule', `Your area has an outage today from ${s.start} to ${s.end}.`);
          newFired[`morn-${todayStr}`] = true;
          changed = true;
        }
      });

      if (changed) setFiredAlerts(newFired);
    }, 15000); // check every 15s

    return () => clearInterval(interval);
  }, [notifEnabled, userInfo, mySlots, alertOneHr, alertMorning, alertRestore, firedAlerts]);

  const dayDetail = useMemo(()=>{
    if (!selectedDay||!userInfo) return null;
    const d = SCHEDULE_DATES.find(x=>x.date===selectedDay);
    if (!d) return null;
    return {...d, mySlot: d.slots.find(s=>s.group===userInfo.group)||null};
  },[selectedDay,userInfo]);

  const handleEnableNotif = useCallback(()=>{
    requestNotif(ok=>{
      setNotifEnabled(ok); setShowBanner(false);
      if (ok && userInfo) {
        triggerAlert('✅ DumsorTracker', `Alerts active for ${userInfo.area}. We'll keep you updated.`);
      }
    });
  },[userInfo]);

  const handleVote = async (i, dir) => {
    const r = reports[i];
    if (!r?.id) return;
    if (votedReports[r.id]) {
      alert('You have already voted on this report.');
      return;
    }
    const field = dir==='up' ? 'upvotes' : 'downvotes';
    await updateDoc(doc(db,'reports',r.id), { [field]: (r[field]||0)+1 });
    setVotedReports(prev => ({ ...prev, [r.id]: true }));
  };

  const handleReport = async ({type,text})=>{
    const now = Date.now();
    if (now - lastReport < 300000) { // 5 minutes cooldown
      alert('Please wait a few minutes before submitting another report.');
      return;
    }
    
    // Robust sanitization
    const cleanText = sanitizeText(text);
    if (!cleanText) return;

    await addDoc(collection(db,'reports'),{
      user: 'Anonymous',
      text: cleanText,
      type: type === 'off' ? 'off' : 'on',
      area: userInfo?.area || 'Unknown',
      region: userInfo?.region?.name || '',
      lat: userInfo?.lat || null,
      lng: userInfo?.lng || null,
      upvotes: 0,
      downvotes: 0,
      timestamp: serverTimestamp(),
    });

    setLastReport(now);
    setShowModal(false);
  };

  const handleShare = ()=>{
    if (navigator.share) navigator.share({title:'DumsorTracker Ghana',text:'Check your power outage schedule!',url:window.location.href});
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  if (!userInfo) {
    return (
      <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading DumsorTracker...</div>}>
        <Onboarding onSelect={info=>{setUserInfo(info);setTab('home');}}/>
      </Suspense>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  /* Power icon color helper */
  const iconColor = status.isPowerOn ? 'var(--primary)' : 'var(--danger)';

  return (
    <>
      {showModal && (
        <Suspense fallback={<div style={{display:'none'}}/>}>
          <ReportModal area={userInfo.area} onSubmit={handleReport} onClose={()=>setShowModal(false)}/>
        </Suspense>
      )}

      <div className="app-shell">
        {/* Top Nav */}
        <div className="top-nav">
          <div className="nav-logo">
            <div className="nav-logo-icon"><Zap size={18} color="#000" fill="#000"/></div>
            <h1>DumsorTracker</h1>
          </div>
          <div className="nav-actions">
            <button className="icon-btn" onClick={()=>startTransition(()=>setTab('search'))}><Search size={17}/></button>
            <button className={`icon-btn ${notifEnabled?'active':''}`} onClick={handleEnableNotif}>
              {notifEnabled?<Bell size={17}/>:<BellOff size={17}/>}
            </button>
          </div>
        </div>

        {/* ── HOME ── */}
        {tab==='home' && <>
          <div className="area-header fu">
            <div className="area-tag"><MapPin size={11}/> {userInfo.region.name} · Group {userInfo.group}</div>
            <h2 className="area-name">{userInfo.area}</h2>
            <p className="area-meta">{isCheckerMode ? 'Official Schedule Ended' : 'Load Management · Apr 25 – May 1, 2026'}</p>
            <button className="change-area-btn" onClick={()=>setUserInfo(null)}>Change area</button>
          </div>

          {isCheckerMode && (
            <div className="status-banner fu" style={{background:'rgba(250,204,21,0.05)', border:'1px solid rgba(250,204,21,0.1)', padding:'12px 16px', borderRadius:'var(--r)', marginBottom:'12px', display:'flex', gap:'12px', alignItems:'center'}}>
              <div style={{width:32, height:32, borderRadius:'50%', background:'var(--primary-g)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <Zap size={16} color="var(--primary)"/>
              </div>
              <p style={{fontSize:'0.78rem', color:'var(--text2)', lineHeight:1.4, margin:0}}>
                <strong>Official schedule has ended.</strong> We are now relying on live community reports to determine power status in your area.
              </p>
            </div>
          )}

          {showBanner && !notifEnabled && (
            <div className="perm-banner fu fu1">
              <Bell size={20} color="var(--primary)"/>
              <div>
                <h4>Get outage alerts</h4>
                <p>We'll notify you 1 hour before power goes out in {userInfo.area}.</p>
                <div className="perm-actions">
                  <button className="perm-yes" onClick={handleEnableNotif}>Enable Alerts</button>
                  <button className="perm-no" onClick={()=>setShowBanner(false)}>Not now</button>
                </div>
              </div>
            </div>
          )}

          <div className={`power-card ${displayStatus?'on':'off'} fu fu2`}>
            <div className="power-card-glow"/>
            <div className="power-row">
              <div className="power-icon">
                {displayStatus?<Power size={22} color={iconColor}/>:<PowerOff size={22} color={iconColor}/>}
              </div>
              <div>
                <div className="power-status-label">
                  <span style={{width:6,height:6,borderRadius:'50%',background:iconColor,display:'inline-block',animation:'ripple 2s infinite', marginRight:6}}/>
                  {isCheckerMode ? (
                    <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                      <span className="live-badge">LIVE</span> Community Consensus
                    </span>
                  ) : (displayStatus ? 'Power is Stable' : 'Outage Active')}
                </div>
                <div className="power-headline">
                  {displayStatus ? 'Power is ON' : 'Power is OFF'}
                  {isCheckerMode && <span style={{fontSize:'0.7rem', fontWeight:400, marginLeft:8, opacity:0.7}}>(Verified)</span>}
                </div>
                <p className="power-next">
                  {isCheckerMode 
                    ? (consensus ? <span>{consensus.message} <span style={{opacity:0.6}}>({consensus.count} reports)</span></span> : 'No recent reports for this area')
                    : (status.isPowerOn ? 'Next outage: ' : 'Expected restoration: ')
                  }
                  {!isCheckerMode && <strong>{status.next}</strong>}
                </p>
              </div>
            </div>
            {conflictWarning && (
              <div style={{background:'rgba(255,180,0,0.1)', border:'1px solid rgba(255,180,0,0.3)', padding:'10px 14px', borderRadius:'10px', marginBottom:'14px', display:'flex', gap:'10px', alignItems:'flex-start'}}>
                <AlertTriangle size={16} color="#ffb400" style={{flexShrink:0, marginTop:2}}/>
                <p style={{fontSize:'0.75rem', color:'#ffb400', lineHeight:1.4, margin:0}}>{conflictWarning}</p>
              </div>
            )}
            <p style={{fontSize:'0.76rem',color:'var(--muted)',marginBottom:8, fontWeight:500}}>Is your power currently {displayStatus ? 'ON' : 'OFF'}?</p>
            <div className="confirm-row">
              <button className="confirm-btn yes" onClick={()=>setShowModal(true)}>
                <CheckCircle size={15}/> Yes, it is {displayStatus ? 'ON' : 'OFF'}
              </button>
              <button className="confirm-btn no"  onClick={()=>setShowModal(true)}>
                <XCircle size={15}/> No, it is {displayStatus ? 'OFF' : 'ON'}
              </button>
            </div>
          </div>

          <div className="action-row fu fu3">
            {isCheckerMode ? (
              <button className="action-btn primary" onClick={()=>setTab('community')}>
                <MessageSquare size={16}/> Community Feed
              </button>
            ) : (
              <button className="action-btn primary" onClick={()=>exportICS(userInfo.group,userInfo.area,mySlots)}>
                <Calendar size={16}/> Add to Calendar
              </button>
            )}
            <button className="action-btn" onClick={handleShare}><Share2 size={16}/> Share</button>
          </div>

          <div className="section-hd fu fu5">
            <h3>Nearby Reports</h3>
            <a href="#" onClick={e=>{e.preventDefault();setTab('community');}}>See all <ChevronRight size={14} style={{verticalAlign:'middle'}}/></a>
          </div>
          <div className="alert-card fu fu5" style={{padding:'4px 20px'}}>
            {reportsLoading && (
              <p style={{color:'var(--text3)',fontSize:'0.82rem',padding:'16px 0'}}>Loading reports…</p>
            )}
            {!reportsLoading && localReports.length===0 && (
              <p style={{color:'var(--text3)',fontSize:'0.82rem',padding:'16px 0'}}>No reports from {userInfo.area} yet. Be the first!</p>
            )}
            {localReports.slice(0,3).map(r=>(
              <div key={r.id||r.text} className="feed-item">
                <div className="feed-av">{initials(r.user||'?')}</div>
                <div>
                  <span className="feed-user">{r.user}</span>
                  <span className="feed-when">{timeAgo(r.timestamp)}</span>
                  <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟡 ON'}</span>
                  {r.area && <span style={{fontSize:'0.68rem',color:'var(--text3)',marginLeft:5}}>· {r.area}</span>}
                  <p className="feed-text">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── INTELLIGENCE / ANALYTICS ── */}
        {tab==='intelligence' && (
          <div className="fu">
            <div className="area-header" style={{marginBottom:16}}>
              <div className="area-tag"><Activity size={11}/> Grid Intelligence</div>
              <h2 className="area-name" style={{fontSize:'1.3rem'}}>Community Insights</h2>
              <p className="area-meta">Active Outages & Historical Reference</p>
            </div>

            <div className="section-hd">
              <h3>Active Outage Hotspots</h3>
            </div>
            <div className="alert-card" style={{padding:'8px 20px'}}>
              {(() => {
                const hotspots = {};
                reports.filter(r => r.type === 'off').forEach(r => {
                  hotspots[r.area] = (hotspots[r.area] || 0) + 1;
                });
                const sorted = Object.entries(hotspots).sort((a,b) => b[1] - a[1]).slice(0, 5);
                
                if (sorted.length === 0) return <p style={{fontSize:'0.82rem', color:'var(--muted)', padding:'12px 0'}}>No active outages reported recently.</p>;
                
                return sorted.map(([area, count]) => (
                  <div key={area} className="outage-slot">
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <div style={{width:8, height:8, borderRadius:'50%', background:'var(--danger)'}} />
                      <span style={{fontWeight:600, fontSize:'0.9rem'}}>{area}</span>
                    </div>
                    <span className="slot-chip off">{count} Reports</span>
                  </div>
                ));
              })()}
            </div>

            <div className="section-hd" style={{marginTop:24}}>
              <h3>Reference Schedule</h3>
            </div>
            <p style={{fontSize:'0.75rem', color:'var(--muted)', marginBottom:12}}>Historical schedule (Apr 25 – May 1) for your area.</p>
            <div className="week-strip" style={{marginBottom:24}}>
              {SCHEDULE_DATES.map(d=>{
                const hasOutage = d.slots.some(s=>s.group===userInfo.group);
                return (
                  <div key={d.date}
                    className={`week-day ${hasOutage?'outage':''} ${d.date===selectedDay?'selected':''}`}
                    onClick={()=>setSelectedDay(d.date)}>
                    <span className="week-day-abbr">{d.day.slice(0,3).toUpperCase()}</span>
                    <span className="week-day-num">{new Date(d.date).getDate()}</span>
                    <span className="week-day-dot" style={{background:hasOutage?'var(--danger)':'rgba(255,255,255,0.15)'}}/>
                  </div>
                );
              })}
            </div>

            {dayDetail && (
              <div className="alert-card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <h4 style={{margin:0}}>{dayDetail.day}, {new Date(dayDetail.date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</h4>
                  <span style={{fontSize:'0.7rem', color:'var(--muted)'}}>GROUP {userInfo.group}</span>
                </div>
                {dayDetail.mySlot ? (
                  <div className="outage-slot">
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <Clock size={14} color="var(--danger)"/>
                      <span style={{fontWeight:600}}>{dayDetail.mySlot.start} – {dayDetail.mySlot.end}</span>
                    </div>
                    <span className="slot-chip off">Planned Outage</span>
                  </div>
                ) : (
                  <div className="outage-slot">
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <CheckCircle size={14} color="var(--primary)"/>
                      <span style={{fontWeight:600}}>No Outage Scheduled</span>
                    </div>
                    <span className="slot-chip on">Stable</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {tab==='community' && <>
          <div className="section-hd fu" style={{marginTop:8,marginBottom:16}}>
            <h3>Community Reports</h3>
            <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{displayedReports.length} reports</span>
          </div>

          <div className="segmented-control fu">
            <button className={`segment-btn ${feedFilter==='local'?'active':''}`} onClick={()=>setFeedFilter('local')}>My Area</button>
            <button className={`segment-btn ${feedFilter==='all'?'active':''}`} onClick={()=>setFeedFilter('all')}>All Ghana</button>
          </div>
          <div className="report-row fu fu1">
            <button className="report-btn success" onClick={()=>setShowModal(true)}><Zap size={15} color="var(--primary)"/> Power ON</button>
            <button className="report-btn danger"  onClick={()=>setShowModal(true)}><AlertTriangle size={15} color="var(--danger)"/> Report Outage</button>
          </div>
          <div className="alert-card fu fu2" style={{marginTop:16,padding:'4px 20px'}}>
            {reportsLoading && (
              <p style={{color:'var(--text3)',fontSize:'0.82rem',padding:'16px 0'}}>Loading live reports…</p>
            )}
            {!reportsLoading && displayedReports.length===0 && (
              <p style={{color:'var(--text3)',fontSize:'0.82rem',padding:'16px 0'}}>No reports {feedFilter==='local'?`for ${userInfo.area}`:''} yet — be the first to share!</p>
            )}
            {displayedReports.map(r=>(
              <div key={r.id||r.text} className="feed-item">
                <div className="feed-av">{initials(r.user||'?')}</div>
                <div style={{flex:1}}>
                  <div>
                    <span className="feed-user">{r.user}</span>
                    <span className="feed-when">{timeAgo(r.timestamp)}</span>
                    <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟡 ON'}</span>
                    {r.area && <span style={{fontSize:'0.68rem',color:'var(--text3)',marginLeft:5}}>· {r.area}</span>}
                  </div>
                  <p className="feed-text">{r.text}</p>
                  <div className="vote-row">
                    <button className="vote-btn" onClick={()=>handleVote(reports.indexOf(r),'up')}><ThumbsUp size={12}/>{r.upvotes||0}</button>
                    <button className="vote-btn" onClick={()=>handleVote(reports.indexOf(r),'down')}><ThumbsDown size={12}/>{r.downvotes||0}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── ALERTS ── */}
        {tab==='alerts' && <>
          <div className="area-header fu" style={{marginBottom:16}}>
            <div className="area-tag"><Bell size={11}/> Alert Settings</div>
            <h2 className="area-name" style={{fontSize:'1.3rem'}}>My Alerts</h2>
            <p className="area-meta">{userInfo.area}</p>
          </div>
          <div className="alert-card fu fu1">
            {[
              {label:'Push Notifications',sub:notifEnabled?'Active for this browser':'Enable browser alerts',checked:notifEnabled,fn:()=>notifEnabled?setNotifEnabled(false):handleEnableNotif()},
              {label:'1 Hour Before Outage',sub:'Get a heads-up before power goes out',checked:alertOneHr,fn:()=>setAlertOneHr(p=>!p)},
              {label:'Morning Summary',sub:'Daily 7am reminder of today\'s schedule',checked:alertMorning,fn:()=>setAlertMorning(p=>!p)},
              {label:'Power Restored Alert',sub:'Notify me when outage is expected to end',checked:alertRestore,fn:()=>setAlertRestore(p=>!p)},
            ].map((row,i)=>(
              <div key={i} className="alert-row">
                <div className="alert-info"><h4>{row.label}</h4><p>{row.sub}</p></div>
                <label className="toggle">
                  <input type="checkbox" checked={row.checked} onChange={row.fn}/>
                  <span className="toggle-track"/><span className="toggle-thumb"/>
                </label>
              </div>
            ))}
          </div>
          {!isCheckerMode ? (
            <div className="alert-card fu fu2">
              <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Calendar Integration</h3>
              <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:16,lineHeight:1.6}}>
                Save your outage slots to Google Calendar, Apple Calendar, or Outlook. Includes a 1-hour reminder.
              </p>
              <button className="action-btn primary" style={{width:'100%'}} onClick={()=>exportICS(userInfo.group,userInfo.area,mySlots)}>
                <Calendar size={16}/> Export {mySlots.length} Outage{mySlots.length!==1?'s':''} to Calendar
              </button>
            </div>
          ) : (
            <div className="alert-card fu fu2" style={{border:'1px dashed var(--border)'}}>
              <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Schedule-based Alerts</h3>
              <p style={{fontSize:'0.78rem',color:'var(--muted)',lineHeight:1.6}}>
                Official schedule-based alerts are currently inactive as the latest schedule has ended. We are transitioning to <strong>Community-driven notifications</strong> based on live reports.
              </p>
            </div>
          )}
          <div className="alert-card fu fu3">
            <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Share with Family</h3>
            <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:12,lineHeight:1.6}}>
              Help others find their schedule by sharing DumsorTracker.
            </p>
            <button className="action-btn" style={{width:'100%'}} onClick={handleShare}><Share2 size={16}/> Share DumsorTracker</button>
          </div>
        </>}

        {/* ── MAP ── */}
        {tab==='map' && (
          <div className="fu map-container" style={{height:'65vh', width:'100%', borderRadius:'var(--r)', overflow:'hidden', border:'1px solid var(--border)'}}>
             <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--text2)'}}>Loading Map...</div>}>
               <LiveMap reports={reports} />
             </Suspense>
          </div>
        )}

        {/* ── SEARCH ── */}
        {tab==='search' && (
          <div style={{paddingTop:8}}>
            <Suspense fallback={<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading search...</div>}>
              <Onboarding onSelect={info=>{setUserInfo(info);setTab('home');}}/>
            </Suspense>
          </div>
        )}
        {/* Credit */}
        <div className="app-credit">
          Built by <a href="https://github.com/3512TFOT" target="_blank" rel="noreferrer">Kwabena Essuman</a>
          &nbsp;·&nbsp; DumsorTracker Ghana &nbsp;·&nbsp; 2026
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {(() => {
          const NAV = [
            { icon: Home,          label: "Home",           id: "home" },
            { icon: Activity,      label: "Intelligence",   id: "intelligence" },
            { icon: MessageSquare, label: "Community",      id: "community" },
            { icon: Map,           label: "Map",            id: "map" },
            { icon: Bell,          label: "Alerts",         id: "alerts" },
          ];
          return NAV.map(({id, icon: Icon, label}) => (
            <button key={id} className={`tab-item ${tab===id?'active':''}`} onClick={()=>startTransition(()=>setTab(id))}>
              <Icon size={20}/>{label}
            </button>
          ));
        })()}
      </div>
      <SpeedInsights />
    </>
  );
}
