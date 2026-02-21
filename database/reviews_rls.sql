-- Run this in Supabase SQL Editor to allow logged-in users to submit reviews
-- and to allow hosts to update their own property rating/review count

-- Allow any authenticated user to insert a review
CREATE POLICY "Users can insert reviews."
ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow hosts to update rating/reviews count on their own properties (needed for recalculation)
-- (Add this only if it doesn't already exist)
CREATE POLICY "Users can update their own properties."
ON properties FOR UPDATE USING (auth.uid() = host_id);
