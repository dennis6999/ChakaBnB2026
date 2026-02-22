-- Add policy to allow users to update their own bookings (required for cancelling)
CREATE POLICY "Users can update their own bookings." 
ON bookings FOR UPDATE USING (auth.uid() = user_id);
