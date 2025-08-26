-- Criar policy para permitir consulta de emails autorizados durante reset de senha
DROP POLICY IF EXISTS "Allow public email verification" ON public.authorized_emails;

CREATE POLICY "Allow public email verification" 
ON public.authorized_emails 
FOR SELECT 
TO public
USING (is_active = true);

-- Também precisamos permitir que usuários anônimos consultem para verificação durante login/reset
DROP POLICY IF EXISTS "Only admins can view authorized emails" ON public.authorized_emails;

CREATE POLICY "Allow email verification for auth" 
ON public.authorized_emails 
FOR SELECT 
TO authenticated, anon
USING (is_active = true);