-- Fix the security definer issue by dropping and recreating the view without SECURITY DEFINER
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
  COALESCE(p.first_name || ' ' || p.last_name, 'Não atribuído') as assigned_to_name
FROM public.leads l
LEFT JOIN public.lead_sources ls ON l.lead_source_id = ls.id
LEFT JOIN public.profiles p ON l.assigned_to = p.id;