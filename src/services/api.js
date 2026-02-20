import { supabase } from './supabase';

export const api = {
    // ---- PROPERTIES ----

    // Fetch all properties
    getProperties: async () => {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) {
            console.error("Error fetching properties:", error);
            throw error;
        }
        return data;
    },

    // Fetch a single property by ID
    getPropertyById: async (id) => {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },

    // Fetch similar properties
    getSimilarProperties: async (id, type) => {
        let { data, error } = await supabase
            .from('properties')
            .select('*')
            .neq('id', id)
            .eq('type', type)
            .limit(3);

        if (error) throw error;

        // Fallback if not enough similar type
        if (!data || data.length === 0) {
            const fallback = await supabase.from('properties').select('*').neq('id', id).limit(3);
            return fallback.data || [];
        }
        return data;
    },

    // ---- REVIEWS ----

    // Fetch reviews for a specific property
    getPropertyReviews: async (propertyId) => {
        const { data, error } = await supabase.from('reviews').select('*').eq('property_id', propertyId);
        if (error) throw error;
        return data || [];
    },

    // ---- AUTH / USERS ----

    // Real Supabase login
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email,
            initials: (data.user.user_metadata?.name || email).charAt(0).toUpperCase()
        };
    },

    // Real Supabase signup
    signup: async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) throw error;
        return {
            id: data.user.id,
            name: name || email.split('@')[0],
            email: data.user.email,
            initials: (name || email).charAt(0).toUpperCase()
        };
    },

    // Get current session user
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        return {
            id: user.id,
            name: user.user_metadata?.name || user.email.split('@')[0],
            email: user.email,
            initials: (user.user_metadata?.name || user.email).charAt(0).toUpperCase()
        };
    },

    // Sign out
    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // ---- BOOKINGS ----

    // Fetch user bookings
    getUserBookings: async (userId) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, properties(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Submit a new booking
    createBooking: async (bookingDetails) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to book.");

        const payload = {
            user_id: user.id,
            property_id: bookingDetails.id,
            check_in: bookingDetails.checkInStr || new Date().toISOString(),
            check_out: bookingDetails.checkOutStr || new Date(Date.now() + 86400000).toISOString(),
            rooms: bookingDetails.rooms || 1,
            total_price: bookingDetails.totalPrice || bookingDetails.price,
            status: 'Confirmed'
        };

        const { data, error } = await supabase.from('bookings').insert([payload]).select().single();
        if (error) throw error;

        // Return constructed booking object expecting by the frontend App state
        return {
            ...bookingDetails, // Original property details
            ...data,           // Merge with db booking row
            bookingId: data.id.split('-')[0].toUpperCase(), // Short friendly ID
            date: new Date(data.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })
        };
    }
};
