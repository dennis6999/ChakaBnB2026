-- Add an is_active boolean column directly to the properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records to guarantee they are active right now
UPDATE properties SET is_active = true WHERE is_active IS NULL;
