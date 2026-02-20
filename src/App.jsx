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
import { SkeletonPage } from './components/Skeleton.jsx';

const VALID_VIEWS = ['home', 'search', 'property', 'profile', 'confirmation', 'signin', '404'];

export default function App() {
    // --- GLOBAL DATA ---
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                const data = await api.getProperties();
                setProperties(data);
            } catch (err) {
                console.error("Failed to fetch global properties", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGlobalData();
    }, []);

    // --- ROUTING ---
    const [currentView, setCurrentView] = useState('home');
    const [activePropertyId, setActivePropertyId] = useState(null);

    // --- AUTH STATE ---
    const [user, setUser] = useState(null);           // null = logged out, { name, email, initials } = logged in
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState('login');  // 'login' | 'signup'

    // --- APP STATE ---
    const [favorites, setFavorites] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [lastBooking, setLastBooking] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    // --- SEARCH / FILTER STATE ---
    const [filters, setFilters] = useState({ type: [], policies: [], meals: [] });
    const [sortBy, setSortBy] = useState('top_picks');

    // --- MODAL STATE ---
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState(null);

    // Scroll to top on every view/property change
    useEffect(() => { window.scrollTo(0, 0); }, [currentView, activePropertyId]);

    // --- HANDLERS ---
    const navigateTo = (view, propertyId = null) => {
        const target = VALID_VIEWS.includes(view) ? view : '404';
        if (propertyId !== null) setActivePropertyId(propertyId);
        setCurrentView(target);
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

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
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

    const confirmBooking = () => {
        const property = properties.find(p => p.id === activePropertyId);

        // Use details from the PropertyPage booking widget if they exist, otherwise fallback securely
        const nightsLocal = bookingData?.checkIn && bookingData?.checkOut ? Math.round((bookingData.checkOut - bookingData.checkIn) / (1000 * 60 * 60 * 24)) : 1;
        const totalP = bookingData?.totalPrice || (property ? property.price + 450 : 0);

        const newBooking = {
            ...property,
            bookingId: Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Confirmed',
            checkIn: bookingData?.checkIn ? bookingData.checkIn.toLocaleDateString() : 'N/A',
            checkOut: bookingData?.checkOut ? bookingData.checkOut.toLocaleDateString() : 'N/A',
            rooms: bookingData?.rooms || 1,
            totalPrice: totalP
        };
        setMyBookings(prev => [...prev, newBooking]);
        setLastBooking(newBooking);
        setShowBookingModal(false);
        setBookingData(null);
        navigateTo('confirmation');
    };

    const handleAuth = (userData) => {
        setUser(userData);
        setShowAuthModal(false);
        // If user was on the sign-in page, send them home after auth
        if (currentView === 'signin') navigateTo('home');
        showToast(`Welcome back, ${userData.name}! 👋`);
    };

    const handleSignOut = () => {
        setUser(null);
        navigateTo('home');
        showToast('You\u2019ve been signed out');
    };

    // Navigate to the dedicated sign-in page
    const openSignIn = () => navigateTo('signin');
    const openSignUp = () => { navigateTo('signin'); }; // same page, default tab is login; signup tab available

    const activeProperty = properties.find(p => p.id === activePropertyId) || null;

    // Sign-in page renders without global chrome (its own nav + back-button)
    if (currentView === 'signin') {
        return (
            <>
                <SignInPage
                    initialTab="login"
                    onAuth={handleAuth}
                    navigateTo={navigateTo}
                />
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            </>
        );
    }

    if (isLoading) {
        return <SkeletonPage />;
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col selection:bg-orange-200">
            <Navbar
                navigateTo={navigateTo}
                bookingCount={myBookings.length}
                user={user}
                onAuthClick={openSignIn}
                onSignOut={handleSignOut}
            />

            <main className="flex-1">
                {currentView === 'home' && (
                    <HomePage
                        navigateTo={navigateTo}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />
                )}
                {currentView === 'search' && (
                    <SearchPage
                        navigateTo={navigateTo}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        filters={filters}
                        setFilters={setFilters}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        onBook={handleBook}
                    />
                )}
                {currentView === 'property' && (
                    <PropertyPage
                        property={activeProperty}
                        isFavorite={favorites.includes(activePropertyId)}
                        onToggleFavorite={toggleFavorite}
                        onBook={handleBook}
                        navigateTo={navigateTo}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        searchFilters={filters}
                    />
                )}
                {currentView === 'profile' && (
                    <ProfilePage
                        navigateTo={navigateTo}
                        myBookings={myBookings}
                        favorites={favorites}
                        properties={properties}
                        user={user}
                        onSignOut={handleSignOut}
                        onSignIn={openSignIn}
                    />
                )}
                {currentView === 'confirmation' && (
                    <ConfirmationPage
                        booking={lastBooking}
                        onNavigate={navigateTo}
                    />
                )}
                {currentView === '404' && (
                    <NotFoundPage navigateTo={navigateTo} />
                )}
            </main>

            <Footer navigateTo={navigateTo} />

            {/* Booking Modal */}
            {showBookingModal && activeProperty && (
                <BookingModal
                    property={bookingData || activeProperty}
                    onConfirm={confirmBooking}
                    onClose={() => setShowBookingModal(false)}
                />
            )}

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    initialTab={authTab}
                    onAuth={handleAuth}
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {/* Global Toast */}
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />

            {/* Scroll to top */}
            <ScrollToTop />
        </div>
    );
}
