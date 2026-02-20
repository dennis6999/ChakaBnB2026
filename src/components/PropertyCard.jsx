import React from 'react';
import { Heart, Star, MapPin, ChevronRight, Check } from 'lucide-react';

/**
 * Reusable property card used on both the Home featured grid and the Search results list.
 * Pass `variant="list"` for the horizontal search-results layout (default is grid/card).
 */
export default function PropertyCard({
    property,
    isFavorite,
    onToggleFavorite,
    onNavigate,
    onBook,
    variant = 'grid',
}) {
    if (variant === 'list') {
        return (
            <div className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
                {/* Image */}
                <div
                    className="w-full md:w-72 h-64 md:h-auto flex-shrink-0 relative cursor-pointer overflow-hidden rounded-2xl"
                    onClick={() => onNavigate(property.id)}
                >
                    <img
                        src={property.image}
                        alt={`Photo of ${property.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(e, property.id); }}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white hover:text-red-500 transition text-stone-400"
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    {property.roomsLeft && (
                        <div className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            Only {property.roomsLeft} left!
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="cursor-pointer" onClick={() => onNavigate(property.id)}>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {property.type}
                                    </span>
                                    <span className="flex text-orange-400">
                                        {[...Array(Math.floor(property.rating / 2))].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-stone-900 hover:text-orange-600 transition leading-tight mb-1">
                                    {property.name}
                                </h3>
                                <div className="flex items-center text-sm text-stone-500 font-medium">
                                    <MapPin className="w-4 h-4 mr-1 text-emerald-600" /> {property.distance}
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="bg-emerald-900 text-white font-black text-lg px-3 py-1 rounded-xl shadow-sm mb-1">
                                    {property.rating.toFixed(1)}
                                </div>
                                <span className="font-bold text-stone-900 text-sm">{property.reviewText}</span>
                                <span className="text-xs text-stone-500">{property.reviews} reviews</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
                                {property.description}
                            </p>
                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                                <div className="text-sm font-bold text-stone-900 mb-2">{property.roomInfo}</div>
                                <div className="flex flex-wrap gap-2">
                                    {property.features.slice(0, 3).map((f) => (
                                        <span
                                            key={f}
                                            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"
                                        >
                                            <Check className="w-3 h-3" /> {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mt-6 pt-4 border-t border-stone-100 gap-4">
                        <div>
                            <div className="text-2xl font-black text-stone-900 tracking-tight">
                                KES {property.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-stone-500 font-medium mt-0.5">1 night, 2 adults (+ taxes)</div>
                        </div>
                        <button
                            onClick={() => onBook(property)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-orange-600/20 w-full sm:w-auto"
                        >
                            Reserve Stay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default: grid card (used on HomePage featured section)
    return (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
            <div className="relative h-64 overflow-hidden" onClick={() => onNavigate(property.id)}>
                <img
                    src={property.image}
                    alt={`Photo of ${property.name}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    {property.type}
                </div>
                <button
                    onClick={(e) => onToggleFavorite(e, property.id)}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white transition text-stone-400 hover:text-red-500"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
            </div>

            <div className="p-6 flex flex-col flex-1" onClick={() => onNavigate(property.id)}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-stone-900 leading-tight group-hover:text-orange-600 transition">
                        {property.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-emerald-900 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> {property.rating.toFixed(1)}
                    </div>
                </div>
                <p className="text-sm text-stone-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4 text-emerald-600" /> {property.distance}
                </p>
                <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center">
                    <div>
                        <span className="text-xl font-black text-stone-900">KES {property.price.toLocaleString()}</span>
                        <span className="text-xs text-stone-500 font-medium block">/ night</span>
                    </div>
                    <div className="text-orange-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
