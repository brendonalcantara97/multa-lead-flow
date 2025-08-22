-- Criar tabela para emails autorizados
CREATE TABLE public.authorized_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  invited_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS na tabela
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para authorized_emails
CREATE POLICY "Only authenticated users can view authorized emails" 
ON public.authorized_emails 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can manage authorized emails" 
ON public.authorized_emails 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Adicionar trigger para updated_at
CREATE TRIGGER update_authorized_emails_updated_at
BEFORE UPDATE ON public.authorized_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns emails iniciais para teste (substitua pelos emails reais da sua empresa)
INSERT INTO public.authorized_emails (email, first_name, last_name, role) VALUES 
('admin@sosmultas.com.br', 'Admin', 'SOS Multas', 'admin'),
('gerente@sosmultas.com.br', 'Gerente', 'Comercial', 'manager'),
('atendimento@sosmultas.com.br', 'Atendimento', 'SOS Multas', 'user');