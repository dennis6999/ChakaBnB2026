import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft, MapPin, Star, Share, Heart, Check,
    Wifi, Coffee, Shield, Wind, ChevronRight, MessageSquare, ChevronDown, Calendar, AlertCircle
} from 'lucide-react';
import GalleryLightbox from '../components/GalleryLightbox.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import ContactHostModal from '../components/ContactHostModal.jsx';
import DatePicker from '../components/DatePicker.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import { api } from '../services/api.js';
import { SearchResultSkeleton } from '../components/Skeleton.jsx';

const formatDate = (d) =>
    d ? d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : null;

// Helper to check if two dates overlap
const isOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
};

export default function PropertyPage({ property, isFavorite, onToggleFavorite, onBook, navigateTo, favorites, toggleFavorite, searchFilters }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [showContact, setShowContact] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [shareLabel, setShareLabel] = useState('Share');

    // Async Data State
    const [reviews, setReviews] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Booking State initialized from searchFilters
    const [checkIn, setCheckIn] = useState(searchFilters?.checkIn ? new Date(searchFilters.checkIn) : null);
    const [checkOut, setCheckOut] = useState(searchFilters?.checkOut ? new Date(searchFilters.checkOut) : null);
    const [rooms, setRooms] = useState(searchFilters?.guests?.rooms || 1);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const dateRef = useRef(null);

    // Fetch Reviews and Similar Properties
    useEffect(() => {
        if (!property) return;
        let isMounted = true;

        const fetchDetails = async () => {
            setLoadingDetails(true);
            try {
                const [fetchedReviews, fetchedSimilar] = await Promise.all([
                    api.getPropertyReviews(property.id),
                    api.getSimilarProperties(property.id, property.type)
                ]);
                if (isMounted) {
                    setReviews(fetchedReviews);
                    setSimilar(fetchedSimilar);
                }
            } catch (err) {
                console.error("Failed to fetch property details", err);
            } finally {
                if (isMounted) setLoadingDetails(false);
            }
        };
        fetchDetails();
        return () => { isMounted = false; };
    }, [property]);

    useEffect(() => {
        const handler = (e) => {
            if (dateRef.current && !dateRef.current.contains(e.target)) setShowDatePicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!property) return null;

    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    const openLightbox = (idx) => { setLightboxIdx(idx); setLightboxOpen(true); };

    const handleShare = async () => {
        const shareData = {
            title: property.name,
            text: `Check out ${property.name} on Chakabnb — KES ${property.price.toLocaleString()}/night`,
            url: window.location.href,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (_) { }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setShareLabel('Link copied!');
            setTimeout(() => setShareLabel('Share'), 2500);
        }
    };

    // Calculations
    const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
    const basePrice = property.price * nights * rooms;
    const taxes = nights > 0 ? 450 * rooms : 0;
    const totalPrice = basePrice + taxes;

    // Actual availability check matching SearchPage
    let roomsBookedForDates = 0;
    if (checkIn && checkOut) {
        for (const booking of (property.bookedDates || [])) {
            const bStart = new Date(booking.start);
            const bEnd = new Date(booking.end);
            if (isOverlapping(checkIn, checkOut, bStart, bEnd)) {
                roomsBookedForDates = Math.max(roomsBookedForDates, booking.roomsBooked);
            }
        }
    }
    const roomsAvailable = (property.totalRooms || 1) - roomsBookedForDates;
    const isAvailable = roomsAvailable >= rooms;

    const handleBook = () => {
        onBook({ ...property, checkIn, checkOut, rooms, totalPrice });
    };

    return (
        <div className="animate-in fade-in duration-300 pb-20 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <button
                    onClick={() => navigateTo('search')}
                    className="flex items-center gap-2 text-stone-500 hover:text-emerald-700 transition font-medium mb-6"
                >
                    <ChevronLeft className="w-5 h-5" /> Back to search results
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{property.type}</span>
                            <span className="flex text-orange-400">
                                {[...Array(Math.floor(property.rating / 2))].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight mb-2">{property.name}</h1>
                        <div className="flex items-center text-stone-500 font-medium gap-1.5">
                            <MapPin className="w-5 h-5 text-emerald-600" /> {property.distance} • Chaka, Nyeri
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleShare}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition"
                        >
                            <Share className="w-4 h-4" /> {shareLabel}
                        </button>
                        <button
                            onClick={(e) => onToggleFavorite(e, property.id)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition"
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} /> Save
                        </button>
                    </div>
                </div>

                {/* Desktop Gallery */}
                <div className="hidden md:grid grid-cols-4 gap-3 mb-12 h-[60vh] rounded-3xl overflow-hidden shadow-lg border border-stone-200">
                    <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => openLightbox(0)}>
                        <img src={property.gallery?.[0] || property.image} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    </div>
                    {[1, 2].map((i) => (
                        <div key={i} className="relative group overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
                            <img src={property.gallery?.[i] || property.image} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                    ))}
                    <div
                        className="flex col-span-2 relative group overflow-hidden bg-emerald-900 items-center justify-center cursor-pointer"
                        onClick={() => openLightbox(3)}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                        <span className="relative text-white font-bold text-lg flex items-center gap-2">
                            View all photos ({property.gallery?.length || 1}) <ChevronRight />
                        </span>
                    </div>
                </div>

                {/* Mobile Gallery (Carousel) */}
                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-2 mb-8 -mx-4 px-4 scrollbar-hide">
                    {(property.gallery?.length ? property.gallery : [property.image]).map((img, i) => (
                        <div key={i} className="relative flex-none w-[85vw] h-[40vh] rounded-2xl overflow-hidden snap-center shadow-sm" onClick={() => openLightbox(i)}>
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                            <div className="absolute bottom-3 right-3 bg-stone-900/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
                                {i + 1} / {(property.gallery?.length || 1)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Details */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start pb-8 border-b border-stone-200 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-2">Hosted by {property.host?.name || 'Host'}</h2>
                                <p className="text-stone-500 flex items-center gap-3">
                                    <span>{property.guests} max guests/room</span> • <span>{property.bedrooms} beds/room</span>
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl">
                                {(property.host?.name || 'H').charAt(0)}
                            </div>
                        </div>

                        {/* Booking.com Policies */}
                        <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                <Check className="w-5 h-5" /> {property.cancellationPolicy}
                            </div>
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                <Check className="w-5 h-5" /> {property.mealPlan}
                            </div>
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                <Check className="w-5 h-5" /> {property.paymentPreference}
                            </div>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-stone-900 mb-4">About this place</h3>
                            <p className="text-stone-600 leading-relaxed text-lg">{property.description}</p>
                        </div>

                        {/* Features */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-stone-900 mb-6">What this place offers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(property.features || []).map(f => (
                                    <div key={f} className="flex items-center gap-4 text-stone-700">
                                        <Check className="w-6 h-6 text-emerald-700" /><span className="text-lg">{f}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-4 text-stone-700"><Wifi className="text-emerald-700 w-6 h-6" /><span className="text-lg">Fast WiFi</span></div>
                                <div className="flex items-center gap-4 text-stone-700"><Coffee className="text-emerald-700 w-6 h-6" /><span className="text-lg">Coffee Maker</span></div>
                            </div>
                        </div>

                        {/* Reviews summary */}
                        <div className="bg-stone-100 rounded-3xl p-8 border border-stone-200 mb-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-emerald-900 text-white font-black text-3xl px-4 py-2 rounded-2xl shadow-sm">
                                    {property.rating?.toFixed(1)}
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-stone-900">{property.reviewText}</div>
                                    <div className="text-stone-500 font-medium">{property.reviews} verified reviews</div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Host */}
                        <div className="border border-stone-200 rounded-3xl p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold text-lg flex-shrink-0">
                                    {(property.host?.name || 'H').charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-stone-900">{property.host?.name || 'Host'}</div>
                                    <div className="text-sm text-stone-500">Typically responds within an hour</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowContact(true)}
                                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md w-full sm:w-auto justify-center"
                            >
                                <MessageSquare className="w-4 h-4" /> Contact Host
                            </button>
                        </div>
                    </div>

                    {/* Functional Booking Widget (Booking.com style) */}
                    <div className="w-full lg:w-96 flex-shrink-0 relative">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 lg:sticky lg:top-28">
                            <h3 className="text-xl font-bold text-stone-900 mb-2">Check availability</h3>
                            <div className="flex items-end gap-1 mb-6">
                                <span className="text-3xl font-black text-stone-900">KES {property.price?.toLocaleString()}</span>
                                <span className="text-stone-500 font-medium mb-1">/ room / night</span>
                            </div>

                            <div className="border border-stone-300 rounded-2xl mb-4 overflow-visible relative">
                                <div ref={dateRef} className="relative">
                                    <button
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="w-full flex border-b border-stone-300 hover:bg-stone-50 transition"
                                    >
                                        <div className="flex-1 p-3 border-r border-stone-300 text-left">
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-500 tracking-wider"><Calendar className="w-3 h-3" /> Check-in</span>
                                            <span className="font-semibold text-stone-900">{formatDate(checkIn) || 'Select date'}</span>
                                        </div>
                                        <div className="flex-1 p-3 text-left">
                                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-500 tracking-wider"><Calendar className="w-3 h-3" /> Check-out</span>
                                            <span className="font-semibold text-stone-900">{formatDate(checkOut) || 'Select date'}</span>
                                        </div>
                                    </button>

                                    {showDatePicker && (
                                        <div className="absolute top-full left-[-250px] sm:left-auto right-0 mt-3 z-50">
                                            <DatePicker
                                                checkIn={checkIn}
                                                checkOut={checkOut}
                                                onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); }}
                                                onClose={() => setShowDatePicker(false)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-white flex justify-between items-center">
                                    <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">Rooms Needed</span>
                                    <select
                                        value={rooms}
                                        onChange={(e) => setRooms(Number(e.target.value))}
                                        className="bg-stone-100 border border-stone-300 rounded font-semibold text-stone-900 px-2 py-1 outline-none"
                                    >
                                        {[...Array(property.totalRooms || 1)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!checkIn || !checkOut ? (
                                <div className="mb-4 text-orange-600 bg-orange-50 p-3 rounded-lg text-sm font-semibold flex items-start gap-2 border border-orange-200">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    Please select exact dates to reserve.
                                </div>
                            ) : null}

                            {!isAvailable && checkIn && checkOut && (
                                <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold border border-red-200 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    Only {roomsAvailable} room{roomsAvailable !== 1 ? 's' : ''} available.
                                </div>
                            )}

                            <button
                                onClick={handleBook}
                                disabled={!checkIn || !checkOut || !isAvailable}
                                className={`w-full font-bold py-4 rounded-xl transition shadow-lg text-lg mb-4 
                                    ${(!checkIn || !checkOut || !isAvailable)
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}`}
                            >
                                I'll Reserve
                            </button>

                            <div className="text-center text-sm text-stone-500 font-medium">Takes only 2 minutes</div>

                            {nights > 0 && (
                                <div className="mt-6 pt-6 border-t border-stone-200 space-y-3 animate-in fade-in">
                                    <div className="flex justify-between text-stone-600">
                                        <span className="underline">KES {property.price?.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''} x {rooms} room{rooms > 1 ? 's' : ''}</span>
                                        <span>KES {basePrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span className="underline">Service/Taxes</span><span>KES {taxes.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-stone-200 flex justify-between font-black text-2xl text-stone-900">
                                        <span>Total</span>
                                        <span>KES {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {lightboxOpen && (
                <GalleryLightbox
                    images={property.gallery || [property.image]}
                    startIdx={lightboxIdx}
                    onClose={() => setLightboxOpen(false)}
                />
            )}

            {showContact && (
                <ContactHostModal
                    host={property.host || { name: 'Host' }}
                    propertyName={property.name}
                    onClose={() => setShowContact(false)}
                />
            )}

            {/* Mobile Fixed Bottom Booking Bar */}
            <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-stone-200 p-4 z-40 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div>
                    <div className="font-black text-stone-900 text-lg flex items-center gap-1">
                        KES {basePrice > 0 ? totalPrice.toLocaleString() : property.price?.toLocaleString()}
                        <span className="text-xs text-stone-500 font-medium">
                            {nights > 0 ? ` total` : ` / night`}
                        </span>
                    </div>
                    {checkIn && checkOut ? (
                        <div className="text-xs text-stone-500 font-semibold underline decoration-stone-300">
                            {formatDate(checkIn)} - {formatDate(checkOut)}
                        </div>
                    ) : (
                        <div className="text-xs text-stone-500 font-semibold underline decoration-stone-300">
                            {property.reviewText} ({property.reviews})
                        </div>
                    )}
                </div>
                <button
                    disabled={(!checkIn || !checkOut) ? false : !isAvailable}
                    onClick={() => {
                        if (!checkIn || !checkOut) {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Scroll down to widget
                        } else if (isAvailable) {
                            handleBook();
                        }
                    }}
                    className={`font-bold px-6 py-3 text-sm rounded-xl transition shadow-md
                        ${(!checkIn || !checkOut)
                            ? 'bg-stone-900 text-white'
                            : !isAvailable
                                ? 'bg-stone-300 text-stone-500'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}`}
                >
                    {(!checkIn || !checkOut) ? 'Check Dates' : isAvailable ? 'Reserve' : 'Sold Out'}
                </button>
            </div>
        </div>
    );
}
