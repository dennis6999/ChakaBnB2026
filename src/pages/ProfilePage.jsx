import React, { useState } from 'react';
import { History, Heart, Settings, CreditCard, LogOut, Calendar, MapPin, LogIn } from 'lucide-react';

export default function ProfilePage({ navigateTo, myBookings, favorites, properties, user, onSignOut, onSignIn }) {
    const [activeTab, setActiveTab] = useState('trips');

    const savedProperties = properties.filter((p) => favorites.includes(p.id));

    const displayName = user?.name || 'Guest';
    const displayEmail = user?.email || '';
    const displayInitials = user?.initials || '?';

    const navItems = [
        { id: 'trips', label: 'My Trips', icon: <History className="w-5 h-5" /> },
        { id: 'saved', label: 'Saved Stays', icon: <Heart className="w-5 h-5" /> },
        { id: 'account', label: 'Account Info', icon: <Settings className="w-5 h-5" /> },
        { id: 'payment', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    ];

    // Guest (not logged in) state
    if (!user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 px-4 py-20">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-10 h-10 text-stone-400" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 mb-2">Sign in to view your profile</h2>
                    <p className="text-stone-500 mb-6">Access your trips, saved properties, and account settings.</p>
                    <button
                        onClick={onSignIn}
                        className="bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow hover:bg-orange-700 transition"
                    >
                        Sign In / Create Account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300 bg-stone-50 min-h-[70vh] pb-20">
            {/* Profile Header */}
            <div className="bg-emerald-950 pt-12 pb-24 px-4 border-b border-emerald-900">
                <div className="max-w-5xl mx-auto flex items-center gap-6">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-white/20 shadow-xl">
                        {displayInitials}
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Hello, {displayName}</h1>
                        <p className="text-emerald-100 font-medium">{displayEmail} • Chaka Explorer</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-10">
                <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-stone-50 p-6 border-r border-stone-200 flex-shrink-0">
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === item.id
                                        ? 'bg-emerald-900 text-white shadow-md'
                                        : 'text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    {item.icon} {item.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-12 pt-6 border-t border-stone-200">
                            <button
                                onClick={onSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition"
                            >
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 min-w-0">

                        {/* My Trips */}
                        {activeTab === 'trips' && (
                            <div className="animate-in fade-in">
                                <h2 className="text-2xl font-black text-stone-900 mb-6">Upcoming &amp; Past Trips</h2>
                                {myBookings.length === 0 ? (
                                    <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                                        <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-stone-800 mb-2">No trips booked… yet!</h3>
                                        <p className="text-stone-500 mb-6">Time to dust off your bags and plan your next Chaka adventure.</p>
                                        <button
                                            onClick={() => navigateTo('search')}
                                            className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-orange-700 transition"
                                        >
                                            Start Exploring
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myBookings.map((booking, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-stone-200 rounded-2xl hover:shadow-md transition">
                                                <img
                                                    src={booking.properties?.image || booking.image}
                                                    alt={`Booking: ${booking.properties?.name || booking.name}`}
                                                    loading="lazy"
                                                    className="w-full sm:w-40 h-28 object-cover rounded-xl flex-shrink-0"
                                                />
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1 gap-2">
                                                            <h3 className="font-bold text-lg text-stone-900 leading-tight">{booking.properties?.name || booking.name}</h3>
                                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded flex-shrink-0">
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-stone-500 flex items-center gap-1 mb-1">
                                                            <Calendar className="w-4 h-4" /> Booked: {booking.date || new Date(booking.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-sm text-stone-500 flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" /> {booking.properties?.distance || booking.distance || 'Chaka, Nyeri'}
                                                        </p>
                                                    </div>
                                                    <div className="text-xs font-mono text-stone-400 mt-2">
                                                        ID: {booking.bookingId || booking.id?.split('-')[0]?.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Saved */}
                        {activeTab === 'saved' && (
                            <div className="animate-in fade-in">
                                <h2 className="text-2xl font-black text-stone-900 mb-6">Saved Properties</h2>
                                {savedProperties.length === 0 ? (
                                    <p className="text-stone-500">You haven't saved any properties yet. Click the ❤️ heart on any property to save it here.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedProperties.map((property) => (
                                            <div
                                                key={property.id}
                                                className="border border-stone-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition"
                                                onClick={() => navigateTo('property', property.id)}
                                            >
                                                <img src={property.image} alt={`Saved property: ${property.name}`} loading="lazy" className="w-full h-40 object-cover" />
                                                <div className="p-4 bg-white">
                                                    <h3 className="font-bold text-stone-900 truncate">{property.name}</h3>
                                                    <p className="text-sm text-emerald-600 font-bold mt-1">KES {property.price.toLocaleString()} / night</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Account Info */}
                        {activeTab === 'account' && (
                            <div className="animate-in fade-in max-w-lg">
                                <h2 className="text-2xl font-black text-stone-900 mb-6">Account Information</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Legal Name', type: 'text', value: displayName },
                                        { label: 'Email Address', type: 'email', value: displayEmail },
                                        { label: 'Phone Number', type: 'tel', value: user?.phone || '' },
                                    ].map((field) => (
                                        <div key={field.label}>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                defaultValue={field.value}
                                                placeholder={field.value ? undefined : 'Not provided'}
                                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    ))}
                                    <button className="mt-4 bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-800 transition">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payments */}
                        {activeTab === 'payment' && (
                            <div className="animate-in fade-in">
                                <h2 className="text-2xl font-black text-stone-900 mb-6">Payment Methods</h2>
                                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-9 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold italic">
                                            M-PESA
                                        </div>
                                        <div>
                                            <div className="font-bold text-stone-900">M-PESA Mobile Money</div>
                                            <div className="text-sm text-stone-500">Connected to 0712***678</div>
                                        </div>
                                    </div>
                                    <span className="text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-xs">Default</span>
                                </div>
                                <button className="text-emerald-700 font-bold hover:underline text-sm">
                                    + Add new payment method
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
