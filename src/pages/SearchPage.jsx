import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Map, Grid, List } from 'lucide-react';
import { api } from '../services/api.js';
import PropertyCard from '../components/PropertyCard.jsx';
import PriceRangeSlider from '../components/PriceRangeSlider.jsx';
import MapView from '../components/MapView.jsx';
import { SearchResultSkeleton } from '../components/Skeleton.jsx';

const PROPERTY_TYPES = ['Camp', 'Hotel', 'Apartment', 'Resort'];
const POLICIES = ['Free cancellation', 'No prepayment needed'];
const MEALS = ['Breakfast included', 'All inclusive'];

const SORT_OPTIONS = [
    { id: 'top_picks', label: 'Top Picks' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
];

export default function SearchPage({
    navigateTo, favorites, toggleFavorite,
    filters, setFilters, sortBy, setSortBy, onBook,
}) {
    const [properties, setProperties] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);

    const [displayMode, setDisplayMode] = useState('list');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [priceRange, setPriceRange] = useState([0, 15000]);

    // Fetch initial data
    useEffect(() => {
        const fetchAll = async () => {
            setInitialLoading(true);
            try {
                const data = await api.getProperties();
                setProperties(data);
            } catch (err) {
                console.error("Failed to fetch properties:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Simulate loading when filters change (for UX polish as requested)
    useEffect(() => {
        if (initialLoading) return;
        setFilterLoading(true);
        const t = setTimeout(() => setFilterLoading(false), 400); // Shorter delay for filter changes
        return () => clearTimeout(t);
    }, [filters, sortBy, priceRange, initialLoading]);

    const toggleFilterArray = (key, val) => {
        const current = filters[key] || [];
        setFilters({ ...filters, [key]: current.includes(val) ? current.filter(x => x !== val) : [...current, val] });
    };

    const clearFilters = () => {
        setFilters({ ...filters, type: [], policies: [], meals: [] });
        setPriceRange([0, 15000]);
    };

    const hasActiveFilters = (filters.type || []).length > 0 || (filters.policies || []).length > 0 || (filters.meals || []).length > 0 || priceRange[0] > 0 || priceRange[1] < 15000;

    // Derived filtering logic
    const filtered = useMemo(() => {
        // Helper to check if two dates overlap
        const isOverlapping = (start1, end1, start2, end2) => {
            return start1 < end2 && start2 < end1;
        };

        const checkInDate = filters.checkIn ? new Date(filters.checkIn) : null;
        const checkOutDate = filters.checkOut ? new Date(filters.checkOut) : null;
        const roomsRequested = filters.guests?.rooms || 1;
        const totalGuests = (filters.guests?.adults || 2) + (filters.guests?.children || 0);

        return properties
            .filter(p => {
                // Room Capacity Filter
                if (p.guests < (totalGuests / roomsRequested)) return false;

                // Date Availability Filter
                if (checkInDate && checkOutDate) {
                    let roomsBookedForDates = 0;
                    for (const booking of (p.bookedDates || [])) {
                        const bStart = new Date(booking.start);
                        const bEnd = new Date(booking.end);
                        if (isOverlapping(checkInDate, checkOutDate, bStart, bEnd)) {
                            roomsBookedForDates = Math.max(roomsBookedForDates, booking.roomsBooked);
                        }
                    }
                    const roomsAvailable = (p.totalRooms || 1) - roomsBookedForDates;
                    if (roomsAvailable < roomsRequested) return false;
                }

                // Price Filter
                if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

                // Type Filter
                if ((filters.type || []).length > 0 && !filters.type.includes(p.type)) return false;

                // Policies Filter (Booking.com style)
                if ((filters.policies || []).length > 0) {
                    const wantsFreeCancel = filters.policies.includes('Free cancellation');
                    const wantsNoPrepay = filters.policies.includes('No prepayment needed');

                    if (wantsFreeCancel && p.cancellationPolicy !== 'Free cancellation') return false;
                    if (wantsNoPrepay && !(p.paymentPreference || '').includes('No prepayment needed')) return false;
                }

                // Meals Filter
                if ((filters.meals || []).length > 0) {
                    const wantsBreakfast = filters.meals.includes('Breakfast included');
                    if (wantsBreakfast && p.mealPlan !== 'Breakfast included') return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'price_asc') return a.price - b.price;
                if (sortBy === 'price_desc') return b.price - a.price;
                if (sortBy === 'rating') return b.rating - a.rating;
                return 0; // top_picks (default ID order)
            });
    }, [properties, filters, priceRange, sortBy]);

    const isLoading = initialLoading || filterLoading;

    return (
        <div className="bg-stone-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 pt-8">
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-stone-900">Stays in Chaka</h1>
                        <p className="text-stone-500 font-medium mt-1">
                            {initialLoading ? 'Finding stays...' : `${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} found`}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border border-stone-200 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                            {[{ id: 'list', icon: <List className="w-4 h-4" /> }, { id: 'grid', icon: <Grid className="w-4 h-4" /> }].map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setDisplayMode(v.id)}
                                    className={`px-3 py-2 transition ${displayMode === v.id ? 'bg-emerald-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                                >
                                    {v.icon}
                                </button>
                            ))}
                        </div>

                        {/* Map Mode */}
                        <button
                            onClick={() => setViewMode(m => m === 'map' ? 'list' : 'map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${viewMode === 'map'
                                ? 'bg-emerald-900 text-white border-emerald-900'
                                : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-400'
                                }`}
                        >
                            <Map className="w-4 h-4" />
                            {viewMode === 'map' ? 'List View' : 'Map View'}
                        </button>

                        {/* Mobile Filters Toggle */}
                        <button
                            onClick={() => setShowFilters(s => !s)}
                            className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${hasActiveFilters ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-stone-200 text-stone-700'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                            {hasActiveFilters && <span className="bg-white text-orange-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">!</span>}
                        </button>
                    </div>
                </div>

                {viewMode === 'map' && (
                    <div className="mb-8">
                        {isLoading ? (
                            <div className="h-[60vh] rounded-3xl bg-stone-200 animate-pulse border border-stone-300"></div>
                        ) : (
                            <MapView properties={filtered} onNavigate={(id) => navigateTo('property', id)} />
                        )}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="flex gap-8">
                        {/* Sidebar Filters */}
                        <div className={`${showFilters ? 'block' : 'hidden lg:block'} w-full lg:w-72 flex-shrink-0`}>
                            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-stone-900">Filters</h3>
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters} className="text-xs text-orange-600 font-bold hover:underline">
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <PriceRangeSlider min={0} max={15000} value={priceRange} onChange={setPriceRange} />

                                {/* Property Type */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Property Type</h4>
                                    <div className="space-y-2">
                                        {PROPERTY_TYPES.map(t => (
                                            <label key={t} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={(filters.type || []).includes(t)}
                                                    onChange={() => toggleFilterArray('type', t)}
                                                    className="w-4 h-4 accent-emerald-700 rounded"
                                                />
                                                <span className="text-stone-600 group-hover:text-stone-900 transition text-sm font-medium">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Booking.com Functional Filters */}
                                <div className="mb-8">
                                    <h4 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Reservation Policy</h4>
                                    <div className="space-y-2">
                                        {POLICIES.map(p => (
                                            <label key={p} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={(filters.policies || []).includes(p)}
                                                    onChange={() => toggleFilterArray('policies', p)}
                                                    className="w-4 h-4 accent-emerald-700 rounded"
                                                />
                                                <span className="text-stone-600 group-hover:text-stone-900 transition text-sm font-medium">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Meals</h4>
                                    <div className="space-y-2">
                                        {MEALS.map(m => (
                                            <label key={m} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={(filters.meals || []).includes(m)}
                                                    onChange={() => toggleFilterArray('meals', m)}
                                                    className="w-4 h-4 accent-emerald-700 rounded"
                                                />
                                                <span className="text-stone-600 group-hover:text-stone-900 transition text-sm font-medium">{m}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 min-w-0">
                            {isLoading ? (
                                <div className={displayMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                                    {[1, 2, 3].map(i => <SearchResultSkeleton key={i} />)}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-stone-300">
                                    <span className="text-5xl mb-4 block">🔍</span>
                                    <h3 className="text-xl font-bold text-stone-800 mb-2">No properties match your exact search</h3>
                                    <p className="text-stone-500 mb-6">Try adjusting dates or clearing some filters.</p>
                                    <button onClick={clearFilters} className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-orange-700 transition">
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className={displayMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                                    {filtered.map(property => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            isFavorite={favorites.includes(property.id)}
                                            onToggleFavorite={toggleFavorite}
                                            onNavigate={(id) => navigateTo('property', id)}
                                            onBook={onBook}
                                            variant={displayMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
