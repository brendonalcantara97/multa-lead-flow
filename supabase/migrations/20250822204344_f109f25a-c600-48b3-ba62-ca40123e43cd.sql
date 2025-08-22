-- =====================================================
-- CRM SCHEMA COMPLETE MIGRATION WITH ENUMS
-- =====================================================

-- 1. CREATE ENUMS FIRST
-- =====================================================
CREATE TYPE public.violation_type AS ENUM (
  'excesso-velocidade',
  'excesso-pontos', 
  'bafometro',
  'suspensao-cnh',
  'cassacao-cnh',
  'outra'
);

CREATE TYPE public.lead_status AS ENUM (
  'novo-lead',
  'contato-realizado',
  'documentos-recebidos', 
  'contrato-assinado',
  'cliente',
  'nao-cliente'
);

CREATE TYPE public.urgency_level AS ENUM (
  'alta',
  'media',
  'baixa'
);

CREATE TYPE public.payment_method AS ENUM (
  'pix',
  'boleto',
  'cartao-credito',
  'cartao-debito',
  'transferencia',
  'dinheiro'
);

-- 2. CREATE PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. CREATE LEADS TABLE
-- =====================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  violation_type violation_type NOT NULL,
  status lead_status DEFAULT 'novo-lead' NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  observations TEXT,
  conversion_date TIMESTAMP WITH TIME ZONE,
  payment_method payment_method,
  rejection_reason TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  gbraid TEXT,
  fbp TEXT,
  fbclid TEXT,
  documents TEXT[],
  tags TEXT[],
  cnh_at_risk BOOLEAN DEFAULT false,
  appealed_before BOOLEAN DEFAULT false,
  urgency urgency_level DEFAULT 'media',
  last_moved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lead_origin TEXT DEFAULT 'website',
  assigned_to UUID REFERENCES public.profiles(id),
  is_duplicated BOOLEAN DEFAULT false,
  first_contact_at TIMESTAMP WITH TIME ZONE,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- 4. CREATE LEAD_SOURCES TABLE (normalized UTM data)
-- =====================================================
CREATE TABLE public.lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  gbraid TEXT,
  fbp TEXT,
  fbclid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Create unique constraint to avoid duplicates
  CONSTRAINT unique_source_combination UNIQUE (utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, gbraid, fbp, fbclid)
);

ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all lead sources" ON public.lead_sources
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert lead sources" ON public.lead_sources
  FOR INSERT TO authenticated WITH CHECK (true);

-- 5. CREATE LEAD_STATUS_HISTORY TABLE (audit trail)
-- =====================================================
CREATE TABLE public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  previous_status lead_status,
  new_status lead_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lead status history" ON public.lead_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lead status history" ON public.lead_status_history
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_id AND leads.user_id = auth.uid()
    )
  );

-- 6. CREATE LEAD_DOCUMENTS TABLE (individual document storage)
-- =====================================================  
CREATE TABLE public.lead_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT, -- 'CNH', 'RG', 'CPF', 'Comprovante', etc.
  document_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.lead_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their lead documents" ON public.lead_documents
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_id AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their lead documents" ON public.lead_documents
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_id AND leads.user_id = auth.uid()
    )
  );

-- 7. ADD LEAD SOURCE REFERENCE TO LEADS
-- =====================================================
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS lead_source_id UUID REFERENCES public.lead_sources(id);

-- 8. CREATE PERFORMANCE INDEXES
-- =====================================================
-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_lead_source_id ON public.leads(lead_source_id);
CREATE INDEX IF NOT EXISTS idx_leads_last_interaction ON public.leads(last_interaction_at);
CREATE INDEX IF NOT EXISTS idx_leads_duplicated ON public.leads(is_duplicated) WHERE is_duplicated = true;

-- Lead sources indexes
CREATE INDEX IF NOT EXISTS idx_lead_sources_utm_campaign ON public.lead_sources(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_lead_sources_utm_source ON public.lead_sources(utm_source);
CREATE INDEX IF NOT EXISTS idx_lead_sources_gclid ON public.lead_sources(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_sources_gbraid ON public.lead_sources(gbraid) WHERE gbraid IS NOT NULL;

-- Lead status history indexes
CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON public.lead_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_created_at ON public.lead_status_history(created_at);

-- Lead documents indexes
CREATE INDEX IF NOT EXISTS idx_lead_documents_lead_id ON public.lead_documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_documents_type ON public.lead_documents(document_type);

-- 9. CREATE FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE public.lead_status_history 
  ADD CONSTRAINT fk_lead_status_history_lead_id 
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.lead_documents 
  ADD CONSTRAINT fk_lead_documents_lead_id 
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

-- 10. CREATE FUNCTIONS
-- =====================================================
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION public.log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
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
  
  -- Update last_interaction_at
  NEW.last_interaction_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create lead source
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
  -- Try to find existing source
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
  
  -- If not found, create new one
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE TRIGGERS
-- =====================================================
-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for leads updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for lead status changes
CREATE TRIGGER trigger_log_lead_status_change
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_status_change();

-- Trigger for lead_sources updated_at
CREATE TRIGGER update_lead_sources_updated_at
  BEFORE UPDATE ON public.lead_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 12. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================
-- View for leads with source information
CREATE OR REPLACE VIEW public.leads_with_sources AS
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

-- Grant access to the view
GRANT SELECT ON public.leads_with_sources TO authenticated;