import { useState, useMemo } from 'react';
import { Zap, MapPin, Search } from 'lucide-react';
import { REGIONS_DATA, findArea } from '../regions';

// Flatten all areas for searching
const ALL_AREAS = REGIONS_DATA.flatMap(region =>
  Object.entries(region.groups).flatMap(([group, areas]) =>
    areas.map(area => ({ area, group, region }))
  )
);

export default function Onboarding({ onSelect }) {
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return ALL_AREAS
      .filter(a => a.area.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via OpenStreetMap (Free, no API key needed)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          // Get the most specific neighborhood/suburb available
          const addr = data.address || {};
          const detectedName = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || 'Detected Location';

          // Try to cross-reference this detected name with our Dumsor database
          const dbMatch = findArea(detectedName);

          if (dbMatch) {
            onSelect({ area: dbMatch.areaName, group: dbMatch.group, region: dbMatch.region, lat: latitude, lng: longitude });
          } else {
            // If the specific neighborhood isn't in our DB, just use the name and default to Group A
            onSelect({ area: detectedName, group: 'A', region: REGIONS_DATA[0], lat: latitude, lng: longitude });
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          onSelect({ area: 'Detected Location', group: 'A', region: REGIONS_DATA[0] });
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert('Could not detect location. Please search your area below.');
        setLocating(false);
      }
    );
  };

  return (
    <div className="onboard-shell">
      <div className="onboard-logo">
        <Zap size={28} color="#000" fill="#000" />
      </div>

      <h1 className="onboard-title">
        Know Before<br />The Lights Go Out
      </h1>
      <p className="onboard-sub">
        Search your area to see your personal power outage schedule,
        get alerts before outages start, and report live status to your community.
      </p>

      {/* Search box */}
      <div className="search-box">
        <Search size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
        <input
          placeholder="Search your area e.g. East Legon, Bantama…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-item" onClick={() => onSelect(s)}>
              <MapPin size={14} color="var(--muted)" />
              <span style={{ flex: 1 }}>{s.area}</span>
              <span className="suggestion-region">{s.region.name}</span>
              <span className="suggestion-group">Group {s.group}</span>
            </div>
          ))}
        </div>
      )}

      {/* Locate me */}
      {!navigator.geolocation ? null : (
        <button className="loc-btn" onClick={handleLocate} disabled={locating}>
          <MapPin size={16} />
          {locating ? 'Detecting…' : 'Use my current location'}
        </button>
      )}

      {/* Popular areas */}
      <div style={{ marginTop: 40, maxWidth: 500, width: '100%' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>
          Popular areas
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {['East Legon','Osu','Bantama','Sakumono','Adabraka','Tafo','Keta','Madina','Adum'].map(a => {
            const res = findArea(a);
            if (!res) return null;
            return (
              <button key={a}
                onClick={() => onSelect({ area: res.areaName, group: res.group, region: res.region })}
                style={{ padding: '7px 16px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600,
                  background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted2)',
                  cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = 'var(--primary-g)'; e.target.style.borderColor = 'rgba(250,204,21,0.3)'; e.target.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--card)'; e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted2)'; }}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      <p style={{ marginTop: 40, fontSize: '0.72rem', color: 'var(--muted)' }}>
        © 2026 DumsorTracker Ghana · Built for the community
      </p>
    </div>
  );
}
