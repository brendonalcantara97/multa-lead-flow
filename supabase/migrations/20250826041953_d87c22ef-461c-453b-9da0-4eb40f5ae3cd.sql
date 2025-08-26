-- Add RLS policy for authenticated users to check their own authorization
CREATE POLICY "Authenticated users can check their own email authorization" 
ON public.authorized_emails 
FOR SELECT 
TO authenticated
USING (
  email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
  AND is_active = true
);