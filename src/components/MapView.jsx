import React, { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

/**
 * MapView — shows all property pins on an OpenStreetMap iframe.
 * Centre of map is fixed on Chaka, Nyeri.
 */
export default function MapView({ properties, onNavigate, locationName = 'Chaka, Nyeri County' }) {
    const [focusedPropertyId, setFocusedPropertyId] = useState(null);

    // Default Chaka town coords if no properties or no coords
    const defaultLat = -0.6167;
    const defaultLon = 37.0;

    // Calculate map bounds
    let centerLat = defaultLat;
    let centerLon = defaultLon;
    let bbox = `${defaultLon - 0.08},${defaultLat - 0.06},${defaultLon + 0.08},${defaultLat + 0.06}`;
    let markerQuery = '';

    const focusedProp = focusedPropertyId ? properties.find(p => p.id === focusedPropertyId) : null;

    if (focusedProp && focusedProp.latitude && focusedProp.longitude) {
        // Zoom tightly on the hovered property and drop a marker
        const lat = Number(focusedProp.latitude);
        const lon = Number(focusedProp.longitude);
        centerLat = lat;
        centerLon = lon;
        bbox = `${lon - 0.005},${lat - 0.005},${lon + 0.005},${lat + 0.005}`;
        markerQuery = `&marker=${lat},${lon}`;
    } else if (properties.length > 0) {
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        let hasCoords = false;

        properties.forEach(p => {
            if (p.latitude && p.longitude) {
                hasCoords = true;
                const lat = Number(p.latitude);
                const lon = Number(p.longitude);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLon = Math.min(minLon, lon);
                maxLon = Math.max(maxLon, lon);
            }
        });

        if (hasCoords) {
            centerLat = (minLat + maxLat) / 2;
            centerLon = (minLon + maxLon) / 2;
            // Add padding
            const latPad = Math.max(0.02, (maxLat - minLat) * 0.2);
            const lonPad = Math.max(0.02, (maxLon - minLon) * 0.2);
            bbox = `${minLon - lonPad},${minLat - latPad},${maxLon + lonPad},${maxLat + latPad}`;
        }
    }

    // Build an OpenStreetMap embed URL (OSM embed only supports a single marker, so we rely on bbox to frame the area)
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${markerQuery}`;

    return (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Map iframe */}
            <div className="relative h-[400px] lg:h-[500px]">
                <iframe
                    title="Chaka Properties Map"
                    src={mapUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                />
                {/* Overlay gradient at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
            </div>

            {/* Property list over map area */}
            <div className="p-4">
                <p className="text-xs text-stone-400 text-center mb-3 font-medium">
                    Showing properties in <span className="font-bold text-stone-600">{locationName || 'Chaka, Nyeri County'}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {properties.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onNavigate(p.id)}
                            onMouseEnter={() => setFocusedPropertyId(p.id)}
                            onMouseLeave={() => setFocusedPropertyId(null)}
                            className={`flex items-start gap-2 p-3 rounded-2xl border transition text-left group
                                ${focusedPropertyId === p.id
                                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                                    : 'border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50'}`}
                        >
                            <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 transition ${focusedPropertyId === p.id ? 'text-emerald-600' : 'text-orange-500 group-hover:text-emerald-600'}`} />
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-stone-900 truncate">{p.name}</div>
                                <div className="text-xs text-emerald-700 font-bold">KES {p.price.toLocaleString()}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <a
                    href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLon}#map=14/${centerLat}/${centerLon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 mt-4 transition"
                >
                    <ExternalLink className="w-3 h-3" /> Open in OpenStreetMap
                </a>
            </div>
        </div>
    );
}
