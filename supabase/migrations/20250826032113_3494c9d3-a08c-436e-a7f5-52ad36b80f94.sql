-- CRITICAL SECURITY FIX: Add RLS policies to leads_with_sources view
-- Enable RLS on the view
ALTER VIEW public.leads_with_sources SET (security_invoker = true);

-- Drop the problematic public access policies on authorized_emails
DROP POLICY IF EXISTS "Allow public email verification" ON public.authorized_emails;
DROP POLICY IF EXISTS "Allow email verification for auth" ON public.authorized_emails;

-- Create restricted policy for authorized_emails - only allow authenticated users to check their own email
CREATE POLICY "Users can check their own email authorization" 
ON public.authorized_emails 
FOR SELECT 
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND is_active = true);

-- Create policy for auth functions to check email during signup
CREATE POLICY "Auth service can verify emails during signup" 
ON public.authorized_emails 
FOR SELECT 
TO service_role
USING (is_active = true);