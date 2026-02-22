import React, { useState, useEffect } from 'react';
import { api } from './services/api.js';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BookingModal from './components/BookingModal.jsx';
import Toast from './components/Toast.jsx';
import AuthModal from './components/AuthModal.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import PropertyPage from './pages/PropertyPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import { SkeletonPage } from './components/Skeleton.jsx';

const VALID_VIEWS = ['home', 'search', 'property', 'profile', 'confirmation', 'signin', '404', 'host'];

export default function App() {
    // --- STATE ---
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState(() => localStorage.getItem('currentView') || 'home');
    const [activePropertyId, setActivePropertyId] = useState(() => localStorage.getItem('activePropertyId') || null);
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState('login');
    const [pendingHostBookings, setPendingHostBookings] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [lastBooking, setLastBooking] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [filters, setFilters] = useState({ type: [], policies: [], meals: [] });
    const [sortBy, setSortBy] = useState('top_picks');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [profileTab, setProfileTab] = useState(() => localStorage.getItem('activeProfileTab') || 'trips');

    // --- NAVIGATION ---
    const navigateTo = (view, propertyId = null, tab = null) => {
        const target = VALID_VIEWS.includes(view) ? view : '404';
        if (propertyId !== null) {
            setActivePropertyId(propertyId);
            localStorage.setItem('activePropertyId', String(propertyId));
        }
        if (tab !== null) {
            setProfileTab(tab);
            localStorage.setItem('activeProfileTab', tab);
        }
        setCurrentView(target);
        localStorage.setItem('currentView', target);
    };

    // --- HELPERS ---
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const loadUserData = async (currentUser) => {
        try {
            const [userBookings, hostReservations, hostMessages] = await Promise.all([
                api.getUserBookings(currentUser.id),
                api.getHostReservations(currentUser.id),
                api.getHostMessages(currentUser.id)
            ]);
            setMyBookings(userBookings);
            const lastHostView = Number(localStorage.getItem('lastHostView') || 0);
            const newRes = hostReservations.filter(r => new Date(r.created_at).getTime() > lastHostView);
            const newMsgs = hostMessages.filter(m => new Date(m.created_at).getTime() > lastHostView);
            setPendingHostBookings(newRes.length + newMsgs.length);
        } catch (err) {
            console.error('Failed to load user data:', err);
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        const init = async () => {
            try {
                const [data, currentUser] = await Promise.all([
                    api.getProperties(),
                    api.getCurrentUser()
                ]);
                setProperties(data);
                if (currentUser) {
                    setUser(currentUser);
                    await loadUserData(currentUser);
                    // If persisted view is signup, redirect to home
                    if (localStorage.getItem('currentView') === 'signin') {
                        setCurrentView('home');
                        localStorage.setItem('currentView', 'home');
                    }
                }
            } catch (err) {
                console.error('Init error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, [currentView, activePropertyId]);

    useEffect(() => {
        if (currentView === 'host') {
            localStorage.setItem('lastHostView', Date.now().toString());
            setPendingHostBookings(0);
        }
    }, [currentView]);

    // --- HANDLERS ---
    const handleAuth = (userData) => {
        setUser(userData);
        setShowAuthModal(false);
        showToast(`Welcome back, ${userData.name}! 👋`);
        navigateTo('home');
        loadUserData(userData);
    };

    const handleSignOut = async () => {
        await api.logout();
        setUser(null);
        setMyBookings([]);
        setPendingHostBookings(0);
        localStorage.removeItem('currentView');
        localStorage.removeItem('activePropertyId');
        navigateTo('home');
        showToast('You\u2019ve been signed out');
    };

    const handleUpdateUser = async (name, phone) => {
        try {
            const updatedUser = await api.updateUserProfile(name, phone);
            setUser(updatedUser);
            showToast('Profile updated successfully!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            showToast('Failed to update profile. Please try again.');
        }
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        if (favorites.includes(id)) {
            setFavorites(favorites.filter(f => f !== id));
            showToast('Removed from saved properties');
        } else {
            setFavorites([...favorites, id]);
            showToast('Saved to your properties');
        }
    };

    const handleBook = (propertyWithBookingDetails) => {
        if (!user) {
            setAuthTab('login');
            setShowAuthModal(true);
            showToast('Please sign in to book a stay');
            return;
        }
        setActivePropertyId(propertyWithBookingDetails.id);
        setBookingData(propertyWithBookingDetails);
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        const property = properties.find(p => p.id === activePropertyId);
        const totalP = bookingData?.totalPrice || (property ? property.price + 450 : 0);
        const payload = {
            ...property,
            checkInStr: bookingData?.checkIn ? bookingData.checkIn.toLocaleDateString('en-CA') : null,
            checkOutStr: bookingData?.checkOut ? bookingData.checkOut.toLocaleDateString('en-CA') : null,
            rooms: bookingData?.rooms || 1,
            totalPrice: totalP,
        };
        try {
            const confirmed = await api.createBooking(payload);
            setMyBookings(prev => [confirmed, ...prev]);
            setLastBooking(confirmed);
            setShowBookingModal(false);
            setBookingData(null);
            navigateTo('confirmation');
        } catch (err) {
            console.error('Booking failed:', err);
            showToast('Failed to book the property. Please try again.');
            setShowBookingModal(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const updated = await api.cancelBooking(bookingId);
            setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
            showToast('Booking cancelled successfully.');
        } catch (err) {
            console.error('Cancellation failed:', err);
            showToast('Failed to cancel the booking. Please try again.');
        }
    };

    const openSignIn = () => navigateTo('signin');
    const activeProperty = properties.find(p => p.id === activePropertyId) || null;

    // --- RENDER ---

    // Always show skeleton while initializing — prevents sign-in page flash during OAuth redirect
    if (isLoading) return <SkeletonPage />;

    if (currentView === 'signin') {
        return (
            <>
                <SignInPage initialTab="login" onAuth={handleAuth} navigateTo={navigateTo} />
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col selection:bg-orange-200">
            <Navbar
                navigateTo={navigateTo}
                bookingCount={myBookings.length}
                hostBookingCount={pendingHostBookings}
                user={user}
                onAuthClick={openSignIn}
                onSignOut={handleSignOut}
            />
            <main className="flex-1">
                {currentView === 'home' && <HomePage navigateTo={navigateTo} favorites={favorites} toggleFavorite={toggleFavorite} setFilters={setFilters} />}
                {currentView === 'search' && <SearchPage navigateTo={navigateTo} favorites={favorites} toggleFavorite={toggleFavorite} filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} onBook={handleBook} />}
                {currentView === 'property' && <PropertyPage property={activeProperty} isFavorite={favorites.includes(activePropertyId)} onToggleFavorite={toggleFavorite} onBook={handleBook} navigateTo={navigateTo} favorites={favorites} toggleFavorite={toggleFavorite} searchFilters={filters} user={user} />}
                {currentView === 'profile' && <ProfilePage initialTab={profileTab} navigateTo={navigateTo} myBookings={myBookings} favorites={favorites} properties={properties} user={user} onSignOut={handleSignOut} onSignIn={openSignIn} onCancelBooking={handleCancelBooking} onUpdateUser={handleUpdateUser} />}
                {currentView === 'host' && <HostDashboard user={user} navigateTo={navigateTo} />}
                {currentView === 'confirmation' && <ConfirmationPage booking={lastBooking} onNavigate={navigateTo} />}
                {currentView === '404' && <NotFoundPage navigateTo={navigateTo} />}
            </main>
            <Footer navigateTo={navigateTo} />
            {showBookingModal && activeProperty && <BookingModal property={bookingData || activeProperty} onConfirm={confirmBooking} onClose={() => setShowBookingModal(false)} />}
            {showAuthModal && <AuthModal initialTab={authTab} onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />}
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            <ScrollToTop />
        </div>
    );
}
