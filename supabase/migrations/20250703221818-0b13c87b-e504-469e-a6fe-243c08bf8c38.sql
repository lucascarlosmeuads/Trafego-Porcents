
-- Dropar função existente se houver
DROP FUNCTION IF EXISTS public.save_gestor_meta_ads_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Criar função para salvar configuração de gestor Meta Ads
CREATE OR REPLACE FUNCTION public.save_gestor_meta_ads_config(
  p_email_usuario TEXT,
  p_api_id TEXT,
  p_app_secret TEXT,
  p_access_token TEXT,
  p_ad_account_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Primeiro deletar configuração existente se houver
  DELETE FROM public.meta_ads_configs 
  WHERE email_usuario = p_email_usuario 
    AND cliente_id IS NULL;
  
  -- Inserir nova configuração
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
  );
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.save_gestor_meta_ads_config TO authenticated;
