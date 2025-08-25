-- CRITICAL SECURITY FIXES
-- Fix 1: Create security definer function to check admin roles without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.authorized_emails 
    WHERE email = (
      SELECT email 
      FROM auth.users 
      WHERE id = user_id
    )
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Fix 2: Secure authorized_emails table - restrict to admins only
DROP POLICY IF EXISTS "Only authenticated users can manage authorized emails" ON public.authorized_emails;
DROP POLICY IF EXISTS "Only authenticated users can view authorized emails" ON public.authorized_emails;

CREATE POLICY "Only admins can view authorized emails"
ON public.authorized_emails
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only admins can manage authorized emails"
ON public.authorized_emails
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Fix 3: Add RLS to leads_with_sources view
-- Note: We need to enable RLS on the view if possible, or ensure underlying tables are secure
-- Since leads_with_sources is a view, we need to ensure the underlying query respects RLS
-- Let's create RLS policies for lead_sources table first

-- Fix 4: Secure lead_sources table - users can only see sources related to their leads
DROP POLICY IF EXISTS "Users can view all lead sources" ON public.lead_sources;
DROP POLICY IF EXISTS "Users can insert lead sources" ON public.lead_sources;

CREATE POLICY "Users can view lead sources for their leads"
ON public.lead_sources
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.leads 
    WHERE leads.lead_source_id = lead_sources.id 
    AND leads.user_id = auth.uid()
  )
  OR public.is_admin()
);

CREATE POLICY "Users can insert lead sources"
ON public.lead_sources
FOR INSERT
WITH CHECK (true);

-- Fix 5: Create function to get current user's authorized email record
CREATE OR REPLACE FUNCTION public.get_current_user_auth_info()
RETURNS public.authorized_emails
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * 
  FROM public.authorized_emails 
  WHERE email = (
    SELECT email 
    FROM auth.users 
    WHERE id = auth.uid()
  )
  AND is_active = true
  LIMIT 1;
$$;