-- =====================================================
-- SECURITY FIXES FOR CRM SCHEMA
-- =====================================================

-- 1. Fix Function Search Path Issues
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_status_history (
      lead_id, 
      previous_status, 
      new_status, 
      changed_by,
      change_reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'cliente' THEN 'Conversão realizada'
        WHEN NEW.status = 'nao-cliente' THEN 'Lead descartado'
        ELSE 'Status atualizado'
      END
    );
  END IF;
  
  NEW.last_interaction_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_or_create_lead_source(
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_gclid TEXT DEFAULT NULL,
  p_gbraid TEXT DEFAULT NULL,
  p_fbp TEXT DEFAULT NULL,
  p_fbclid TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  source_id UUID;
BEGIN
  SELECT id INTO source_id
  FROM public.lead_sources
  WHERE 
    COALESCE(utm_source, '') = COALESCE(p_utm_source, '') AND
    COALESCE(utm_medium, '') = COALESCE(p_utm_medium, '') AND
    COALESCE(utm_campaign, '') = COALESCE(p_utm_campaign, '') AND
    COALESCE(utm_term, '') = COALESCE(p_utm_term, '') AND
    COALESCE(utm_content, '') = COALESCE(p_utm_content, '') AND
    COALESCE(gclid, '') = COALESCE(p_gclid, '') AND
    COALESCE(gbraid, '') = COALESCE(p_gbraid, '') AND
    COALESCE(fbp, '') = COALESCE(p_fbp, '') AND
    COALESCE(fbclid, '') = COALESCE(p_fbclid, '');
  
  IF source_id IS NULL THEN
    INSERT INTO public.lead_sources (
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      gclid, gbraid, fbp, fbclid
    ) VALUES (
      p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content,
      p_gclid, p_gbraid, p_fbp, p_fbclid
    ) RETURNING id INTO source_id;
  END IF;
  
  RETURN source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Recreate View Without Security Definer
-- =====================================================
DROP VIEW IF EXISTS public.leads_with_sources;

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
  p.first_name as assigned_to_name,
  (SELECT COUNT(*) FROM public.lead_documents ld WHERE ld.lead_id = l.id) as document_count
FROM public.leads l
LEFT JOIN public.lead_sources ls ON l.lead_source_id = ls.id
LEFT JOIN public.profiles p ON l.assigned_to = p.id;

GRANT SELECT ON public.leads_with_sources TO authenticated;