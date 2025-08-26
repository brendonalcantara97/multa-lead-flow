-- SECURITY FIX: Enable Row Level Security on leads_with_sources view
-- Since views don't automatically inherit RLS, we need to enable it explicitly

-- Enable RLS on the view
ALTER VIEW public.leads_with_sources SET (security_invoker = on);

-- Alternative approach: Create RLS policies directly on the view
-- First, we need to convert the view to a table-like structure for RLS
-- Drop the existing view
DROP VIEW IF EXISTS public.leads_with_sources;

-- Create a security definer function that respects RLS
CREATE OR REPLACE FUNCTION public.get_leads_with_sources()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  violation_type violation_type,
  status lead_status,
  amount numeric,
  observations text,
  conversion_date timestamp with time zone,
  payment_method payment_method,
  rejection_reason text,
  documents text[],
  tags text[],
  cnh_at_risk boolean,
  appealed_before boolean,
  urgency urgency_level,
  last_moved_at timestamp with time zone,
  lead_source_id uuid,
  lead_origin text,
  assigned_to uuid,
  is_duplicated boolean,
  first_contact_at timestamp with time zone,
  last_interaction_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_agent text,
  ip_address inet,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  gbraid text,
  fbp text,
  fbclid text,
  assigned_to_name text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT 
    l.id,
    l.user_id,
    l.name,
    l.email,
    l.phone,
    l.violation_type,
    l.status,
    l.amount,
    l.observations,
    l.conversion_date,
    l.payment_method,
    l.rejection_reason,
    l.documents,
    l.tags,
    l.cnh_at_risk,
    l.appealed_before,
    l.urgency,
    l.last_moved_at,
    l.lead_source_id,
    l.lead_origin,
    l.assigned_to,
    l.is_duplicated,
    l.first_contact_at,
    l.last_interaction_at,
    l.created_at,
    l.updated_at,
    l.user_agent,
    l.ip_address,
    ls.utm_source,
    ls.utm_medium,
    ls.utm_campaign,
    ls.utm_term,
    ls.utm_content,
    ls.gclid,
    ls.gbraid,
    ls.fbp,
    ls.fbclid,
    p.first_name || ' ' || p.last_name AS assigned_to_name
  FROM public.leads l
  LEFT JOIN public.lead_sources ls ON l.lead_source_id = ls.id
  LEFT JOIN public.profiles p ON l.assigned_to = p.id
  WHERE l.user_id = auth.uid(); -- This enforces the security constraint
$$;

-- Recreate the view to use the secure function
CREATE VIEW public.leads_with_sources AS
SELECT * FROM public.get_leads_with_sources();