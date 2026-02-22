import { supabase } from './supabase';

export const api = {
    // ---- PROPERTIES ----

    // Fetch all properties
    getProperties: async () => {
        const { data, error } = await supabase.from('properties').select('*').eq('is_active', true);
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

    // Fetch properties for a specific host
    getHostProperties: async (hostId) => {
        const { data, error } = await supabase.from('properties').select('*').eq('host_id', hostId);
        if (error) throw error;
        return data || [];
    },

    // Create a new property
    createProperty: async (propertyData) => {
        const { data, error } = await supabase.from('properties').insert([propertyData]).select().single();
        if (error) throw error;
        return data;
    },

    // Update an existing property
    updateProperty: async (propertyId, propertyData) => {
        const { data, error } = await supabase.from('properties').update(propertyData).eq('id', propertyId).select().single();
        if (error) throw error;
        return data;
    },

    // Toggle property visibility (Host action)
    togglePropertyVisibility: async (propertyId, isActive) => {
        const { data, error } = await supabase
            .from('properties')
            .update({ is_active: isActive })
            .eq('id', propertyId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ---- REVIEWS ----

    // Fetch reviews for a specific property
    getPropertyReviews: async (propertyId) => {
        const { data, error } = await supabase.from('reviews').select('*').eq('property_id', propertyId).order('id', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Submit a new review
    submitReview: async (propertyId, userName, rating, comment) => {
        const date = new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ property_id: propertyId, user_name: userName, rating, date, comment }])
            .select()
            .single();
        if (error) throw error;

        // Recalculate avg rating and update the property
        const { data: allReviews } = await supabase.from('reviews').select('rating').eq('property_id', propertyId);
        if (allReviews && allReviews.length > 0) {
            const avg = allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length;
            await supabase.from('properties').update({
                rating: Math.round(avg * 10) / 10,
                reviews: allReviews.length
            }).eq('id', propertyId);
        }
        return data;
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

    // Sign in with Google OAuth
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Ensure redirect lands back to the app correctly
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        // The return isn't needed here as Supabase redirects the browser.
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

    // Update User Profile Metadata
    updateUserProfile: async (name, phone) => {
        const { data, error } = await supabase.auth.updateUser({
            data: { name, phone }
        });
        if (error) throw error;

        const user = data.user;
        return {
            id: user.id,
            name: user.user_metadata?.name || user.email.split('@')[0],
            email: user.email,
            phone: user.user_metadata?.phone,
            initials: (user.user_metadata?.name || user.email).charAt(0).toUpperCase()
        };
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

    // Fetch incoming reservations for a host
    getHostReservations: async (hostId) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, properties!inner(*)')
            .eq('properties.host_id', hostId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Update booking status
    updateBookingStatus: async (bookingId, status) => {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Cancel a booking (Guest action)
    cancelBooking: async (bookingId) => {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'Cancelled' })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Block dates (Host action)
    blockPropertyDates: async (propertyId, checkIn, checkOut) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in.");

        const payload = {
            user_id: user.id,
            property_id: propertyId,
            check_in: checkIn,
            check_out: checkOut,
            rooms: 1,
            total_price: 0,
            status: 'HostBlock'
        };

        const { data, error } = await supabase.from('bookings').insert([payload]).select().single();
        if (error) throw error;
        return data;
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
    },

    // ---- STORAGE ----

    // Upload an image to the property-images bucket
    uploadPropertyImage: async (file, path) => {
        const { data, error } = await supabase.storage
            .from('property-images')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(path);

        return publicUrl;
    },

    // ---- MESSAGING ----

    // Send a message to a host
    sendMessage: async (payload) => {
        const { error } = await supabase.from('messages').insert([payload]);
        if (error) throw error;
    },

    // Fetch messages for a host
    getHostMessages: async (hostId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, properties(name)')
            .eq('host_id', hostId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
