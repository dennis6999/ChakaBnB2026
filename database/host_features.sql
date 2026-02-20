-- Supabase Schema Update for Host Features

-- 1. Add host_id to properties table
ALTER TABLE properties ADD COLUMN host_id UUID REFERENCES auth.users(id);

-- 2. Update RLS policies for properties to allow insertion by hosts
CREATE POLICY "Users can insert their own properties." 
ON properties FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Note: We already have a policy: "Public profiles are viewable by everyone." 
-- ON properties FOR SELECT USING (true);
-- So reading is still public.

-- 3. (Optional but recommended) Policy allowing hosts to update their own properties
CREATE POLICY "Users can update their own properties." 
ON properties FOR UPDATE USING (auth.uid() = host_id);

-- 4. (Optional but recommended) Policy allowing hosts to delete their own properties
CREATE POLICY "Users can delete their own properties." 
ON properties FOR DELETE USING (auth.uid() = host_id);


-- ==========================================
-- STORAGE POLICIES (Requires 'property-images' bucket to exist)
-- ==========================================

-- Allow public read access to the property-images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-images' );

-- Allow authenticated users to upload images to the bucket
CREATE POLICY "Authenticted users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-images' );
