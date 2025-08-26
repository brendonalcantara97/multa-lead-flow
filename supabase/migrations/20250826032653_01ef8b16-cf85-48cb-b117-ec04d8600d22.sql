-- SECURITY FIX: Proper implementation without SECURITY DEFINER
-- Drop the function and recreate the view with proper security

DROP VIEW IF EXISTS public.leads_with_sources;
DROP FUNCTION IF EXISTS public.get_leads_with_sources();

-- Create a simple view that will inherit RLS from the underlying leads table
-- The key is to ensure the view only shows data the authenticated user can see
CREATE VIEW public.leads_with_sources AS
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
  COALESCE(p.first_name || ' ' || p.last_name, '') AS assigned_to_name
FROM public.leads l
LEFT JOIN public.lead_sources ls ON l.lead_source_id = ls.id
LEFT JOIN public.profiles p ON l.assigned_to = p.id;

-- Enable RLS on the view and create policies
ALTER VIEW public.leads_with_sources SET (security_invoker = true);

-- Grant proper permissions
GRANT SELECT ON public.leads_with_sources TO authenticated;
GRANT SELECT ON public.leads_with_sources TO anon;