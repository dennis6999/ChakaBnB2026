import React, { useState } from 'react';
import { History, Heart, Settings, CreditCard, LogOut, Calendar, MapPin, LogIn, Loader } from 'lucide-react';

export default function ProfilePage({ navigateTo, initialTab = 'trips', myBookings, favorites, properties, user, onSignOut, onSignIn, onCancelBooking, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState(initialTab);

    React.useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const [cancelingId, setCancelingId] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ open: false, bookingId: null });

    // Controlled inputs for profile
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    const handleCancel = (bookingId) => {
        setConfirmModal({ open: true, bookingId });
    };

    const confirmCancel = async () => {
        const bookingId = confirmModal.bookingId;
        setConfirmModal({ open: false, bookingId: null });
        setCancelingId(bookingId);
        await onCancelBooking(bookingId);
        setCancelingId(null);
    };

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

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        if (onUpdateUser) {
            await onUpdateUser(profileForm.name, profileForm.phone);
        }
        setSavingProfile(false);
    };

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
        <>
            <div className="animate-in fade-in duration-300 bg-stone-50 min-h-[70vh] pb-20">
                {/* Profile Header */}
                <div className="bg-emerald-950 pt-12 pb-24 px-4 border-b border-emerald-900">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-white/20 shadow-xl shrink-0">
                            {displayInitials}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 break-all md:break-normal">Hello, {displayName}</h1>
                            <p className="text-emerald-100 font-medium break-all md:break-normal">{displayEmail} • Chaka Explorer</p>
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
                                                                <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-orange-100 text-orange-800'
                                                                    }`}>
                                                                    {booking.status || 'Pending'}
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
                                                        {booking.status === 'Confirmed' && (
                                                            <div className="mt-4 flex justify-end shrink-0 w-full sm:w-auto">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleCancel(booking.id); }}
                                                                    disabled={cancelingId === booking.id}
                                                                    className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                                                                >
                                                                    {cancelingId === booking.id ? <><Loader className="w-4 h-4 animate-spin" /> Canceling...</> : 'Cancel Booking'}
                                                                </button>
                                                            </div>
                                                        )}
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
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Legal Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                                required
                                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                            <input
                                                type="email"
                                                value={displayEmail}
                                                disabled
                                                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-stone-400 mt-1">Email cannot be changed directly.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="e.g. 0712345678"
                                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="mt-4 bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-emerald-800 transition disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingProfile ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                                        </button>
                                    </form>
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

            {/* Cancel Booking Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmModal({ open: false, bookingId: null })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-5">
                            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-stone-900 text-center mb-2">Cancel this booking?</h3>
                        <p className="text-stone-500 text-center text-sm mb-7">This action cannot be undone. Your booking will be permanently cancelled.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setConfirmModal({ open: false, bookingId: null })}
                                className="flex-1 px-5 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
