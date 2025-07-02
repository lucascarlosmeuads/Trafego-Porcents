
-- Diagnóstico e correção das políticas RLS para eh_ultimo_pago

-- 1. Criar uma política específica para admins atualizarem eh_ultimo_pago
CREATE POLICY "Admins can update eh_ultimo_pago field"
ON public.todos_clientes
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 2. Criar uma política específica para gestores atualizarem eh_ultimo_pago de seus clientes
CREATE POLICY "Gestores can update eh_ultimo_pago for their clients"
ON public.todos_clientes
FOR UPDATE
TO authenticated
USING (
  email_gestor = auth.email() OR
  EXISTS (
    SELECT 1 FROM gestores 
    WHERE email = auth.email() AND ativo = true
  )
)
WITH CHECK (
  email_gestor = auth.email() OR
  EXISTS (
    SELECT 1 FROM gestores 
    WHERE email = auth.email() AND ativo = true
  )
);

-- 3. Garantir que a função is_admin_user funciona corretamente
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
$function$;

-- 4. Adicionar índice para melhorar performance das consultas de eh_ultimo_pago
CREATE INDEX IF NOT EXISTS idx_todos_clientes_eh_ultimo_pago 
ON todos_clientes(eh_ultimo_pago) 
WHERE eh_ultimo_pago = true;
