-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.leads_with_sources;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW public.leads_with_sources AS
SELECT 
  l.*,
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
LEFT JOIN public.profiles p ON l.assigned_to = p.id;

-- Enable RLS on the view
ALTER VIEW public.leads_with_sources SET (security_barrier = true);

-- Add RLS policy for the view
CREATE POLICY "Users can view their own leads with sources" 
ON public.leads_with_sources 
FOR SELECT 
USING (auth.uid() = user_id);