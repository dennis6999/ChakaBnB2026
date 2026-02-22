-- ==========================================
-- Security Fixes for ChakaBnB
-- ==========================================

-- 1. REVIEWS: Only users who have completed a stay can review a property.
-- Drop any existing INSERT policy for reviews if you had one (none existed in base schema, but just in case)
DROP POLICY IF EXISTS "Users can insert their own reviews if they stayed." ON reviews;

CREATE POLICY "Users can insert their own reviews if they stayed."
ON reviews FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE bookings.property_id = reviews.property_id
        AND bookings.user_id = auth.uid()
        AND bookings.status = 'Completed'
    )
    AND 
    NOT EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = reviews.property_id
        AND properties.host_id = auth.uid()
    )
);

-- 2. BOOKINGS: Prevent hosts from booking their own properties.
DROP POLICY IF EXISTS "Users can insert their own bookings." ON bookings;

CREATE POLICY "Users can insert their own bookings." 
ON bookings FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND
    NOT EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = bookings.property_id
        AND properties.host_id = auth.uid()
    )
);

-- 3. MESSAGES (If applicable via RLS): Prevent users from messaging themselves.
-- Note: Assuming you have RLS on messages. If not, this is good practice to add.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own messages
DROP POLICY IF EXISTS "Users can read their own messages." ON messages;
CREATE POLICY "Users can read their own messages." 
ON messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Allow users to send messages, but not to themselves
DROP POLICY IF EXISTS "Users can insert messages." ON messages;
CREATE POLICY "Users can insert messages." 
ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND sender_id != receiver_id
);
