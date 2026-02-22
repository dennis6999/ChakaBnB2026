-- Supabase Schema Update for Real-Time In-App Messaging

-- 0. Drop the old messages table if it exists
-- The old schema used 'host_id' and 'guest_name', which conflicts with our new bi-directional chat
DROP TABLE IF EXISTS messages CASCADE;

-- 1. Create the new messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can read messages where they are the sender OR the receiver
CREATE POLICY "Users can read their own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages where they are the sender
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages (e.g., mark as read) where they are the receiver
CREATE POLICY "Users can update their received messages" ON messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- 4. Enable Realtime for the messages table
-- This allows our React app to listen to new messages instantly
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
