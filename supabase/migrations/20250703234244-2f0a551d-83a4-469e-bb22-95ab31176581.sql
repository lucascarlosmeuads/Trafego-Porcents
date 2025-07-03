
-- Dropar função existente se houver
DROP FUNCTION IF EXISTS public.save_gestor_meta_ads_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Criar função melhorada para salvar configuração de gestor Meta Ads
CREATE OR REPLACE FUNCTION public.save_gestor_meta_ads_config(
  p_email_usuario TEXT,
  p_api_id TEXT,
  p_app_secret TEXT,
  p_access_token TEXT,
  p_ad_account_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.save_gestor_meta_ads_config TO authenticated;
