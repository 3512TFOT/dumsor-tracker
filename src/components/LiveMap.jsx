import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ reports }) {
  // Only plot reports that have latitude and longitude (from the recent Reverse Geocoding update)
  const mapData = useMemo(() => {
    return reports
      .filter(r => r.lat && r.lng)
      .map(r => {
        // Add a tiny random offset (approx 0 to 800 meters) so that reports from the same neighborhood
        // scatter visually and form a cluster, rather than perfectly stacking and hiding each other.
        const jitterLat = r.lat + (Math.random() - 0.5) * 0.015;
        const jitterLng = r.lng + (Math.random() - 0.5) * 0.015;
        return { ...r, jitterLat, jitterLng };
      });
  }, [reports]);

  // Center on Ghana roughly as a fallback
  const center = [6.5, -1.5];

  // Helper component to auto-zoom the map
  const MapBounds = ({ data }) => {
    const map = useMap();
    const hasFitted = useRef(false);

    useEffect(() => {
      if (!data || data.length === 0 || hasFitted.current) return;
      
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      data.forEach(d => {
        if (d.jitterLat < minLat) minLat = d.jitterLat;
        if (d.jitterLat > maxLat) maxLat = d.jitterLat;
        if (d.jitterLng < minLng) minLng = d.jitterLng;
        if (d.jitterLng > maxLng) maxLng = d.jitterLng;
      });

      if (minLat !== 90) {
        map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [40, 40], maxZoom: 13 });
        hasFitted.current = true;
      }
    }, [data, map]);
    return null;
  };

  return (
    <MapContainer center={center} zoom={6.5} style={{ height: '100%', width: '100%', background: '#141418' }}>
      <MapBounds data={mapData} />
      {/* Dark themed map tiles to match the DumsorTracker aesthetic */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      />
      
      {mapData.map((report, idx) => {
        const isPowerOn = report.type === 'on';
        // Green for ON, Red for OFF
        const color = isPowerOn ? '#22c55e' : '#ef4444'; 
        
        return (
          <CircleMarker
            key={report.id || idx}
            center={[report.jitterLat, report.jitterLng]}
            pathOptions={{ color: color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
            radius={8}
          >
            <Popup>
              <div style={{ color: '#000', fontFamily: 'Inter, sans-serif' }}>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: 4 }}>{report.area}</strong>
                <span style={{ color: color, fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {isPowerOn ? '⚡ Power is ON' : '🔴 Power is OFF'}
                </span>
                {report.text && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    "{report.text}"
                  </p>
                )}
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#666' }}>
                  Reported by: {report.user || 'Anonymous'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
