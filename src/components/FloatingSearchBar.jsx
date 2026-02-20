import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, Users, MapPin, AlertCircle, X } from 'lucide-react';
import DatePicker from './DatePicker.jsx';
import GuestCounter from './GuestCounter.jsx';

const formatDate = (d) =>
    d ? d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : null;

export default function FloatingSearchBar({ onSearch }) {
    const [location, setLocation] = useState('');
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

    const [error, setError] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);

    const dateRef = useRef(null);
    const guestRef = useRef(null);

    // Close dropdowns on outside click (only applies to desktop essentially)
    useEffect(() => {
        const handler = (e) => {
            if (dateRef.current && !dateRef.current.contains(e.target)) setShowDatePicker(false);
            if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestPicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Prevent body scroll when mobile modals are open
    useEffect(() => {
        if (window.innerWidth < 768 && (showDatePicker || showGuestPicker)) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showDatePicker, showGuestPicker]);

    const nights = checkIn && checkOut
        ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        : null;

    const totalGuests = guests.adults + guests.children;

    const handleSearch = () => {
        if (!checkIn || !checkOut) {
            setError('Please select check-in and check-out dates to see precise availability.');
            setShowDatePicker(true);
            return;
        }
        setError('');
        onSearch?.({ location, checkIn, checkOut, guests });
    };

    return (
        <div className="relative">
            {error && (
                <div className="absolute -top-12 left-0 right-0 max-w-xl mx-auto bg-red-100 text-red-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-bottom-2 z-10">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            <div className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border ${error ? 'border-red-400 ring-2 ring-red-400/20' : 'border-stone-200'} flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-stone-200 overflow-visible relative transition-all`}>
                {/* Location */}
                <div className="flex items-center gap-3 px-5 py-4 flex-[2]">
                    <MapPin className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Where</div>
                        <input
                            className="bg-transparent outline-none text-stone-900 font-semibold text-sm w-full placeholder-stone-400"
                            placeholder="Search Chaka, Nyeri…"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Dates */}
                <div ref={dateRef} className="relative flex-[2]">
                    <button
                        onClick={() => { setShowDatePicker((s) => !s); setShowGuestPicker(false); }}
                        className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-stone-50 transition"
                    >
                        <Calendar className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                        <div>
                            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">When</div>
                            <span className="text-stone-900 font-semibold text-sm">
                                {checkIn && checkOut
                                    ? `${formatDate(checkIn)} – ${formatDate(checkOut)}${nights ? ` (${nights}n)` : ''}`
                                    : checkIn
                                        ? `${formatDate(checkIn)} – Check out`
                                        : 'Add dates'}
                            </span>
                        </div>
                    </button>

                    {showDatePicker && (
                        <>
                            {/* Mobile Overlay */}
                            <div className="md:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowDatePicker(false)} />

                            {/* Wrapper: Bottom Sheet on Mobile, Absolute Dropdown on Desktop */}
                            <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh] p-4 flex justify-center md:absolute md:top-full md:left-0 md:bottom-auto md:right-auto md:mt-3 md:z-50 md:p-0 md:bg-transparent md:rounded-none md:shadow-none animate-in md:slide-in-from-top-2 slide-in-from-bottom-full duration-300">
                                <div className="md:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 absolute top-3 left-1/2 -translate-x-1/2" />
                                <div className="mt-6 md:mt-0 w-full max-w-2xl">
                                    <DatePicker
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        onChange={(ci, co) => {
                                            setCheckIn(ci);
                                            setCheckOut(co);
                                            if (ci && co) setError('');
                                        }}
                                        onClose={() => setShowDatePicker(false)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Guests */}
                <div ref={guestRef} className="relative flex-[1.5]">
                    <button
                        onClick={() => { setShowGuestPicker((s) => !s); setShowDatePicker(false); }}
                        className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-stone-50 transition"
                    >
                        <Users className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                        <div>
                            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Guests</div>
                            <span className="text-stone-900 font-semibold text-sm">
                                {totalGuests} guest{totalGuests !== 1 ? 's' : ''}, {guests.rooms} room{guests.rooms !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </button>

                    {showGuestPicker && (
                        <>
                            {/* Mobile Overlay */}
                            <div className="md:hidden fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowGuestPicker(false)} />

                            {/* Wrapper: Bottom Sheet on Mobile, Absolute Dropdown on Desktop */}
                            <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh] p-4 flex justify-center md:absolute md:top-full md:right-0 md:left-auto md:bottom-auto md:mt-3 md:z-50 md:p-0 md:bg-transparent md:rounded-none md:shadow-none animate-in md:slide-in-from-top-2 slide-in-from-bottom-full duration-300">
                                <div className="md:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 absolute top-3 left-1/2 -translate-x-1/2" />
                                <div className="mt-6 md:mt-0 w-full max-w-md">
                                    <GuestCounter
                                        guests={guests}
                                        onChange={setGuests}
                                        onClose={() => setShowGuestPicker(false)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Search Button */}
                <div className="px-3 py-3 flex-shrink-0">
                    <button
                        onClick={handleSearch}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-2xl transition shadow-lg shadow-orange-600/25 flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <Search className="w-5 h-5" /> Search
                    </button>
                </div>
            </div>
        </div>
    );
}
