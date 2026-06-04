'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// ---------- MAP ICON UTILS ----------
const youIcon = new L.DivIcon({
    className: '',
    html: `
        <div class="w-6 h-6 bg-[#185FA5] rounded-full flex items-center justify-center shadow-md border-2 border-white">
            <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
    `,
});

const hospitalIcon = new L.DivIcon({
    className: '',
    html: `
        <div class="w-6 h-6 bg-[#185FA5] rounded-full flex items-center justify-center shadow-md border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
            </svg>
        </div>
    `,
});

// ---------- FIT BOUNDS ----------
function FitBounds({ userPosition, hospitalPosition }) {
    const map = useMap();

    useEffect(() => {
        if (!userPosition || !hospitalPosition) return;

        const bounds = L.latLngBounds([userPosition, hospitalPosition]);
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, userPosition, hospitalPosition]);

    return null;
}

// ---------- MAP VIEW ----------
function MapView({ userPosition, hospitalPosition, height = 'h-40' }) {
    const routeColor = '#185FA5';

    return (
        <MapContainer
            center={userPosition}
            zoom={13}
            className={`h-full w-full ${height}`}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={userPosition} icon={youIcon} />
            <Marker position={hospitalPosition} icon={hospitalIcon} />

            <Polyline
                positions={[userPosition, hospitalPosition]}
                pathOptions={{
                    color: routeColor,
                    weight: 4,
                    dashArray: '6 4',
                }}
            />

            <FitBounds
                userPosition={userPosition}
                hospitalPosition={hospitalPosition}
            />
        </MapContainer>
    );
}

export default function HospitalInfoCard({ data }) {
    const { decision, location } = data ?? {};
    const facility = decision?.recommendedFacility ?? null;
    if (!facility) return null;

    const hasCoordinates = location?.lat && location?.lng;
    const userPosition = hasCoordinates ? [location.lat, location.lng] : [40.7128, -74.0060];
    const hospitalPosition = facility?.coordinates ?? [40.7150, -74.0020];

    const [expanded, setExpanded] = useState(false);

    return (
        <div className="space-y-3.5">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                {/* MAP (ONLY WHEN NOT EXPANDED) */}
                {!expanded && (
                    <div
                        className="relative h-40 border-b border-slate-200 cursor-pointer"
                        onClick={() => setExpanded(true)}
                    >
                        <MapView
                            userPosition={userPosition}
                            hospitalPosition={hospitalPosition}
                        />
                    </div>
                )}

                {/* CONTENT */}
                <div className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">St. Marys ER</h2>
                            <div className="flex items-center gap-2 mt-1 text-sm font-medium opacity-90">
                                <span className="flex items-center gap-1">⏱ 42 min wait</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">🛏 Beds open</span>
                            </div>
                        </div>
                        <span className="text-sm font-bold tracking-tight">6 min</span>
                    </div>
                </div>
            </div>

            {/* 3. TOKEN MATRIX ASSIGNMENT CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
                {/* Minimalist Binary Square Matrix Graphic Block */}
                <div className="w-12 h-12 border border-[#1A4B84] grid grid-cols-4 p-0.5 gap-0.5 rounded bg-white flex-shrink-0">
                    {[1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0].map((val, idx) => (
                        <div
                            key={idx}
                            className={`rounded-sm ${val === 1 ? 'bg-[#1A4B84]' : 'bg-transparent'}`}
                        />
                    ))}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-wide">LION-4821</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                        James Wilson · show at desk
                    </p>
                </div>
            </div>

            {/* 4. HOSPITAL NOTIFICATION STATUS BANNER */}
            <div className="rounded-2xl border border-[#D2EADA] bg-[#E8F5EE] px-4 py-3.5 flex items-center gap-3 shadow-sm">
                <div className="text-[#207245] flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <p className="text-xs font-bold text-[#1A5C36] leading-relaxed">
                    Hospital notified. Record ready before you arrive.
                    <br />
                    45-minute soft reservation hold placed.
                </p>
            </div>

            {/* EXPANDED MAP MODAL */}
            {expanded && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center"
                    onClick={() => setExpanded(false)}
                >
                    <div
                        className="w-[95vw] h-[90vh] bg-white rounded-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MapView
                            userPosition={userPosition}
                            hospitalPosition={hospitalPosition}
                            height="h-full"
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

