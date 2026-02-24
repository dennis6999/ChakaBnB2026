-- ==========================================
-- Advanced Security & Architecture Fixes
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create a function to securely prepare and validate bookings BEFORE inserting
CREATE OR REPLACE FUNCTION check_and_prepare_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_property_price NUMERIC;
    v_host_id UUID;
    v_is_active BOOLEAN;
    v_total_rooms INTEGER;
    v_booked_rooms INTEGER;
    v_nights INTEGER;
BEGIN
    -- Step 1. Fetch official property details from the DB securely
    SELECT price, host_id, is_active, total_rooms 
    INTO v_property_price, v_host_id, v_is_active, v_total_rooms
    FROM properties 
    WHERE id = NEW.property_id;

    -- Ensure property actually exists
    IF v_host_id IS NULL THEN
        RAISE EXCEPTION 'Property does not exist.';
    END IF;

    -- Ensure the property is active and visible
    IF v_is_active = false THEN
        RAISE EXCEPTION 'Cannot book an inactive or hidden property.';
    END IF;

    -- Ensure the user is not attempting to book their own property (unless it is a HostBlock)
    IF NEW.user_id = v_host_id AND NEW.status != 'HostBlock' THEN
        RAISE EXCEPTION 'Hosts cannot book their own properties.';
    END IF;

    -- Step 2. Calculate Nights and enforce valid date logic
    v_nights := NEW.check_out - NEW.check_in;
    IF v_nights < 1 THEN
        RAISE EXCEPTION 'Check-out date must be at least 1 day after check-in date.';
    END IF;

    -- Step 3. OVERRIDE Client-Side Price (Prevent Price Manipulation)
    -- We completely ignore whatever total_price the client frontend sent in the API request.
    -- We calculate it server-side using the official v_property_price.
    IF NEW.status = 'HostBlock' THEN
        NEW.total_price := 0;
    ELSE
        -- total = property_price * nights * rooms requested
        NEW.total_price := v_property_price * v_nights * NEW.rooms;
    END IF;

    -- Step 4. Prevent Double-Booking & Enforce Capacity Rules (Race Condition Fix)
    -- Find exactly how many rooms are already locked in for any overlapping dates.
    SELECT COALESCE(SUM(rooms), 0) INTO v_booked_rooms
    FROM bookings
    WHERE property_id = NEW.property_id
      AND status IN ('Confirmed', 'Pending', 'HostBlock')
      AND (
          (NEW.check_in >= check_in AND NEW.check_in < check_out) OR
          (NEW.check_out > check_in AND NEW.check_out <= check_out) OR
          (NEW.check_in <= check_in AND NEW.check_out >= check_out)
      );

    -- Check if requesting more rooms than the property has available for those dates
    IF (v_booked_rooms + NEW.rooms) > COALESCE(v_total_rooms, 1) THEN
        RAISE EXCEPTION 'Not enough rooms available for these dates. Requested: %, Available: %.', 
                        NEW.rooms, (COALESCE(v_total_rooms, 1) - v_booked_rooms);
    END IF;

    -- All checks passed, proceed with the insert/update using our securely overriden NEW values.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the function to a Database Trigger on the bookings table
DROP TRIGGER IF EXISTS trg_secure_booking_insert ON bookings;
CREATE TRIGGER trg_secure_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_and_prepare_booking();

-- Also protect against UPDATE manipulation (e.g., someone updating their pending booking to 1 room but keeping 5 rooms price, etc)
DROP TRIGGER IF EXISTS trg_secure_booking_update ON bookings;
CREATE TRIGGER trg_secure_booking_update
BEFORE UPDATE ON bookings
FOR EACH ROW
WHEN (NEW.check_in IS DISTINCT FROM OLD.check_in OR 
      NEW.check_out IS DISTINCT FROM OLD.check_out OR 
      NEW.rooms IS DISTINCT FROM OLD.rooms OR
      NEW.total_price IS DISTINCT FROM OLD.total_price)
EXECUTE FUNCTION check_and_prepare_booking();
