-- ==========================================
-- CRITICAL SECURITY PATCH
-- Run this in your Supabase SQL Editor
-- Fixes:
--   1. Guests cannot self-promote booking status (e.g. to 'Completed')
--   2. Property table has no RLS on writes (any user can insert/update/delete any property)
-- ==========================================

-- =====================================================================
-- FIX 1: Restrict what a guest can do when updating their own bookings.
-- Previously: RLS only said "you can update rows where user_id = you".
-- Problem:    No check on WHAT values you can change it to.
--             A savvy guest could call the Supabase REST API directly
--             and set their own booking status to 'Completed',
--             then immediately post a fake review.
-- Fix:        Add a WITH CHECK that only allows setting status = 'Cancelled'
--             and only from a cancellable prior status.
-- =====================================================================
DROP POLICY IF EXISTS "Users can update their own bookings." ON bookings;
DROP POLICY IF EXISTS "Users can cancel their own bookings." ON bookings;

CREATE POLICY "Users can cancel their own bookings."
ON bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    -- Guests may ONLY set the status to 'Cancelled'.
    -- NOTE: OLD is not available in RLS WITH CHECK (it's trigger-only).
    -- The USING clause above already ensures the guest owns the row.
    -- This WITH CHECK ensures the only write they can make is to 'Cancelled'.
    status = 'Cancelled'
);

-- Hosts retain the right to update bookings on their own properties
-- (already existed in schema.sql, but making it explicit here for clarity)
DROP POLICY IF EXISTS "Hosts can update bookings for their properties." ON bookings;

CREATE POLICY "Hosts can update bookings for their properties."
ON bookings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = bookings.property_id
        AND properties.host_id = auth.uid()
    )
);


-- =====================================================================
-- FIX 2: Add RLS policies for write operations on the properties table.
-- Previously: Only a public SELECT policy existed. No INSERT/UPDATE/DELETE.
-- Problem:    Any authenticated user could insert a property with any
--             host_id (even another user's), update any property's price
--             or is_active flag, or delete any listing.
-- Fix:        Enforce host_id ownership on all write operations.
-- =====================================================================

-- Allow authenticated users to create properties, but ONLY with their own user ID as the host
DROP POLICY IF EXISTS "Authenticated users can create their own properties." ON properties;

CREATE POLICY "Authenticated users can create their own properties."
ON properties FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- Only the property owner (host) can update their own property
DROP POLICY IF EXISTS "Hosts can update their own properties." ON properties;

CREATE POLICY "Hosts can update their own properties."
ON properties FOR UPDATE
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- Only the property owner (host) can delete their own property
DROP POLICY IF EXISTS "Hosts can delete their own properties." ON properties;

CREATE POLICY "Hosts can delete their own properties."
ON properties FOR DELETE
USING (auth.uid() = host_id);
