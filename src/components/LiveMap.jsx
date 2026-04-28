import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ reports }) {
  // Only plot reports that have latitude and longitude (from the recent Reverse Geocoding update)
  const mapData = useMemo(() => {
    return reports.filter(r => r.lat && r.lng);
  }, [reports]);

  // Center on Ghana roughly
  const center = [6.5, -1.5]; // Adjusted to focus slightly closer to southern Ghana where most reports are

  return (
    <MapContainer center={center} zoom={6.5} style={{ height: '100%', width: '100%', background: '#141418' }}>
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
            center={[report.lat, report.lng]}
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
