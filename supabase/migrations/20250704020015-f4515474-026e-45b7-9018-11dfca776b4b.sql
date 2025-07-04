
-- FASE 2: Correção das políticas RLS para permitir acesso do cliente às configurações Meta Ads

-- Remover políticas existentes que estão bloqueando o acesso
DROP POLICY IF EXISTS "Gestors can view their own configs" ON public.meta_ads_configs;
DROP POLICY IF EXISTS "Users can view their own meta ads configs" ON public.meta_ads_configs;

-- Adicionar política para permitir que clientes vejam configurações vinculadas ao seu ID
CREATE POLICY "Clientes podem ver suas próprias configurações Meta Ads"
ON public.meta_ads_configs
FOR SELECT
TO authenticated
USING (
  -- Cliente pode ver configuração específica para ele
  cliente_id IN (
    SELECT id FROM todos_clientes 
    WHERE email_cliente = auth.email()
  )
  OR
  -- Cliente pode ver configuração global do seu gestor
  (
    cliente_id IS NULL 
    AND email_usuario IN (
      SELECT email_gestor FROM todos_clientes 
      WHERE email_cliente = auth.email()
    )
  )
);

-- Recriar política para gestores verem suas próprias configurações
CREATE POLICY "Gestores podem ver suas próprias configurações"
ON public.meta_ads_configs
FOR SELECT
TO authenticated
USING (
  auth.email() = email_usuario 
  OR is_admin_user()
);

-- Adicionar política para gestores poderem criar configurações específicas para clientes
CREATE POLICY "Gestores podem criar configurações específicas para seus clientes"
ON public.meta_ads_configs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Gestor pode criar config global (cliente_id = NULL)
  (
    cliente_id IS NULL 
    AND auth.email() = email_usuario 
    AND is_gestor_user()
  )
  OR
  -- Gestor pode criar config específica para seus clientes
  (
    cliente_id IS NOT NULL
    AND cliente_id IN (
      SELECT id FROM todos_clientes 
      WHERE email_gestor = auth.email()
    )
    AND is_gestor_user()
  )
  OR
  -- Admins podem criar qualquer configuração
  is_admin_user()
);

-- Adicionar política para gestores atualizarem configurações específicas dos clientes
CREATE POLICY "Gestores podem atualizar configurações de seus clientes"
ON public.meta_ads_configs
FOR UPDATE
TO authenticated
USING (
  -- Gestor pode atualizar sua config global
  (
    cliente_id IS NULL 
    AND auth.email() = email_usuario 
    AND is_gestor_user()
  )
  OR
  -- Gestor pode atualizar config específica de seus clientes
  (
    cliente_id IS NOT NULL
    AND cliente_id IN (
      SELECT id FROM todos_clientes 
      WHERE email_gestor = auth.email()
    )
    AND is_gestor_user()
  )
  OR
  -- Admins podem atualizar qualquer configuração
  is_admin_user()
)
WITH CHECK (
  -- Mesmas regras para o check
  (
    cliente_id IS NULL 
    AND auth.email() = email_usuario 
    AND is_gestor_user()
  )
  OR
  (
    cliente_id IS NOT NULL
    AND cliente_id IN (
      SELECT id FROM todos_clientes 
      WHERE email_gestor = auth.email()
    )
    AND is_gestor_user()
  )
  OR
  is_admin_user()
);

-- Criar índice para melhorar performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_meta_ads_configs_cliente_gestor 
ON meta_ads_configs (cliente_id, email_usuario);

-- Comentário explicativo sobre as políticas
COMMENT ON POLICY "Clientes podem ver suas próprias configurações Meta Ads" ON public.meta_ads_configs IS 
'Permite que clientes vejam configurações Meta Ads específicas para eles ou configurações globais do seu gestor';
