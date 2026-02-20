import { MOCK_PROPERTIES } from '../data/properties.js';
import { MOCK_REVIEWS } from '../data/reviews.js';

// Simulate network latency (e.g. 800ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
    // ---- PROPERTIES ----

    // Fetch all properties
    getProperties: async () => {
        await delay(800);
        return [...MOCK_PROPERTIES];
    },

    // Fetch a single property by ID
    getPropertyById: async (id) => {
        await delay(600);
        const property = MOCK_PROPERTIES.find(p => p === id || p.id === id); // Handle int or string
        if (!property) throw new Error("Property not found");
        return { ...property };
    },

    // Fetch similar properties
    getSimilarProperties: async (id, type) => {
        await delay(600);
        const similar = MOCK_PROPERTIES.filter(p => prev => p.id !== id && p.type === type).slice(0, 3);
        if (similar.length > 0) return similar;
        return MOCK_PROPERTIES.filter(p => p.id !== id).slice(0, 3);
    },

    // ---- REVIEWS ----

    // Fetch reviews for a specific property
    getPropertyReviews: async (propertyId) => {
        await delay(500);
        return MOCK_REVIEWS[propertyId] || [];
    },

    // ---- AUTH / USERS ----

    // Simulate login
    login: async (email, password) => {
        await delay(1000);
        if (email && password) {
            return {
                id: 'usr_123',
                name: email.split('@')[0],
                email: email,
                initials: email.charAt(0).toUpperCase()
            };
        }
        throw new Error("Invalid credentials");
    },

    // Simulate signup
    signup: async (name, email, password) => {
        await delay(1000);
        return {
            id: 'usr_456',
            name: name || email.split('@')[0],
            email: email,
            initials: (name || email).charAt(0).toUpperCase()
        };
    },

    // ---- BOOKINGS ----

    // Fetch user bookings
    getUserBookings: async (userId) => {
        await delay(800);
        // Currently handled in App state, but a real API would return an array here
        return [];
    },

    // Submit a new booking
    createBooking: async (bookingDetails) => {
        await delay(1200);
        return {
            ...bookingDetails,
            bookingId: Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: 'Confirmed'
        };
    }
};
