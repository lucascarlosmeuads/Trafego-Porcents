-- CRITICAL SECURITY FIXES
-- Phase 1: Enable RLS on missing tables and add proper policies

-- Enable RLS on backup_comissoes_antigas table
ALTER TABLE public.backup_comissoes_antigas ENABLE ROW LEVEL SECURITY;

-- Add admin-only policy for backup_comissoes_antigas
CREATE POLICY "Admin access only for backup comissoes"
ON public.backup_comissoes_antigas
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Enable RLS on historico_pagamentos_comissao table
ALTER TABLE public.historico_pagamentos_comissao ENABLE ROW LEVEL SECURITY;

-- Add admin and gestor policies for historico_pagamentos_comissao
CREATE POLICY "Admin can manage payment history"
ON public.historico_pagamentos_comissao
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Gestores can view payment history for their clients"
ON public.historico_pagamentos_comissao
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM todos_clientes tc
    WHERE tc.id = cliente_id 
    AND tc.email_gestor = auth.email()
    AND is_gestor_user()
  )
);

-- Phase 2: Fix function search_path security issues
-- Update all functions to include SET search_path = ''

CREATE OR REPLACE FUNCTION public.update_formularios_parceria_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_new_briefing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Só processar se o briefing foi marcado como completo
  IF NEW.formulario_completo = true AND (OLD.formulario_completo IS NULL OR OLD.formulario_completo = false) THEN
    -- Usar pg_notify para sinalizar que um novo briefing precisa ser processado
    PERFORM pg_notify('new_briefing_channel', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_pdf_analysis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_creative_generations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Verificar se o email do usuário autenticado contém '@admin' OU é um admin específico
  RETURN COALESCE(auth.email(), '') LIKE '%@admin%' 
    OR COALESCE(auth.email(), '') = 'lucas@admin.com'
    OR COALESCE(auth.email(), '') = 'andreza@trafegoporcents.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sugestoes_melhorias_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_max_config_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comissao_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Quando um pagamento é adicionado ao histórico, atualizar campos na tabela principal
  IF TG_OP = 'INSERT' THEN
    UPDATE todos_clientes 
    SET 
      ultimo_pagamento_em = NEW.data_pagamento,
      ultimo_valor_pago = NEW.valor_pago,
      total_pago_comissao = COALESCE(total_pago_comissao, 0) + NEW.valor_pago,
      eh_ultimo_pago = true,
      comissao = 'Pago'
    WHERE id = NEW.cliente_id;
    
    -- Remover flag de último pago de outros clientes (opcional - só um por vez)
    UPDATE todos_clientes 
    SET eh_ultimo_pago = false 
    WHERE id != NEW.cliente_id AND eh_ultimo_pago = true;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_mensagens_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_gestor_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Verificar se o email está na tabela gestores OU se contém '@trafegoporcents.com'
  RETURN EXISTS (
    SELECT 1 FROM public.gestores 
    WHERE email = COALESCE(auth.email(), '') AND ativo = true
  ) OR COALESCE(auth.email(), '') LIKE '%@trafegoporcents.com';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_criativos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Se valor_comissao não foi fornecido ou é NULL, definir como 60.00
  IF NEW.valor_comissao IS NULL THEN
    NEW.valor_comissao := 60.00;
  END IF;
  
  -- Garantir que atendente principal seja adicionado na tabela de atendentes
  IF NEW.email_cliente IS NOT NULL AND NEW.email_gestor IS NOT NULL THEN
    INSERT INTO chat_atendentes (
      cliente_id, 
      email_cliente, 
      email_atendente, 
      pode_atender, 
      ativo
    ) VALUES (
      NEW.id::text, 
      NEW.email_cliente, 
      NEW.email_gestor, 
      true, 
      true
    ) ON CONFLICT (email_cliente, email_atendente) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_gestor_meta_ads_config(p_email_usuario text, p_api_id text, p_app_secret text, p_access_token text, p_ad_account_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_config_id UUID;
  v_result JSON;
BEGIN
  -- Log da operação
  RAISE LOG 'Iniciando salvamento Meta Ads config para usuário: %', p_email_usuario;
  
  -- Verificar se já existe configuração global para este usuário
  SELECT id INTO v_config_id
  FROM public.meta_ads_configs 
  WHERE email_usuario = p_email_usuario 
    AND cliente_id IS NULL;
  
  IF v_config_id IS NOT NULL THEN
    -- Atualizar configuração existente
    RAISE LOG 'Atualizando configuração existente ID: %', v_config_id;
    
    UPDATE public.meta_ads_configs 
    SET 
      api_id = p_api_id,
      app_secret = p_app_secret,
      access_token = p_access_token,
      ad_account_id = p_ad_account_id,
      updated_at = NOW()
    WHERE id = v_config_id;
    
    v_result := json_build_object(
      'success', true,
      'operation', 'update',
      'config_id', v_config_id,
      'message', 'Configuração atualizada com sucesso'
    );
    
  ELSE
    -- Inserir nova configuração
    RAISE LOG 'Inserindo nova configuração para usuário: %', p_email_usuario;
    
    INSERT INTO public.meta_ads_configs (
      email_usuario,
      cliente_id,
      api_id,
      app_secret,
      access_token,
      ad_account_id,
      created_at,
      updated_at
    ) VALUES (
      p_email_usuario,
      NULL, -- Config global do gestor
      p_api_id,
      p_app_secret,
      p_access_token,
      p_ad_account_id,
      NOW(),
      NOW()
    ) RETURNING id INTO v_config_id;
    
    v_result := json_build_object(
      'success', true,
      'operation', 'insert',
      'config_id', v_config_id,
      'message', 'Nova configuração criada com sucesso'
    );
    
  END IF;
  
  RAISE LOG 'Configuração salva com sucesso. ID: %, Operação: %', 
    v_config_id, 
    CASE WHEN v_config_id IS NOT NULL THEN 'success' ELSE 'failed' END;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao salvar configuração Meta Ads: % - %', SQLSTATE, SQLERRM;
    
    RETURN json_build_object(
      'success', false,
      'error_code', SQLSTATE,
      'error_message', SQLERRM,
      'operation', 'failed'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_data_limite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Se data_venda foi fornecida e data_limite não foi definida
  IF NEW.data_venda IS NOT NULL AND NEW.data_limite IS NULL THEN
    NEW.data_limite := NEW.data_venda + INTERVAL '15 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Phase 3: Add security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, details jsonb DEFAULT '{}')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Log security events for monitoring
  RAISE LOG 'SECURITY_EVENT: % - User: % - Details: %', 
    event_type, 
    COALESCE(auth.email(), 'anonymous'),
    details::text;
END;
$$;