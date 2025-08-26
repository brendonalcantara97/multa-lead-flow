-- Create RLS policy to allow anonymous users to check email authorization
-- This is needed for password reset and login flows where users are not yet authenticated
CREATE POLICY "Anonymous users can check email authorization" 
ON public.authorized_emails 
FOR SELECT 
TO anon
USING (is_active = true);