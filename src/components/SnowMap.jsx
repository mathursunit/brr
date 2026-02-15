import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createRankIcon(rank, value, unit, isCold) {
    // Scaled sizes (original * 0.75)
    // 48->36, 40->30, 32->24
    const size = rank === 1 ? 36 : rank <= 3 ? 30 : 24;
    const bgColor = isCold
        ? rank === 1 ? '#3384fc' : rank <= 3 ? '#0ca5eb' : '#356ec1'
        : rank === 1 ? '#f97316' : rank <= 3 ? '#fb923c' : '#3384fc';

    return L.divIcon({
        className: 'custom-map-marker',
        html: `
      <div style="
        background: ${bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white; /* thinner border for smaller scale */
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span style="font-size: ${rank === 1 ? '10px' : '9px'}; font-weight: 800; line-height: 1;">#${rank}</span>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
        }
    }, [positions, map]);
    return null;
}

export default function SnowMap({ rankings = [], isColdMode = false, onCityClick }) {
    const positions = useMemo(
        () => rankings.filter(r => r.lat && r.lon).map(r => [r.lat, r.lon]),
        [rankings]
    );

    const unit = isColdMode ? '°F' : '"';
    const metricKey = isColdMode ? 'lowest_temp' : 'total_snow';

    if (rankings.length === 0) return null;

    return (
        <div className="rounded-2xl overflow-hidden border border-frost-200 dark:border-ice-400/10 shadow-lg">
            <MapContainer
                center={[42, -80]}
                zoom={5}
                // Converted 380px -> ~24rem (h-96)
                className="z-0 h-96 w-full"
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <FitBounds positions={positions} />

                {rankings.filter(r => r.lat && r.lon).map((r) => (
                    <Marker
                        key={r.id}
                        position={[r.lat, r.lon]}
                        icon={createRankIcon(r.rank, r[metricKey], unit, isColdMode)}
                        eventHandlers={{
                            click: () => onCityClick && onCityClick(r)
                        }}
                    >
                        <Popup>
                            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
                                <strong style={{ fontSize: '14px' }}>#{r.rank} {r.city}, {r.state}</strong>
                                <br />
                                <span style={{ fontSize: '18px', fontWeight: 700, color: isColdMode ? '#3384fc' : '#f97316' }}>
                                    {r[metricKey]}{unit}
                                </span>
                                {!isColdMode && r.avg_annual > 0 && (
                                    <>
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#666' }}>Avg: {r.avg_annual}" per season</span>
                                    </>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
