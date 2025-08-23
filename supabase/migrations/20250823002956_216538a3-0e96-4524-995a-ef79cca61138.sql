-- Atualizar/inserir usuário admin na tabela authorized_emails
INSERT INTO public.authorized_emails (
  email, 
  first_name, 
  last_name, 
  role, 
  is_active, 
  has_account
) VALUES (
  'brendonalcantara97@gmail.com',
  'Brendon',
  'Alcântara', 
  'admin',
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  has_account = EXCLUDED.has_account,
  updated_at = now();