-- Add policy to allow users to delete their own bookings (required for unblocking dates completely)
CREATE POLICY "Users can delete their own bookings." 
ON bookings FOR DELETE USING (auth.uid() = user_id);
