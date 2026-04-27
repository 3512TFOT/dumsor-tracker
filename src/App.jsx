import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import ReportModal from './components/ReportModal';
import { SCHEDULE_DATES, getCurrentOutageGroups, getNextSlot } from './data';
import {
  Zap, Power, PowerOff, Bell, BellOff, Calendar, Search,
  Home, CalendarDays, MessageSquare,
  CheckCircle, XCircle, ThumbsUp, ThumbsDown,
  AlertTriangle, Share2, MapPin, Clock, ChevronRight
} from 'lucide-react';

function initials(n) { return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }

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

function scheduleAlert(area, date, start) {
  if (Notification.permission!=='granted') return;
  const alertTime = new Date(`${date}T${start}:00`).getTime() - 3600000;
  const delay = alertTime - Date.now();
  if (delay>0 && delay<86400000) {
    setTimeout(()=>new Notification('⚡ DumsorTracker',{
      body:`Power outage in ${area} starts in 1 hour (${start})`,
      icon:'/favicon.ico'
    }), delay);
  }
}

export default function App() {
  const [userInfo, setUserInfo]           = useState(null);
  const [tab, setTab]                     = useState('home');
  const [selectedDay, setSelectedDay]     = useState(null);
  const [notifEnabled, setNotifEnabled]   = useState(false);
  const [alertOneHr, setAlertOneHr]       = useState(true);
  const [alertMorning, setAlertMorning]   = useState(true);
  const [alertRestore, setAlertRestore]   = useState(false);
  const [showBanner, setShowBanner]       = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [reports, setReports]             = useState([
    { user:'Kwesi A.',  text:'Power just went off in East Legon — 10 mins early!', time:'2m ago',  type:'off', upvotes:14, downvotes:0 },
    { user:'Amma O.',   text:'Osu still on. Fingers crossed 🤞',                   time:'18m ago', type:'on',  upvotes:7,  downvotes:1 },
    { user:'Nana B.',   text:'Sakumono came back on at 18:05 — right on time!',    time:'35m ago', type:'on',  upvotes:9,  downvotes:0 },
    { user:'Esi M.',    text:'Adabraka still off as of 7pm. Anyone else?',         time:'1h ago',  type:'off', upvotes:4,  downvotes:0 },
  ]);

  useEffect(()=>{
    if (!selectedDay) {
      const t = new Date().toISOString().split('T')[0];
      setSelectedDay((SCHEDULE_DATES.find(d=>d.date===t)||SCHEDULE_DATES[0]).date);
    }
  },[selectedDay]);

  const status = useMemo(()=>{
    if (!userInfo) return {isPowerOn:true,next:''};
    const isOff = getCurrentOutageGroups().includes(userInfo.group);
    const next  = getNextSlot(userInfo.group);
    return { isPowerOn:!isOff, next: next?`${next.day}, ${next.start} – ${next.end}`:'No more outages this week' };
  },[userInfo]);

  const mySlots = useMemo(()=>{
    if (!userInfo) return [];
    return SCHEDULE_DATES.flatMap(d=>d.slots.filter(s=>s.group===userInfo.group).map(s=>({...s,date:d.date,day:d.day})));
  },[userInfo]);

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
        mySlots.forEach(s=>scheduleAlert(userInfo.area,s.date,s.start));
        new Notification('✅ DumsorTracker',{body:`Alerts on for ${userInfo.area}. We'll warn you 1hr before outages.`});
      }
    });
  },[mySlots,userInfo]);

  const handleVote = (i,dir)=>setReports(prev=>prev.map((r,idx)=>idx!==i?r:{...r,[dir==='up'?'upvotes':'downvotes']:r[dir==='up'?'upvotes':'downvotes']+1}));

  const handleReport = ({type,text})=>setReports(prev=>[{user:'You',text,time:'Just now',type,upvotes:0,downvotes:0},...prev]);

  const handleShare = ()=>{
    if (navigator.share) navigator.share({title:'DumsorTracker Ghana',text:'Check your power outage schedule!',url:window.location.href});
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
  };

  if (!userInfo) return <Onboarding onSelect={info=>{setUserInfo(info);setTab('home');}}/>;

  const today = new Date().toISOString().split('T')[0];

  /* Power icon color helper */
  const iconColor = status.isPowerOn ? 'var(--primary)' : 'var(--danger)';

  return (
    <>
      {showModal && <ReportModal area={userInfo.area} onSubmit={handleReport} onClose={()=>setShowModal(false)}/>}

      <div className="app-shell">
        {/* Top Nav */}
        <div className="top-nav">
          <div className="nav-logo">
            <div className="nav-logo-icon"><Zap size={18} color="#000" fill="#000"/></div>
            <h1>DumsorTracker</h1>
          </div>
          <div className="nav-actions">
            <button className="icon-btn" onClick={()=>setTab('search')}><Search size={17}/></button>
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
            <p className="area-meta">Load Management · Apr 25 – May 1, 2026</p>
            <button className="change-area-btn" onClick={()=>setUserInfo(null)}>Change area</button>
          </div>

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

          <div className={`power-card ${status.isPowerOn?'on':'off'} fu fu2`}>
            <div className="power-card-glow"/>
            <div className="power-row">
              <div className="power-icon">
                {status.isPowerOn?<Power size={22} color={iconColor}/>:<PowerOff size={22} color={iconColor}/>}
              </div>
              <div>
                <div className="power-status-label">
                  <span style={{width:6,height:6,borderRadius:'50%',background:iconColor,display:'inline-block',animation:'ripple 2s infinite'}}/>
                  {status.isPowerOn?'Power is Stable':'Outage Active'}
                </div>
                <div className="power-headline">{status.isPowerOn?'Power is ON':'Power is OFF'}</div>
                <p className="power-next">{status.isPowerOn?'Next outage: ':'Expected restoration: '}<strong>{status.next}</strong></p>
              </div>
            </div>
            <p style={{fontSize:'0.76rem',color:'var(--muted)',marginBottom:8}}>Is this correct for your area?</p>
            <div className="confirm-row">
              <button className="confirm-btn yes" onClick={()=>setShowModal(true)}><CheckCircle size={15}/> Yes, power is ON</button>
              <button className="confirm-btn no"  onClick={()=>setShowModal(true)}><XCircle size={15}/> No, it's OFF</button>
            </div>
          </div>

          <div className="action-row fu fu3">
            <button className="action-btn primary" onClick={()=>exportICS(userInfo.group,userInfo.area,mySlots)}>
              <Calendar size={16}/> Add to Calendar
            </button>
            <button className="action-btn" onClick={handleShare}><Share2 size={16}/> Share</button>
          </div>

          <div className="section-hd fu fu3">
            <h3>This Week</h3>
            <a href="#" onClick={e=>{e.preventDefault();setTab('schedule');}}>View schedule <ChevronRight size={14} style={{verticalAlign:'middle'}}/></a>
          </div>

          <div className="week-strip fu fu4">
            {SCHEDULE_DATES.map(d=>{
              const hasOutage = d.slots.some(s=>s.group===userInfo.group);
              return (
                <div key={d.date}
                  className={`week-day ${hasOutage?'outage':''} ${d.date===today?'today':''} ${d.date===selectedDay?'selected':''}`}
                  onClick={()=>{setSelectedDay(d.date);setTab('schedule');}}>
                  <span className="week-day-abbr">{d.day.slice(0,3).toUpperCase()}</span>
                  <span className="week-day-num">{new Date(d.date).getDate()}</span>
                  <span className="week-day-dot" style={{background:hasOutage?'var(--danger)':'rgba(255,255,255,0.15)'}}/>
                </div>
              );
            })}
          </div>

          <div className="section-hd fu fu5">
            <h3>Nearby Reports</h3>
            <a href="#" onClick={e=>{e.preventDefault();setTab('community');}}>See all <ChevronRight size={14} style={{verticalAlign:'middle'}}/></a>
          </div>
          <div className="alert-card fu fu5" style={{padding:'16px 20px'}}>
            {reports.slice(0,2).map((r,i)=>(
              <div key={i} className="feed-item">
                <div className="feed-av">{initials(r.user)}</div>
                <div>
                  <span className="feed-user">{r.user}</span><span className="feed-when">{r.time}</span>
                  <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟡 ON'}</span>
                  <p className="feed-text">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── SCHEDULE ── */}
        {tab==='schedule' && <>
          <div className="area-header fu" style={{marginBottom:16}}>
            <div className="area-tag"><Clock size={11}/> {userInfo.region.name} · Group {userInfo.group}</div>
            <h2 className="area-name" style={{fontSize:'1.3rem'}}>My Outage Schedule</h2>
            <p className="area-meta">{userInfo.area} · Apr 25 – May 1, 2026</p>
            <button className="change-area-btn" onClick={()=>setUserInfo(null)}>Change area</button>
          </div>

          <div className="week-strip fu fu1">
            {SCHEDULE_DATES.map(d=>{
              const hasOutage = d.slots.some(s=>s.group===userInfo.group);
              return (
                <div key={d.date}
                  className={`week-day ${hasOutage?'outage':''} ${d.date===today?'today':''} ${d.date===selectedDay?'selected':''}`}
                  onClick={()=>setSelectedDay(d.date)}>
                  <span className="week-day-abbr">{d.day.slice(0,3).toUpperCase()}</span>
                  <span className="week-day-num">{new Date(d.date).getDate()}</span>
                  <span className="week-day-dot" style={{background:hasOutage?'var(--danger)':'rgba(255,255,255,0.15)'}}/>
                </div>
              );
            })}
          </div>

          {dayDetail && (
            <div className="outage-detail fu fu2">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <p style={{fontSize:'0.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,marginBottom:4}}>
                    {dayDetail.mySlot?'⚡ Outage Scheduled':'✓ No Outage'}
                  </p>
                  <h2 style={{fontSize:'1.8rem',fontWeight:900,letterSpacing:'-0.03em',lineHeight:1,fontFamily:'Outfit,sans-serif'}}>{dayDetail.day}</h2>
                  <p style={{fontSize:'0.95rem',color:'var(--muted2)',fontWeight:600,marginTop:4}}>
                    {new Date(dayDetail.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
                  </p>
                </div>
                {dayDetail.mySlot ? (
                  <div style={{textAlign:'right'}}>
                    <span className="slot-chip off" style={{display:'block',marginBottom:8}}>Your Outage</span>
                    <p style={{fontSize:'1.15rem',fontWeight:800,color:'var(--danger)',fontFamily:'Outfit,sans-serif'}}>
                      {dayDetail.mySlot.start}<span style={{color:'var(--muted)',fontWeight:400,fontSize:'0.9rem'}}> – </span>{dayDetail.mySlot.end}
                    </p>
                    <p style={{fontSize:'0.72rem',color:'var(--muted)',marginTop:2}}>6 hour outage</p>
                  </div>
                ) : <span style={{fontSize:'0.85rem',color:'var(--muted)'}}>Power stable</span>}
              </div>
              <button className="action-btn" style={{width:'100%'}}
                onClick={()=>exportICS(userInfo.group,userInfo.area,
                  dayDetail.slots.filter(s=>s.group===userInfo.group).map(s=>({...s,date:dayDetail.date,day:dayDetail.day}))
                )}>
                <Calendar size={15}/> Save {dayDetail.day} to Calendar
              </button>
            </div>
          )}

          <div className="section-hd fu fu3" style={{marginTop:4}}>
            <h3>Full Week — My Outages</h3>
            <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{mySlots.length} slot{mySlots.length!==1?'s':''}</span>
          </div>
          <div className="outage-detail fu fu4" style={{padding:'8px 20px'}}>
            {mySlots.length===0 && <p style={{color:'var(--muted)',fontSize:'0.85rem',padding:'12px 0'}}>No outages scheduled for your area this week.</p>}
            {mySlots.map((s,i)=>(
              <div key={i} className="outage-slot" style={{cursor:'pointer'}} onClick={()=>setSelectedDay(s.date)}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{minWidth:52,textAlign:'center',
                    background:s.date===selectedDay?'var(--primary-g)':'rgba(255,255,255,0.04)',
                    border:`1px solid ${s.date===selectedDay?'rgba(250,204,21,0.3)':'var(--border)'}`,
                    borderRadius:12,padding:'8px 6px'}}>
                    <p style={{fontSize:'0.6rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>
                      {new Date(s.date).toLocaleDateString('en-GB',{month:'short'})}
                    </p>
                    <p style={{fontSize:'1.3rem',fontWeight:900,lineHeight:1,fontFamily:'Outfit,sans-serif',color:s.date===selectedDay?'var(--primary)':'var(--text)'}}>
                      {new Date(s.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p style={{fontWeight:700,fontSize:'1rem',marginBottom:3,fontFamily:'Outfit,sans-serif'}}>{s.day}</p>
                    <div className="slot-time"><Clock size={12}/><span>{s.start} – {s.end}</span><span style={{fontSize:'0.7rem',color:'var(--muted)'}}>· 6 hrs</span></div>
                  </div>
                </div>
                <span className="slot-chip off">Outage</span>
              </div>
            ))}
          </div>
          <button className="action-btn primary fu fu5" style={{width:'100%'}} onClick={()=>exportICS(userInfo.group,userInfo.area,mySlots)}>
            <Calendar size={16}/> Export Full Week to Calendar
          </button>
        </>}

        {/* ── COMMUNITY ── */}
        {tab==='community' && <>
          <div className="section-hd fu" style={{marginTop:8,marginBottom:16}}>
            <h3>Community Reports</h3>
            <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{reports.length} reports</span>
          </div>
          <div className="report-row fu fu1">
            <button className="report-btn success" onClick={()=>setShowModal(true)}><Zap size={15} color="var(--primary)"/> Power ON</button>
            <button className="report-btn danger"  onClick={()=>setShowModal(true)}><AlertTriangle size={15} color="var(--danger)"/> Report Outage</button>
          </div>
          <div className="alert-card fu fu2" style={{marginTop:16,padding:'4px 20px'}}>
            {reports.map((r,i)=>(
              <div key={i} className="feed-item">
                <div className="feed-av">{initials(r.user)}</div>
                <div style={{flex:1}}>
                  <div><span className="feed-user">{r.user}</span><span className="feed-when">{r.time}</span>
                    <span className={`feed-type ${r.type}`}>{r.type==='off'?'🔴 OFF':'🟡 ON'}</span>
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
          <div className="alert-card fu fu2">
            <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Calendar Integration</h3>
            <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:16,lineHeight:1.6}}>
              Save your outage slots to Google Calendar, Apple Calendar, or Outlook. Includes a 1-hour reminder.
            </p>
            <button className="action-btn primary" style={{width:'100%'}} onClick={()=>exportICS(userInfo.group,userInfo.area,mySlots)}>
              <Calendar size={16}/> Export {mySlots.length} Outage{mySlots.length!==1?'s':''} to Calendar
            </button>
          </div>
          <div className="alert-card fu fu3">
            <h3 style={{fontSize:'0.95rem',marginBottom:4}}>Share with Family</h3>
            <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:12,lineHeight:1.6}}>
              Help others find their schedule by sharing DumsorTracker.
            </p>
            <button className="action-btn" style={{width:'100%'}} onClick={handleShare}><Share2 size={16}/> Share DumsorTracker</button>
          </div>
        </>}

        {/* ── SEARCH ── */}
        {tab==='search' && (
          <div style={{paddingTop:8}}>
            <Onboarding onSelect={info=>{setUserInfo(info);setTab('home');}}/>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {[
          {id:'home',     icon:Home,          label:'Home'},
          {id:'schedule', icon:CalendarDays,  label:'Schedule'},
          {id:'community',icon:MessageSquare, label:'Community'},
          {id:'alerts',   icon:Bell,          label:'Alerts'},
        ].map(({id,icon:Icon,label})=>(
          <button key={id} className={`tab-item ${tab===id?'active':''}`} onClick={()=>setTab(id)}>
            <Icon size={20}/>{label}
          </button>
        ))}
      </div>
    </>
  );
}
