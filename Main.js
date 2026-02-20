import React, { useState, useEffect } from 'react';
import {
    Search, Calendar, User, MapPin, Bed, Car, Check, X, Star,
    Heart, Share, ChevronLeft, Wifi, Coffee, Wind, Shield,
    History, Settings, CreditCard, LogOut, ChevronRight, Home, Map
} from 'lucide-react';

// --- EXPANDED MOCK DATA ---
const MOCK_PROPERTIES = [
    {
        id: 1,
        name: "Chaka Ranch Tented Camp",
        type: "Camp",
        distance: "2.5 km from center",
        description: "Experience luxury in the wild. Set between Mt Kenya and the Aberdares, featuring an outdoor entertainment park, quad bikes, and spacious tents. Perfect for families and team building. Our premium tents offer unparalleled comfort while keeping you connected to nature.",
        roomInfo: "Superior Luxury Tent",
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        features: ["Free breakfast", "Free WiFi", "Free parking", "Restaurant", "Water park access", "Air conditioning"],
        price: 10500,
        rating: 9.2,
        reviewText: "Superb",
        reviews: 128,
        roomsLeft: 2,
        host: { name: "David", joined: "2018" },
        image: "https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: 2,
        name: "Muthiga Garden Resort Chaka",
        type: "Resort",
        distance: "0.8 km from center",
        description: "Tranquil stay surrounded by beautiful mountain views. Offers comfortable rooms, home-cooked breakfast, and live music on weekends. The lush gardens provide a perfect backdrop for relaxation or intimate events.",
        roomInfo: "Standard Double Room",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        features: ["Free breakfast", "Free parking", "Restaurant", "Garden view", "Room service"],
        price: 5000,
        rating: 9.0,
        reviewText: "Wonderful",
        reviews: 45,
        roomsLeft: null,
        host: { name: "Sarah & John", joined: "2020" },
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: 3,
        name: "Lusoi Ranch Resort",
        type: "Resort",
        distance: "4.2 km from center",
        description: "A hidden gem along the Chaka-Nanyuki road. Perfect for a quiet countryside getaway with stunning farm views and fresh local cuisine. Wake up to the sounds of birds and enjoy farm-to-table meals prepared by our resident chef.",
        roomInfo: "Family Bungalow",
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        features: ["Free parking", "Restaurant", "Kitchen", "BBQ facilities", "Pet friendly"],
        price: 7500,
        rating: 8.5,
        reviewText: "Very Good",
        reviews: 32,
        roomsLeft: 1,
        host: { name: "Grace", joined: "2019" },
        image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: 4,
        name: "Chaka Place Apartments",
        type: "Apartment",
        distance: "0.5 km from center",
        description: "Modern, secure apartments right in the heart of Chaka town. Ideal for business travelers and long-term stays with stable internet. Close to local markets, transit points, and dining options.",
        roomInfo: "One-Bedroom Apartment",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        features: ["Free WiFi", "Free parking", "Kitchen", "Washing machine", "City view"],
        price: 3500,
        rating: 8.4,
        reviewText: "Very Good",
        reviews: 29,
        roomsLeft: null,
        host: { name: "Peter", joined: "2021" },
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1de2d92004?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: 5,
        name: "Le Pristine Wellness Hotel",
        type: "Hotel",
        distance: "3.0 km from center",
        description: "Dedicated to healing and wellness, featuring spa treatments, an indoor pool, and serene gardens near Kiganjo. A sanctuary designed to rejuvenate your mind, body, and soul.",
        roomInfo: "Deluxe Suite",
        guests: 2,
        bedrooms: 1,
        bathrooms: 1.5,
        features: ["Free WiFi", "Free breakfast", "Spa", "Restaurant", "Pool", "Gym"],
        price: 6000,
        rating: 8.1,
        reviewText: "Very Good",
        reviews: 37,
        roomsLeft: 4,
        host: { name: "Le Pristine Mgmt", joined: "2015" },
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: 6,
        name: "The Peak Meadows Hotel",
        type: "Hotel",
        distance: "1.2 km from center",
        description: "Comfortable and affordable lodging with excellent Kenyan food, timely transport services, and friendly staff. Experience authentic Kenyan hospitality with views of the Aberdare ranges.",
        roomInfo: "Standard Single Room",
        guests: 1,
        bedrooms: 1,
        bathrooms: 1,
        features: ["Free WiFi", "Free parking", "Restaurant", "24/7 Front Desk"],
        price: 4200,
        rating: 7.7,
        reviewText: "Good",
        reviews: 41,
        roomsLeft: null,
        host: { name: "Peak Meadows", joined: "2017" },
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=800&q=80"
        ]
    }
];

export default function App() {
    // --- STATE MANAGEMENT & ROUTING ---
    const [currentView, setCurrentView] = useState('home'); // 'home', 'search', 'property', 'profile'
    const [activePropertyId, setActivePropertyId] = useState(null);

    // App State
    const [favorites, setFavorites] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [toastMessage, setToastMessage] = useState('');

    // Search State
    const [filters, setFilters] = useState({ type: [], features: [] });
    const [sortBy, setSortBy] = useState('top_picks');

    // Modal State
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Scroll to top on view change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentView, activePropertyId]);

    // --- HANDLERS ---
    const navigateTo = (view, propertyId = null) => {
        if (propertyId) setActivePropertyId(propertyId);
        setCurrentView(view);
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        if (favorites.includes(id)) {
            setFavorites(favorites.filter(favId => favId !== id));
            showToast('Removed from saved properties');
        } else {
            setFavorites([...favorites, id]);
            showToast('Saved to your properties');
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleBook = (property) => {
        setActivePropertyId(property.id);
        setShowBookingModal(true);
    };

    const confirmBooking = () => {
        const property = MOCK_PROPERTIES.find(p => p.id === activePropertyId);
        const newBooking = {
            ...property,
            bookingId: Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toLocaleDateString(),
            status: 'Confirmed'
        };

        setMyBookings([...myBookings, newBooking]);
        setShowBookingModal(false);
        showToast(`Booking confirmed for ${property.name}!`);
        navigateTo('profile');
    };

    // --- HELPER COMPONENTS ---
    const Navbar = () => (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm py-4 px-4 border-b border-stone-200">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div
                    onClick={() => navigateTo('home')}
                    className="text-2xl font-black text-emerald-900 tracking-tighter flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                >
                    <div className="bg-emerald-900 p-1.5 rounded-lg">
                        <MapPin className="text-white w-6 h-6" />
                    </div>
                    Chakabnb
                </div>
                <div className="flex items-center gap-4 text-emerald-900 font-medium text-sm">
                    <span className="hidden md:inline cursor-pointer hover:bg-stone-100 px-3 py-2 rounded-full transition text-stone-600">KES / 🇰🇪</span>
                    <button
                        onClick={() => navigateTo('search')}
                        className="hidden sm:flex items-center gap-2 hover:bg-stone-100 px-4 py-2 rounded-full transition"
                    >
                        <Search className="w-4 h-4" /> Explore
                    </button>
                    <button
                        onClick={() => navigateTo('profile')}
                        className="bg-emerald-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-800 transition shadow-md font-semibold flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">My Account</span>
                        {myBookings.length > 0 && (
                            <span className="bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full ml-1">
                                {myBookings.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );

    const Footer = () => (
        <footer className="bg-stone-900 text-stone-400 py-16 border-t-4 border-emerald-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2">
                    <div className="text-2xl font-black text-white flex items-center gap-2 mb-4 opacity-90">
                        <MapPin className="text-orange-500" /> Chakabnb
                    </div>
                    <p className="text-stone-500 text-sm font-medium max-w-sm mb-6">
                        Connecting you to the beauty of Nyeri County, Kenya. Discover local stays, experiences, and genuine hospitality in Chaka town.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Explore</h4>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => navigateTo('search')} className="hover:text-orange-400 transition">All Properties</button></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Ranches & Camps</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Town Apartments</span></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Help Center</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Cancellation Options</span></li>
                        <li><span className="hover:text-orange-400 cursor-pointer transition">Contact Us</span></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 text-center border-t border-stone-800 pt-8 text-sm">
                <p>Copyright © 2026 Chakabnb. A premium local experience.</p>
            </div>
        </footer>
    );

    const FloatingSearchBar = ({ onSearch }) => (
        <div className="bg-white p-2 rounded-3xl shadow-xl flex flex-col lg:flex-row w-full gap-2 border border-stone-100 relative z-20">
            <div className="flex-1 flex bg-stone-50 hover:bg-stone-100 transition rounded-2xl p-4 items-center gap-4 cursor-text">
                <div className="bg-emerald-100 p-2 rounded-full"><MapPin className="text-emerald-700 w-5 h-5 flex-shrink-0" /></div>
                <div className="flex flex-col w-full">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Location</span>
                    <input type="text" defaultValue="Chaka, Nyeri" className="w-full bg-transparent outline-none text-stone-900 font-semibold text-base" />
                </div>
            </div>
            <div className="flex-1 flex bg-stone-50 hover:bg-stone-100 transition rounded-2xl p-4 items-center gap-4 cursor-text">
                <div className="bg-emerald-100 p-2 rounded-full"><Calendar className="text-emerald-700 w-5 h-5 flex-shrink-0" /></div>
                <div className="flex flex-col w-full">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Dates</span>
                    <input type="text" placeholder="Add dates" className="w-full bg-transparent outline-none text-stone-900 font-semibold text-base placeholder-stone-400" />
                </div>
            </div>
            <div className="flex-1 flex bg-stone-50 hover:bg-stone-100 transition rounded-2xl p-4 items-center gap-4 cursor-text">
                <div className="bg-emerald-100 p-2 rounded-full"><User className="text-emerald-700 w-5 h-5 flex-shrink-0" /></div>
                <div className="flex flex-col w-full">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Guests</span>
                    <input type="text" defaultValue="2 guests, 1 room" className="w-full bg-transparent outline-none text-stone-900 font-semibold text-base" />
                </div>
            </div>
            <button
                onClick={onSearch}
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold px-10 py-4 rounded-2xl transition shadow-lg shadow-orange-600/20 flex-shrink-0 flex items-center justify-center gap-2"
            >
                <Search className="w-5 h-5" /> Search
            </button>
        </div>
    );

    // --- VIEWS ---

    // 1. HOME VIEW
    const ViewHome = () => (
        <div className="animate-in fade-in duration-500 pb-16">
            {/* Hero */}
            <div className="relative pb-32 pt-24 px-4 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547471080-7cb2cb6a5a36?auto=format&fit=crop&w=1920&q=80')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-transparent"></div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col items-start">
                    <span className="bg-orange-600/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full mb-6 flex items-center gap-2 backdrop-blur-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> Premium Stays in Nyeri
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] max-w-2xl tracking-tight">
                        Escape to the <br /><span className="text-orange-400">Heart of Kenya.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-xl font-light leading-relaxed">
                        Discover serene ranches, luxurious resorts, and cozy retreats tucked away in the beautiful landscapes of Chaka town.
                    </p>
                </div>
            </div>

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
                    <button onClick={() => navigateTo('search')} className="text-orange-600 font-bold hover:underline hidden sm:block">View all categories &rarr;</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: "Ranches & Camps", icon: <Map className="w-8 h-8" />, color: "bg-emerald-100 text-emerald-700" },
                        { name: "Luxury Resorts", icon: <Star className="w-8 h-8" />, color: "bg-orange-100 text-orange-700" },
                        { name: "Town Apartments", icon: <Home className="w-8 h-8" />, color: "bg-blue-100 text-blue-700" },
                        { name: "Wellness Retreats", icon: <Heart className="w-8 h-8" />, color: "bg-rose-100 text-rose-700" },
                    ].map((cat, i) => (
                        <div key={i} onClick={() => navigateTo('search')} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group">
                            <div className={`${cat.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                            <h3 className="font-bold text-stone-900">{cat.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Properties Grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-stone-900 mb-2">Featured Stays in Chaka</h2>
                        <p className="text-stone-500">Highly rated by recent guests</p>
                    </div>
                    <button onClick={() => navigateTo('search')} className="text-orange-600 font-bold hover:underline hidden sm:block">See all properties &rarr;</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MOCK_PROPERTIES.slice(0, 3).map(property => (
                        <div key={property.id} className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                            <div className="relative h-64 overflow-hidden" onClick={() => navigateTo('property', property.id)}>
                                <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                    {property.type}
                                </div>
                                <button
                                    onClick={(e) => toggleFavorite(e, property.id)}
                                    className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white transition text-stone-400 hover:text-red-500"
                                >
                                    <Heart className={`w-5 h-5 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                            </div>
                            <div className="p-6 flex flex-col flex-1" onClick={() => navigateTo('property', property.id)}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-black text-stone-900 leading-tight group-hover:text-orange-600 transition">{property.name}</h3>
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
                    ))}
                </div>
            </div>
        </div>
    );

    // 2. SEARCH VIEW
    const ViewSearch = () => {
        const toggleFilter = (category, value) => {
            setFilters(prev => {
                const current = prev[category];
                if (current.includes(value)) {
                    return { ...prev, [category]: current.filter(item => item !== value) };
                } else {
                    return { ...prev, [category]: [...current, value] };
                }
            });
        };

        const filteredProperties = MOCK_PROPERTIES.filter(p => {
            if (filters.type.length > 0 && !filters.type.includes(p.type)) return false;
            if (filters.features.length > 0) {
                const hasAll = filters.features.every(f => p.features.includes(f));
                if (!hasAll) return false;
            }
            return true;
        });

        let displayedProperties = [...filteredProperties];
        if (sortBy === 'price_low') displayedProperties.sort((a, b) => a.price - b.price);
        else if (sortBy === 'rating_high') displayedProperties.sort((a, b) => b.rating - a.rating);

        return (
            <div className="animate-in fade-in duration-300 bg-stone-50 pb-16">
                <div className="bg-emerald-950 py-8 px-4 border-b border-emerald-900">
                    <div className="max-w-7xl mx-auto">
                        <FloatingSearchBar onSearch={() => { }} />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 mt-8">
                    <div className="text-sm text-stone-500 mb-8 flex items-center gap-2 font-medium">
                        <span onClick={() => navigateTo('home')} className="hover:text-emerald-700 cursor-pointer transition flex items-center gap-1"><Home className="w-4 h-4" /> Home</span> /
                        <span className="text-emerald-900 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">Search Results</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <div className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 lg:sticky lg:top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-stone-900 text-xl">Filters</h3>
                                    <span onClick={() => setFilters({ type: [], features: [] })} className="text-sm text-orange-600 font-medium cursor-pointer hover:underline">Reset</span>
                                </div>

                                <div className="mb-8">
                                    <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Property Type</h4>
                                    {['Camp', 'Resort', 'Apartment', 'Hotel'].map(type => (
                                        <label key={type} className="flex items-center gap-3 mb-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    className="peer appearance-none w-5 h-5 border-2 border-stone-300 rounded-md checked:bg-orange-600 checked:border-orange-600 transition cursor-pointer"
                                                    checked={filters.type.includes(type)}
                                                    onChange={() => toggleFilter('type', type)}
                                                />
                                                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition" />
                                            </div>
                                            <span className="text-stone-600 font-medium group-hover:text-stone-900 transition">{type}</span>
                                        </label>
                                    ))}
                                </div>

                                <div>
                                    <h4 className="font-bold text-stone-900 mb-4 text-sm uppercase tracking-wider">Amenities</h4>
                                    {['Free WiFi', 'Free breakfast', 'Free parking', 'Restaurant', 'Spa', 'Kitchen'].map(feature => (
                                        <label key={feature} className="flex items-center gap-3 mb-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-5 h-5">
                                                <input
                                                    type="checkbox"
                                                    className="peer appearance-none w-5 h-5 border-2 border-stone-300 rounded-md checked:bg-orange-600 checked:border-orange-600 transition cursor-pointer"
                                                    checked={filters.features.includes(feature)}
                                                    onChange={() => toggleFilter('features', feature)}
                                                />
                                                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition" />
                                            </div>
                                            <span className="text-stone-600 font-medium group-hover:text-stone-900 transition">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Search Results List */}
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                                <h2 className="text-2xl font-bold text-stone-900">
                                    Found <span className="text-emerald-700">{displayedProperties.length}</span> properties
                                </h2>
                                <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm">
                                    <span className="text-sm text-stone-500 font-medium">Sort by:</span>
                                    <select
                                        className="bg-transparent text-sm font-bold text-stone-900 outline-none cursor-pointer"
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                    >
                                        <option value="top_picks">Top Picks</option>
                                        <option value="price_low">Lowest Price</option>
                                        <option value="rating_high">Highest Rated</option>
                                    </select>
                                </div>
                            </div>

                            {displayedProperties.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-sm">
                                    <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin className="text-stone-400 w-8 h-8" /></div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">No matches found</h3>
                                    <p className="text-stone-500">Try adjusting your filters to discover more hidden gems.</p>
                                    <button onClick={() => setFilters({ type: [], features: [] })} className="mt-6 text-orange-600 font-bold hover:underline">Clear all filters</button>
                                </div>
                            ) : (
                                displayedProperties.map(property => (
                                    <div key={property.id} className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
                                        <div
                                            className="w-full md:w-72 h-64 md:h-auto flex-shrink-0 relative cursor-pointer overflow-hidden rounded-2xl"
                                            onClick={() => navigateTo('property', property.id)}
                                        >
                                            <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" />
                                            <button
                                                onClick={(e) => toggleFavorite(e, property.id)}
                                                className="absolute top-4 right-4 bg-white/80 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white hover:text-red-500 transition text-stone-400"
                                            >
                                                <Heart className={`w-5 h-5 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                            </button>
                                            {property.roomsLeft && (
                                                <div className="absolute bottom-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                    Only {property.roomsLeft} left!
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div className="cursor-pointer" onClick={() => navigateTo('property', property.id)}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">{property.type}</span>
                                                            <span className="flex text-orange-400">
                                                                {[...Array(Math.floor(property.rating / 2))].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
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
                                                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">{property.description}</p>
                                                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                                                        <div className="text-sm font-bold text-stone-900 mb-2">{property.roomInfo}</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {property.features.slice(0, 3).map(f => (
                                                                <span key={f} className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
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
                                                    onClick={() => handleBook(property)}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-orange-600/20 w-full sm:w-auto"
                                                >
                                                    Reserve Stay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 3. PROPERTY DETAILS VIEW
    const ViewProperty = () => {
        const property = MOCK_PROPERTIES.find(p => p.id === activePropertyId);
        if (!property) return null;

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
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition">
                                <Share className="w-4 h-4" /> Share
                            </button>
                            <button
                                onClick={(e) => toggleFavorite(e, property.id)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition"
                            >
                                <Heart className={`w-4 h-4 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} /> Save
                            </button>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12 h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden shadow-lg border border-stone-200">
                        <div className="md:col-span-2 md:row-span-2 relative group">
                            <img src={property.gallery[0]} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                        <div className="hidden md:block relative group overflow-hidden">
                            <img src={property.gallery[1]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                        <div className="hidden md:block relative group overflow-hidden">
                            <img src={property.gallery[2]} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        </div>
                        <div className="hidden md:block md:col-span-2 relative group overflow-hidden bg-emerald-900 flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
                            <span className="relative text-white font-bold text-lg cursor-pointer flex items-center gap-2">View all photos <ChevronRight /></span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Details */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start pb-8 border-b border-stone-200 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Hosted by {property.host.name}</h2>
                                    <p className="text-stone-500 flex items-center gap-3">
                                        <span>{property.guests} guests</span> • <span>{property.bedrooms} bedrooms</span> • <span>{property.bathrooms} baths</span>
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold text-xl">
                                    {property.host.name.charAt(0)}
                                </div>
                            </div>

                            <div className="prose prose-stone max-w-none mb-12">
                                <h3 className="text-xl font-bold text-stone-900 mb-4">About this place</h3>
                                <p className="text-stone-600 leading-relaxed text-lg">{property.description}</p>
                                <p className="text-stone-600 leading-relaxed text-lg mt-4">Whether you are looking for a weekend getaway, a family vacation, or a quiet place to work remotely, this property offers everything you need for a perfect stay in Nyeri County.</p>
                            </div>

                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-stone-900 mb-6">What this place offers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {property.features.map(f => (
                                        <div key={f} className="flex items-center gap-4 text-stone-700">
                                            <div className="text-emerald-700"><Check className="w-6 h-6" /></div>
                                            <span className="text-lg">{f}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-4 text-stone-700"><Wifi className="text-emerald-700 w-6 h-6" /><span className="text-lg">Fast WiFi</span></div>
                                    <div className="flex items-center gap-4 text-stone-700"><Coffee className="text-emerald-700 w-6 h-6" /><span className="text-lg">Coffee Maker</span></div>
                                    <div className="flex items-center gap-4 text-stone-700"><Shield className="text-emerald-700 w-6 h-6" /><span className="text-lg">24/7 Security</span></div>
                                    <div className="flex items-center gap-4 text-stone-700"><Wind className="text-emerald-700 w-6 h-6" /><span className="text-lg">Fresh Air</span></div>
                                </div>
                            </div>

                            {/* Reviews Summary */}
                            <div className="bg-stone-100 rounded-3xl p-8 border border-stone-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-emerald-900 text-white font-black text-3xl px-4 py-2 rounded-2xl shadow-sm">
                                        {property.rating.toFixed(1)}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-stone-900">{property.reviewText}</div>
                                        <div className="text-stone-500 font-medium">{property.reviews} verified reviews</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium text-stone-600">
                                    <div className="flex justify-between"><span>Cleanliness</span> <span className="text-stone-900">9.5</span></div>
                                    <div className="flex justify-between"><span>Location</span> <span className="text-stone-900">9.8</span></div>
                                    <div className="flex justify-between"><span>Value</span> <span className="text-stone-900">8.9</span></div>
                                    <div className="flex justify-between"><span>Service</span> <span className="text-stone-900">9.2</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Booking Widget */}
                        <div className="w-full lg:w-96 flex-shrink-0">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200 lg:sticky lg:top-28">
                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-3xl font-black text-stone-900">KES {property.price.toLocaleString()}</span>
                                    <span className="text-stone-500 font-medium mb-1">/ night</span>
                                </div>

                                <div className="border border-stone-300 rounded-2xl mb-6 overflow-hidden">
                                    <div className="flex border-b border-stone-300">
                                        <div className="flex-1 p-3 border-r border-stone-300 bg-stone-50">
                                            <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">Check-in</span>
                                            <span className="font-semibold text-stone-900">Add date</span>
                                        </div>
                                        <div className="flex-1 p-3 bg-stone-50">
                                            <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">Check-out</span>
                                            <span className="font-semibold text-stone-900">Add date</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white">
                                        <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">Guests</span>
                                        <span className="font-semibold text-stone-900">2 guests</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-orange-600/20 text-lg mb-4"
                                >
                                    Reserve Now
                                </button>
                                <div className="text-center text-sm text-stone-500 font-medium">You won't be charged yet</div>

                                <div className="mt-6 pt-6 border-t border-stone-200 space-y-3">
                                    <div className="flex justify-between text-stone-600">
                                        <span className="underline">KES {property.price.toLocaleString()} x 1 night</span>
                                        <span>KES {property.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span className="underline">Cleaning fee</span>
                                        <span>KES 0</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span className="underline">Service fee & Taxes</span>
                                        <span>KES 450</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-stone-200 flex justify-between font-black text-xl text-stone-900">
                                    <span>Total</span>
                                    <span>KES {(property.price + 450).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 4. PROFILE VIEW
    const ViewProfile = () => {
        const [activeTab, setActiveTab] = useState('trips');

        return (
            <div className="animate-in fade-in duration-300 bg-stone-50 min-h-[70vh] pb-20">
                <div className="bg-emerald-950 pt-12 pb-24 px-4 border-b border-emerald-900">
                    <div className="max-w-5xl mx-auto flex items-center gap-6">
                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-white/20 shadow-xl">
                            JD
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Hello, John Doe</h1>
                            <p className="text-emerald-100 font-medium">Member since 2024 • Chaka Explorer</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 -mt-10">
                    <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col md:flex-row">
                        {/* Sidebar menu */}
                        <div className="w-full md:w-64 bg-stone-50 p-6 border-r border-stone-200">
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('trips')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'trips' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}`}
                                >
                                    <History className="w-5 h-5" /> My Trips
                                </button>
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'saved' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}`}
                                >
                                    <Heart className="w-5 h-5" /> Saved Stays
                                </button>
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'account' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}`}
                                >
                                    <Settings className="w-5 h-5" /> Account Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('payment')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'payment' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-600 hover:bg-stone-200'}`}
                                >
                                    <CreditCard className="w-5 h-5" /> Payments
                                </button>
                            </nav>
                            <div className="mt-12 pt-6 border-t border-stone-200">
                                <button onClick={() => navigateTo('home')} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition">
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8">
                            {activeTab === 'trips' && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-2xl font-black text-stone-900 mb-6">Upcoming & Past Trips</h2>
                                    {myBookings.length === 0 ? (
                                        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                                            <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-stone-800 mb-2">No trips booked... yet!</h3>
                                            <p className="text-stone-500 mb-6">Time to dust off your bags and plan your next Chaka adventure.</p>
                                            <button onClick={() => navigateTo('search')} className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-orange-700 transition">Start Exploring</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {myBookings.map((booking, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-stone-200 rounded-2xl hover:shadow-md transition">
                                                    <img src={booking.image} alt={booking.name} className="w-full sm:w-40 h-28 object-cover rounded-xl" />
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className="font-bold text-lg text-stone-900">{booking.name}</h3>
                                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">{booking.status}</span>
                                                            </div>
                                                            <p className="text-sm text-stone-500 flex items-center gap-1 mb-1"><Calendar className="w-4 h-4" /> Booked on: {booking.date}</p>
                                                            <p className="text-sm text-stone-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> Chaka, Nyeri</p>
                                                        </div>
                                                        <div className="text-xs font-mono text-stone-400 mt-2 sm:mt-0">Booking ID: {booking.bookingId}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'saved' && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-2xl font-black text-stone-900 mb-6">Saved Properties</h2>
                                    {favorites.length === 0 ? (
                                        <p className="text-stone-500">You haven't saved any properties yet. Click the heart icon on a property to save it for later.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {MOCK_PROPERTIES.filter(p => favorites.includes(p.id)).map(property => (
                                                <div key={property.id} className="border border-stone-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition" onClick={() => navigateTo('property', property.id)}>
                                                    <img src={property.image} className="w-full h-40 object-cover" />
                                                    <div className="p-4 bg-white">
                                                        <h3 className="font-bold text-stone-900">{property.name}</h3>
                                                        <p className="text-sm text-emerald-600 font-bold mt-1">KES {property.price.toLocaleString()} / night</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="animate-in fade-in max-w-lg">
                                    <h2 className="text-2xl font-black text-stone-900 mb-6">Account Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Legal Name</label>
                                            <input type="text" defaultValue="John Doe" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                                            <input type="email" defaultValue="john.doe@example.com" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Phone Number</label>
                                            <input type="tel" defaultValue="+254 712 345 678" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <button className="mt-4 bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-800 transition">Save Changes</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payment' && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-2xl font-black text-stone-900 mb-6">Payment Methods</h2>
                                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold italic">M-PESA</div>
                                            <div>
                                                <div className="font-bold text-stone-900">M-PESA Mobile Money</div>
                                                <div className="text-sm text-stone-500">Connected to 0712***678</div>
                                            </div>
                                        </div>
                                        <span className="text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-xs">Default</span>
                                    </div>
                                    <button className="text-emerald-700 font-bold hover:underline">+ Add new payment method</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col selection:bg-orange-200">
            <Navbar />

            {/* Main Content Router */}
            <main className="flex-1">
                {currentView === 'home' && <ViewHome />}
                {currentView === 'search' && <ViewSearch />}
                {currentView === 'property' && <ViewProperty />}
                {currentView === 'profile' && <ViewProfile />}
            </main>

            <Footer />

            {/* Booking Modal */}
            {showBookingModal && activePropertyId && (
                <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-stone-100">
                        <div className="bg-emerald-900 text-white px-6 py-5 flex justify-between items-center">
                            <h2 className="text-xl font-bold tracking-tight">Confirm Reservation</h2>
                            <button onClick={() => setShowBookingModal(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            {(() => {
                                const property = MOCK_PROPERTIES.find(p => p.id === activePropertyId);
                                return (
                                    <>
                                        <h3 className="text-2xl font-black text-stone-900 mb-2 leading-tight">{property.name}</h3>
                                        <p className="text-sm text-stone-500 mb-8 flex items-center gap-1.5 font-medium">
                                            <MapPin className="w-4 h-4 text-emerald-600" /> {property.distance}
                                        </p>

                                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-8">
                                            <div className="flex justify-between mb-4 pb-4 border-b border-stone-200">
                                                <span className="font-semibold text-stone-500">Dates</span>
                                                <span className="text-stone-900 font-bold">1 Night (Flexible)</span>
                                            </div>
                                            <div className="flex justify-between mb-4 pb-4 border-b border-stone-200">
                                                <span className="font-semibold text-stone-500">Guests</span>
                                                <span className="text-stone-900 font-bold">2 Adults, 1 Room</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="font-bold text-stone-500">Total Price</span>
                                                <span className="text-2xl font-black text-emerald-900">
                                                    KES {(property.price + 450).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-right text-xs text-stone-400 mt-1 font-medium">Includes KES 450 in taxes</div>
                                        </div>

                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                            <button
                                                onClick={() => setShowBookingModal(false)}
                                                className="px-6 py-3 border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition w-full sm:w-auto"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmBooking}
                                                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition w-full sm:w-auto flex justify-center items-center gap-2"
                                            >
                                                Confirm & Pay
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Global Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/20 flex items-center gap-4 z-[110] animate-in slide-in-from-bottom-5">
                    <div className="bg-emerald-800 rounded-full p-1.5 border border-emerald-700">
                        <Check className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="font-medium text-base">{toastMessage}</span>
                    <button onClick={() => setToastMessage('')} className="ml-2 text-emerald-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}