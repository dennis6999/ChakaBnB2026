import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapPin, ExternalLink, ChevronRight, Star, Navigation, AlertCircle } from 'lucide-react';
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

/**
 * LocateButton — Flies the map to the user's current location.
 */
function LocateButton() {
    const map = useMap();
    const [locating, setLocating] = useState(false);

    const handleLocate = useCallback(() => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1.2 });
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }, [map]);

    return (
        <button
            onClick={handleLocate}
            className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg border border-stone-200 hover:bg-stone-50 active:scale-95 transition"
            title="My location"
        >
            <Navigation className={`w-5 h-5 text-stone-700 ${locating ? 'animate-pulse text-emerald-600' : ''}`} />
        </button>
    );
}

export default function MapView({ properties, onNavigate, onBoundsChange, locationName = 'Chaka, Nyeri County' }) {
    const [focusedPropertyId, setFocusedPropertyId] = useState(null);

    // Chaka Town base
    const defaultCenter = [-0.3551, 36.9989];

    const mappableProperties = properties.filter(p => p.latitude && p.longitude);
    const unmappableCount = properties.length - mappableProperties.length;

    return (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Map Container */}
            <div className="relative h-[400px] lg:h-[600px] w-full z-0">
                <style>{`
                    .leaflet-popup-content-wrapper { padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
                    .leaflet-popup-content { margin: 0; width: 260px !important; }
                    .leaflet-popup-close-button { color: white !important; text-shadow: 0 1px 2px black; font-weight: bold; padding: 4px !important; z-index: 10; }
                    .custom-leaflet-marker { background: transparent; border: none; }
                `}</style>
                {mappableProperties.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-stone-50">
                        <AlertCircle className="w-12 h-12 text-stone-300 mb-3" />
                        <h3 className="text-lg font-bold text-stone-700 mb-1">No map data available</h3>
                        <p className="text-sm text-stone-500">Properties in this area don't have coordinates set yet.</p>
                    </div>
                ) : (
                    <>
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

                            <BoundsFitter properties={mappableProperties} />
                            <MapEventsListener onBoundsChange={onBoundsChange} />
                            <LocateButton />

                            {mappableProperties.map(property => (
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
                                            <div className="aspect-[16/9] w-full overflow-hidden relative">
                                                <img src={property.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={property.name} />
                                                {/* Type badge */}
                                                <span className="absolute top-2 left-2 bg-emerald-700/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                                                    {property.type}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-white">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-bold text-stone-900 truncate flex-1">{property.name}</h4>
                                                    {property.rating > 0 && (
                                                        <div className="flex items-center gap-0.5 bg-emerald-900 text-white px-1.5 py-0.5 rounded text-[11px] font-bold flex-shrink-0">
                                                            <Star className="w-3 h-3 fill-current" /> {Number(property.rating).toFixed(1)}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-stone-500 mb-2 truncate">{property.bedrooms || '–'} bed{property.bedrooms !== 1 ? 's' : ''} • {property.guests || '–'} guest{property.guests !== 1 ? 's' : ''}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-emerald-700">KES {property.price.toLocaleString()}<span className="text-stone-400 text-xs font-normal">/night</span></span>
                                                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition" />
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </>
                )}
            </div>

            {/* Interactive Property List Overlay/Below */}
            <div className="p-4 bg-white border-t border-stone-200">
                <p className="text-xs text-stone-400 text-center mb-3 font-medium">
                    Showing <span className="font-bold text-stone-600">{mappableProperties.length}</span> propert{mappableProperties.length === 1 ? 'y' : 'ies'} in <span className="font-bold text-stone-600">{locationName || 'Chaka, Nyeri County'}</span>
                    {unmappableCount > 0 && <span className="text-orange-500"> • {unmappableCount} without map data</span>}
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
                            <div className="flex items-center gap-1 mt-0.5">
                                {p.rating > 0 && <span className="text-[10px] text-stone-400">★ {Number(p.rating).toFixed(1)}</span>}
                            </div>
                            <div className={`text-xs font-bold mt-1 ${focusedPropertyId === p.id ? 'text-orange-700' : 'text-emerald-700'}`}>KES {p.price.toLocaleString()}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

