-- Supabase Schema Update for Host Messaging

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their messages" 
ON messages FOR SELECT 
USING (auth.uid() = host_id);

CREATE POLICY "Anyone can insert messages" 
ON messages FOR INSERT 
WITH CHECK (true);

-- Allow guests to read their own property messages if needed (optional)
-- For now, we only need hosts to read them.
