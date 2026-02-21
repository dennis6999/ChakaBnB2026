-- Supabase Schema for ChakaBnB

-- 1. Create Tables
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC NOT NULL,
    rating NUMERIC NOT NULL,
    reviews INTEGER NOT NULL,
    distance TEXT,
    description TEXT,
    room_info TEXT,
    guests INTEGER,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    features TEXT[],
    total_rooms INTEGER,
    cancellation_policy TEXT,
    meal_plan TEXT,
    payment_preference TEXT,
    host_name TEXT,
    host_joined TEXT,
    image TEXT,
    gallery TEXT[],
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating NUMERIC NOT NULL,
    date TEXT NOT NULL,
    comment TEXT NOT NULL
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    rooms INTEGER NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Row Level Security (RLS) Policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Properties & Reviews are public read-only
CREATE POLICY "Public profiles are viewable by everyone." 
ON properties FOR SELECT USING (true);

CREATE POLICY "Public reviews are viewable by everyone." 
ON reviews FOR SELECT USING (true);

-- Bookings can only be seen and created by the authenticated user
CREATE POLICY "Users can insert their own bookings." 
ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings." 
ON bookings FOR SELECT USING (auth.uid() = user_id);


-- 3. Seed Initial Mock Data
INSERT INTO properties (
    id, name, type, price, rating, reviews, distance, description, room_info, 
    guests, bedrooms, bathrooms, features, total_rooms, cancellation_policy, 
    meal_plan, payment_preference, host_name, host_joined, image, gallery, latitude, longitude
) VALUES 
(
    1, 'Chaka Ranch Tented Camp', 'Camp', 10500, 9.2, 128, '2.5 km from center', 
    'Experience luxury in the wild. Set between Mt Kenya and the Aberdares, featuring an outdoor entertainment park, quad bikes, and spacious tents.', 
    'Superior Luxury Tent', 4, 2, 1, 
    ARRAY['Free breakfast', 'Free WiFi', 'Free parking', 'Restaurant', 'Water park access', 'Air conditioning'], 
    10, 'Free cancellation', 'Breakfast included', 'No prepayment needed - pay at the property', 
    'David', '2018', 
    'https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'],
    -0.612, 36.98
),
(
    2, 'Muthiga Garden Resort Chaka', 'Resort', 5000, 9.0, 45, '0.8 km from center',
    'Tranquil stay surrounded by beautiful mountain views. Offers comfortable rooms, home-cooked breakfast, and live music on weekends.',
    'Standard Double Room', 2, 1, 1,
    ARRAY['Free breakfast', 'Free parking', 'Restaurant', 'Garden view', 'Room service'], 
    15, 'Non-refundable', 'Breakfast included', 'Pay at the property', 
    'Sarah & John', '2020', 
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'],
    -0.618, 37.01
),
(
    3, 'Lusoi Ranch Resort', 'Resort', 7500, 8.5, 32, '4.2 km from center',
    'A hidden gem along the Chaka-Nanyuki road. Perfect for a quiet countryside getaway with stunning farm views and fresh local cuisine.',
    'Family Bungalow', 6, 3, 2,
    ARRAY['Free parking', 'Restaurant', 'Kitchen', 'BBQ facilities', 'Pet friendly'], 
    4, 'Free cancellation', 'Room only', 'No prepayment needed', 
    'Grace', '2019', 
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
    -0.625, 36.95
),
(
    4, 'Chaka Place Apartments', 'Apartment', 3500, 8.4, 29, '0.5 km from center',
    'Modern, secure apartments right in the heart of Chaka town. Ideal for business travelers and long-term stays with stable internet.',
    'One-Bedroom Apartment', 2, 1, 1,
    ARRAY['Free WiFi', 'Free parking', 'Kitchen', 'Washing machine', 'City view'], 
    8, 'Free cancellation', 'Room only', 'Prepayment needed', 
    'Peter', '2021', 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1de2d92004?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'],
    -0.615, 37.00
),
(
    5, 'Le Pristine Wellness Hotel', 'Hotel', 6000, 8.1, 37, '3.0 km from center',
    'Dedicated to healing and wellness, featuring spa treatments, an indoor pool, and serene gardens near Kiganjo.',
    'Deluxe Suite', 2, 1, 1.5,
    ARRAY['Free WiFi', 'Free breakfast', 'Spa', 'Restaurant', 'Pool', 'Gym'], 
    20, 'Non-refundable', 'Breakfast included', 'Prepayment needed', 
    'Le Pristine Mgmt', '2015', 
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'],
    -0.585, 36.99
),
(
    6, 'The Peak Meadows Hotel', 'Hotel', 4200, 7.7, 41, '1.2 km from center',
    'Comfortable and affordable lodging with excellent Kenyan food, timely transport services, and friendly staff.',
    'Standard Single Room', 1, 1, 1,
    ARRAY['Free WiFi', 'Free parking', 'Restaurant', '24/7 Front Desk'], 
    12, 'Free cancellation', 'Breakfast included', 'Pay at the property', 
    'Peak Meadows', '2017', 
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=800&q=80'],
    -0.610, 36.99
);

-- Reset properties id sequence
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));

INSERT INTO reviews (property_id, user_name, rating, date, comment) VALUES 
(1, 'Sarah Jenkins', 9.5, 'October 2025', 'Absolutely stunning experience! The tents are pure luxury and the quad biking was a highlight for the kids. Will definitely be returning next year.'),
(1, 'Michael O.', 9.0, 'September 2025', 'Great place for a family getaway. The food at the restaurant was exceptional. Only minor issue was the wifi in the furthest tents.'),
(1, 'Elena R.', 10.0, 'August 2025', 'Perfection! The views of Mt Kenya in the morning from our tent were breathtaking. The staff went above and beyond for our anniversary.'),
(2, 'David K.', 8.5, 'October 2025', 'Very peaceful garden setting. The live band on Saturday night was fantastic. Breakfast could have more variety but was tasty.'),
(2, 'Wanjiku M.', 9.5, 'September 2025', 'A beautiful hideaway just a stone''s throw from the main road. The trees and flowers make it feel like an oasis. Room was spotless.');
