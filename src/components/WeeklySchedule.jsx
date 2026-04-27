import { Clock } from 'lucide-react';
import { SCHEDULE_DATES } from '../data';

export default function WeeklySchedule({ selectedGroup }) {
  const slots = SCHEDULE_DATES.flatMap(d =>
    d.slots
      .filter(s => s.group === selectedGroup)
      .map(s => ({ ...s, day: d.day, date: d.date }))
  );

  return (
    <div className="card schedule-section fade-up delay-2">
      <h3>
        Weekly Outage Schedule —&nbsp;
        <span style={{ color: 'var(--blue)', fontWeight: 700 }}>Group {selectedGroup}</span>
      </h3>

      {slots.map((item, i) => {
        const dateObj = new Date(item.date);
        const dayAbbr = item.day.slice(0, 3).toUpperCase();
        const dateNum = dateObj.getDate().toString().padStart(2, '0');
        const month   = dateObj.toLocaleString('default', { month: 'short' });

        return (
          <div key={i} className="schedule-row">
            {/* Day box */}
            <div className="sched-day-box">
              <span className="sched-day-abbr">{dayAbbr}</span>
              <span className="sched-date-str">{dateNum} {month}</span>
            </div>

            {/* Details */}
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.day}</p>
              <div className="sched-time">
                <Clock size={12} />
                {item.start} – {item.end}
                <span style={{ color: 'var(--muted)', fontSize: '0.72rem', marginLeft: 4 }}>
                  (6 hrs)
                </span>
              </div>
            </div>

            {/* Duration */}
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--muted2)' }}>
              6 hours
            </div>

            <span className="outage-badge">Outage</span>
          </div>
        );
      })}

      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>
        Source: ECG Official Load Management Schedule · Apr 25 – May 1, 2026
      </p>
    </div>
  );
}
