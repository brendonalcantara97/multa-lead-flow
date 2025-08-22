-- Drop and recreate the leads_with_sources view to ensure it respects RLS
DROP VIEW IF EXISTS leads_with_sources;

-- Recreate the view without SECURITY DEFINER to ensure it inherits RLS from underlying tables
CREATE VIEW leads_with_sources AS
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
  COALESCE(array_length(l.documents, 1), 0) as document_count,
  p.first_name || ' ' || p.last_name as assigned_to_name
FROM leads l
LEFT JOIN lead_sources ls ON l.lead_source_id = ls.id
LEFT JOIN profiles p ON l.assigned_to = p.id;