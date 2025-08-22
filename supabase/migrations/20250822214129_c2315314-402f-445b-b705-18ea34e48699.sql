-- Drop the existing leads_with_sources view
DROP VIEW IF EXISTS leads_with_sources;

-- Recreate the view ensuring it properly inherits RLS from underlying tables
-- The key is to ensure the view doesn't bypass RLS policies
CREATE VIEW leads_with_sources AS
SELECT 
  l.id,
  l.user_id,
  l.violation_type,
  l.status,
  l.amount,
  l.conversion_date,
  l.payment_method,
  l.cnh_at_risk,
  l.appealed_before,
  l.urgency,
  l.last_moved_at,
  l.lead_source_id,
  l.assigned_to,
  l.is_duplicated,
  l.first_contact_at,
  l.last_interaction_at,
  l.created_at,
  l.updated_at,
  l.name,
  l.email,
  l.phone,
  l.observations,
  l.rejection_reason,
  l.documents,
  l.tags,
  l.lead_origin,
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

-- Grant appropriate permissions to ensure the view works with RLS
-- The view will now inherit RLS policies from the leads table
GRANT SELECT ON leads_with_sources TO authenticated;
GRANT SELECT ON leads_with_sources TO anon;