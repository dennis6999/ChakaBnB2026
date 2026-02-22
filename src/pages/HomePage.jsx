import React, { useState, useEffect } from 'react';
import { Star, Map, Home, Heart } from 'lucide-react';
import FloatingSearchBar from '../components/FloatingSearchBar.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { api } from '../services/api.js';
import { PropertyCardSkeleton } from '../components/Skeleton.jsx';

export default function HomePage({ navigateTo, favorites, toggleFavorite, setFilters }) {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const data = await api.getProperties();
                setFeatured(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch featured properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const categories = [
        { name: 'Ranches & Camps', icon: <Map className="w-8 h-8" />, color: 'bg-emerald-100 text-emerald-700', type: 'Camp' },
        { name: 'Luxury Resorts', icon: <Star className="w-8 h-8" />, color: 'bg-orange-100 text-orange-700', type: 'Resort' },
        { name: 'Town Apartments', icon: <Home className="w-8 h-8" />, color: 'bg-blue-100 text-blue-700', type: 'Apartment' },
        { name: 'Wellness Retreats', icon: <Heart className="w-8 h-8" />, color: 'bg-rose-100 text-rose-700', type: 'Hotel' },
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-16">
            {/* Hero */}
            <div
                className="relative pb-32 pt-24 px-4 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1547471080-7cb2cb6a5a36?auto=format&fit=crop&w=1920&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-transparent" />
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col items-start">
                    <span className="bg-orange-600/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full mb-6 flex items-center gap-2 backdrop-blur-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> Premium Stays in Nyeri
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] max-w-2xl tracking-tight">
                        Escape to the <br />
                        <span className="text-orange-400">Heart of Kenya.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-xl font-light leading-relaxed">
                        Discover serene ranches, luxurious resorts, and cozy retreats tucked away in the beautiful
                        landscapes of Chaka town.
                    </p>
                </div>
            </div>

            {/* Floating Search Bar */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 mb-16">
                <FloatingSearchBar onSearch={() => navigateTo('search')} />
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-stone-900 mb-2">Explore by Category</h2>
                        <p className="text-stone-500">Find exactly what you're looking for</p>
                    </div>
                    <button
                        onClick={() => navigateTo('search')}
                        className="text-orange-600 font-bold hover:underline hidden sm:block"
                    >
                        View all categories &rarr;
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, type: [cat.type] }));
                                navigateTo('search');
                            }}
                            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group"
                        >
                            <div className={`${cat.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>
                            <h3 className="font-bold text-stone-900">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Properties */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-stone-900 mb-2">Featured Stays in Chaka</h2>
                        <p className="text-stone-500">Highly rated by recent guests</p>
                    </div>
                    <button
                        onClick={() => navigateTo('search')}
                        className="text-orange-600 font-bold hover:underline hidden sm:block"
                    >
                        See all properties &rarr;
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)
                    ) : (
                        featured.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorite={favorites.includes(property.id)}
                                onToggleFavorite={toggleFavorite}
                                onNavigate={(id) => navigateTo('property', id)}
                                variant="grid"
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
