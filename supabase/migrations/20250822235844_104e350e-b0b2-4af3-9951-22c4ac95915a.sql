-- Insert admin user into authorized_emails table
INSERT INTO public.authorized_emails (email, first_name, last_name, role, is_active) 
VALUES ('brendonalcantara97@gmail.com', 'Brendon', 'Alcantara', 'admin', true)
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  is_active = true,
  first_name = COALESCE(EXCLUDED.first_name, authorized_emails.first_name),
  last_name = COALESCE(EXCLUDED.last_name, authorized_emails.last_name);