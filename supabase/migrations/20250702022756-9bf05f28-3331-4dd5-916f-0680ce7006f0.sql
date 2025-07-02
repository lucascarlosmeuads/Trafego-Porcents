
-- Primeiro, vamos verificar e ajustar a função is_admin_user para incluir emails específicos
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar se o email do usuário autenticado contém '@admin' OU é um admin específico
  RETURN COALESCE(auth.email(), '') LIKE '%@admin%' 
    OR COALESCE(auth.email(), '') = 'lucas@admin.com'
    OR COALESCE(auth.email(), '') = 'andreza@trafegoporcents.com';
END;
$function$

-- Ajustar as políticas RLS para meta_ads_configs para suportar configurações globais
DROP POLICY IF EXISTS "Admins can manage meta ads configs" ON public.meta_ads_configs;
DROP POLICY IF EXISTS "Users can create their own meta ads configs" ON public.meta_ads_configs;
DROP POLICY IF EXISTS "Users can view their own meta ads configs" ON public.meta_ads_configs;
DROP POLICY IF EXISTS "Users can update their own meta ads configs" ON public.meta_ads_configs;
DROP POLICY IF EXISTS "Users can delete their own meta ads configs" ON public.meta_ads_configs;

-- Criar novas políticas mais específicas
-- Política para admins gerenciarem tudo (incluindo configurações globais)
CREATE POLICY "Admins can manage all meta ads configs"
ON public.meta_ads_configs
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Política para gestores criarem suas próprias configurações
CREATE POLICY "Gestors can create their own configs"
ON public.meta_ads_configs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.email() = email_usuario 
  AND (
    is_gestor_user() 
    OR is_admin_user()
  )
);

-- Política para gestores verem suas próprias configurações
CREATE POLICY "Gestors can view their own configs"
ON public.meta_ads_configs
FOR SELECT
TO authenticated
USING (
  auth.email() = email_usuario 
  OR is_admin_user()
);

-- Política para gestores atualizarem suas próprias configurações
CREATE POLICY "Gestors can update their own configs"
ON public.meta_ads_configs
FOR UPDATE
TO authenticated
USING (
  auth.email() = email_usuario 
  OR is_admin_user()
)
WITH CHECK (
  auth.email() = email_usuario 
  OR is_admin_user()
);

-- Política para gestores deletarem suas próprias configurações
CREATE POLICY "Gestors can delete their own configs"
ON public.meta_ads_configs
FOR DELETE
TO authenticated
USING (
  auth.email() = email_usuario 
  OR is_admin_user()
);
