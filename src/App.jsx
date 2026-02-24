import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
import InboxPage from './pages/InboxPage.jsx';
import { SkeletonPage } from './components/Skeleton.jsx';

const VALID_VIEWS = ['home', 'search', 'property', 'profile', 'confirmation', 'signin', '404', 'host', 'inbox'];

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

function AppContent() {
    // --- STATE ---
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activePropertyId, setActivePropertyId] = useState(() => localStorage.getItem('activePropertyId') || null);
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState('login');
    const [pendingHostBookings, setPendingHostBookings] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [lastBooking, setLastBooking] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [filters, setFilters] = useState({ type: [], policies: [], meals: [] });
    const [sortBy, setSortBy] = useState('top_picks');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [isBookingInProgress, setIsBookingInProgress] = useState(false);
    const [profileTab, setProfileTab] = useState(() => localStorage.getItem('activeProfileTab') || 'trips');

    // --- NAVIGATION CONTROLLER ---
    // This wrapper maintains compatibility with all our child components that still call navigateTo('search', id, tab)
    const navigateTo = (view, propertyId = null, tab = null) => {
        if (propertyId !== null) {
            setActivePropertyId(propertyId);
            localStorage.setItem('activePropertyId', String(propertyId));
        }
        if (tab !== null) {
            setProfileTab(tab);
            localStorage.setItem('activeProfileTab', tab);
        }

        switch (view) {
            case 'home': navigate('/'); break;
            case 'search': navigate('/search'); break;
            case 'property': navigate(`/property/${propertyId || activePropertyId}`); break;
            case 'profile': navigate('/profile'); break;
            case 'host': navigate('/host'); break;
            case 'inbox': navigate('/inbox'); break;
            case 'confirmation': navigate('/confirmation'); break;
            case 'signin': navigate('/signin'); break;
            default: navigate('/404'); break;
        }
    };

    // Keep activeProperty synced when navigating directly
    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/property/')) {
            const id = parseInt(path.split('/')[2]);
            if (!isNaN(id)) {
                setActivePropertyId(id);
                localStorage.setItem('activePropertyId', String(id));
            }
        }
    }, [window.location.pathname]);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const loadUserData = async (currentUser) => {
        try {
            const [userBookings, hostReservations, hostMessages, unreadMessages] = await Promise.all([
                api.getUserBookings(currentUser.id),
                api.getHostReservations(currentUser.id),
                api.getHostMessages(currentUser.id),
                api.getUnreadMessageCount(currentUser.id)
            ]);
            setMyBookings(userBookings);
            setUnreadMessageCount(Number(unreadMessages) || 0);

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

                    // If persisted view was signin, push to home on fresh authenticated load
                    if (localStorage.getItem('currentView') === 'signin') {
                        localStorage.setItem('currentView', 'home');
                        navigate('/');
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

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [window.location.pathname, activePropertyId]);

    // Handle clearing pending host bookings when visiting the host dashboard
    useEffect(() => {
        if (window.location.pathname === '/host') {
            localStorage.setItem('lastHostView', Date.now().toString());
            setPendingHostBookings(0);
        }
    }, [window.location.pathname]);

    // --- HANDLERS ---
    const handleAuth = (userData) => {
        setUser(userData);
        setShowAuthModal(false);
        showToast(`Welcome back, ${userData.name}! 👋`);
        if (currentView === 'signin') {
            navigateTo('home');
        }
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
        // Guard against double-submission from rapid clicks
        if (isBookingInProgress) return;
        setIsBookingInProgress(true);

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
        } finally {
            setIsBookingInProgress(false);
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

    // Always show skeleton while initializing
    if (isLoading) return <SkeletonPage />;

    // Intercept sign-in view if explicitly routed or forced
    if (window.location.pathname === '/signin' || authTab === 'login_overlay') {
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
                unreadMessageCount={unreadMessageCount}
                user={user}
                onAuthClick={openSignIn}
                onSignOut={handleSignOut}
            />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage navigateTo={navigateTo} favorites={favorites} toggleFavorite={toggleFavorite} setFilters={setFilters} />} />
                    <Route path="/search" element={<SearchPage navigateTo={navigateTo} favorites={favorites} toggleFavorite={toggleFavorite} filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy} onBook={handleBook} />} />
                    <Route path="/property/:id" element={<PropertyPageRouteWrapper properties={properties} favorites={favorites} toggleFavorite={toggleFavorite} handleBook={handleBook} navigateTo={navigateTo} searchFilters={filters} user={user} />} />
                    <Route path="/profile" element={<ProfilePage initialTab={profileTab} navigateTo={navigateTo} myBookings={myBookings} favorites={favorites} properties={properties} user={user} onSignOut={handleSignOut} onSignIn={openSignIn} onCancelBooking={handleCancelBooking} onUpdateUser={handleUpdateUser} />} />
                    <Route path="/host" element={<HostDashboard user={user} navigateTo={navigateTo} />} />
                    <Route path="/inbox" element={<InboxPage user={user} navigateTo={navigateTo} />} />
                    <Route path="/confirmation" element={<ConfirmationPage booking={lastBooking} onNavigate={navigateTo} />} />
                    <Route path="*" element={<NotFoundPage navigateTo={navigateTo} />} />
                </Routes>
            </main>
            <Footer navigateTo={navigateTo} />
            {showBookingModal && activeProperty && <BookingModal property={bookingData || activeProperty} onConfirm={confirmBooking} onClose={() => setShowBookingModal(false)} isLoading={isBookingInProgress} />}
            {showAuthModal && <AuthModal initialTab={authTab} onAuth={handleAuth} onClose={() => setShowAuthModal(false)} />}
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            <ScrollToTop />
        </div>
    );
}

// Wrapper to bridge react-router's :id param to our existing PropertyPage 
function PropertyPageRouteWrapper({ properties, favorites, toggleFavorite, handleBook, navigateTo, searchFilters, user }) {
    const { id } = useParams();
    const propertyId = parseInt(id);
    const activeProperty = properties.find(p => p.id === propertyId);

    // If properties are loaded but no match is found, show 404
    if (properties.length > 0 && !activeProperty) {
        return <NotFoundPage navigateTo={navigateTo} />;
    }

    // PropertyPage handles its own skeleton/loading states inside if property is undefined initially
    return (
        <PropertyPage
            property={activeProperty}
            isFavorite={favorites.includes(propertyId)}
            onToggleFavorite={toggleFavorite}
            onBook={handleBook}
            navigateTo={navigateTo}
            searchFilters={searchFilters}
            user={user}
        />
    );
}
