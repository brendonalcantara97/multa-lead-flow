-- Adicionar email de teste à tabela authorized_emails
INSERT INTO public.authorized_emails (email, first_name, last_name, role, is_active)
VALUES ('brendonalcantara97@gmail.com', 'Brendon', 'Alcântara', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  role = 'admin';