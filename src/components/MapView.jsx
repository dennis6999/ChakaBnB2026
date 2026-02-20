import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

/**
 * MapView — shows all property pins on an OpenStreetMap iframe.
 * Centre of map is fixed on Chaka, Nyeri.
 */
export default function MapView({ properties, onNavigate }) {
    // Chaka town approx coords
    const centerLat = -0.6167;
    const centerLon = 37.0;

    // Build an OpenStreetMap embed URL with a marker for Chaka
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLon - 0.08}%2C${centerLat - 0.06}%2C${centerLon + 0.08}%2C${centerLat + 0.06}&layer=mapnik&marker=${centerLat}%2C${centerLon}`;

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
                    Showing properties in <span className="font-bold text-stone-600">Chaka, Nyeri County</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {properties.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onNavigate(p.id)}
                            className="flex items-start gap-2 p-3 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50 transition text-left group"
                        >
                            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5 group-hover:text-emerald-700 transition" />
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
