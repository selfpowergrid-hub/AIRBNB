-- Add amenities column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS allows admin updates (assuming you have an auth system or just for local dev)
-- If using RLS, make sure to add a policy for service_role or admin user.
-- ALTER POLICY "Enable update for admins" ON rooms FOR UPDATE USING (true);
