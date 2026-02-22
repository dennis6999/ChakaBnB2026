import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

/**
 * BoundsFitter Component — Invisible component that calculates bounds
 * of all markers and animates the map to fit them perfectly on load.
 */
function BoundsFitter({ properties }) {
    const map = useMap();

    useEffect(() => {
        if (!properties || properties.length === 0) return;

        // Fit all properties in view
        const coords = properties
            .filter(p => p.latitude && p.longitude)
            .map(p => [Number(p.latitude), Number(p.longitude)]);

        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        }
    }, [properties, map]);

    return null;
}

/**
 * Listens for user panning/zooming and broadcasts the new bounds.
 */
function MapEventsListener({ onBoundsChange }) {
    const map = useMapEvents({
        moveend: () => {
            if (onBoundsChange) onBoundsChange(map.getBounds());
        },
        zoomend: () => {
            if (onBoundsChange) onBoundsChange(map.getBounds());
        }
    });

    useEffect(() => {
        if (onBoundsChange && map) {
            onBoundsChange(map.getBounds());
        }
    }, [map, onBoundsChange]);

    return null;
}

/**
 * Creates a premium HTML Marker (Price Pill)
 */
const createPriceIcon = (price, isActive) => {
    return L.divIcon({
        className: 'custom-leaflet-marker', // Handled heavily by tailwind inside the HTML
        html: `
            <div class="transition-all duration-300 transform ${isActive ? 'scale-110 z-50' : 'hover:scale-105'} flex items-center justify-center -translate-x-1/2 -translate-y-full">
                <div class="font-bold text-sm px-3 py-1.5 rounded-full shadow-lg border-2 ${isActive ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-stone-900 border-stone-200'}">
                    KES ${price.toLocaleString()}
                </div>
                <div class="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 ${isActive ? 'bg-orange-600 border-orange-600' : 'bg-white border-stone-200'}"></div>
            </div>
        `,
        iconAnchor: [0, 0], // Anchor managed by translate in HTML
    });
};

export default function MapView({ properties, onNavigate, onBoundsChange, locationName = 'Chaka, Nyeri County' }) {
    const [focusedPropertyId, setFocusedPropertyId] = useState(null);

    // Chaka Town base
    const defaultCenter = [-0.3551, 36.9989];

    return (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Map Container */}
            <div className="relative h-[400px] lg:h-[600px] w-full z-0">
                <style>{`
                    .leaflet-popup-content-wrapper { padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                    .leaflet-popup-content { margin: 0; width: 240px !important; }
                    .leaflet-popup-close-button { color: white !important; text-shadow: 0 1px 2px black; font-weight: bold; padding: 4px !important; }
                    .custom-leaflet-marker { background: transparent; border: none; }
                `}</style>
                <MapContainer
                    center={defaultCenter}
                    zoom={12}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    <BoundsFitter properties={properties} />
                    <MapEventsListener onBoundsChange={onBoundsChange} />

                    {properties.filter(p => p.latitude && p.longitude).map(property => (
                        <Marker
                            key={property.id}
                            position={[Number(property.latitude), Number(property.longitude)]}
                            icon={createPriceIcon(property.price, focusedPropertyId === property.id)}
                            eventHandlers={{
                                mouseover: () => setFocusedPropertyId(property.id),
                                mouseout: () => setFocusedPropertyId(null)
                            }}
                        >
                            <Popup className="premium-popup">
                                <div className="group cursor-pointer flex flex-col" onClick={() => onNavigate(property.id)}>
                                    <div className="h-32 w-full overflow-hidden relative">
                                        <img src={property.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={property.name} />
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h4 className="font-bold text-stone-900 truncate">{property.name}</h4>
                                        <p className="text-sm text-stone-500 mb-2 truncate">{property.bedrooms} beds • {property.guests} guests</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-emerald-700">KES {property.price.toLocaleString()}</span>
                                            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition" />
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Interactive Property List Overlay/Below */}
            <div className="p-4 bg-white border-t border-stone-200">
                <p className="text-xs text-stone-400 text-center mb-3 font-medium">
                    Showing properties in <span className="font-bold text-stone-600">{locationName || 'Chaka, Nyeri County'}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {properties.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onNavigate(p.id)}
                            onMouseEnter={() => setFocusedPropertyId(p.id)}
                            onMouseLeave={() => setFocusedPropertyId(null)}
                            className={`flex flex-col items-start p-3 rounded-2xl border transition text-left group
                                ${focusedPropertyId === p.id
                                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20'
                                    : 'border-stone-200 hover:border-orange-400 hover:bg-orange-50/50'}`}
                        >
                            <div className="font-bold text-xs text-stone-900 line-clamp-1 w-full">{p.name}</div>
                            <div className={`text-xs font-bold mt-1 ${focusedPropertyId === p.id ? 'text-orange-700' : 'text-emerald-700'}`}>KES {p.price.toLocaleString()}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
