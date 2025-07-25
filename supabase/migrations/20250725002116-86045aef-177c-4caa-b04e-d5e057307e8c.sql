-- Criar tabela para configurações de API de múltiplos provedores
CREATE TABLE public.api_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('text', 'image')),
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  email_usuario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Garantir apenas um padrão por tipo por usuário
  UNIQUE(email_usuario, provider_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Habilitar RLS
ALTER TABLE public.api_configurations ENABLE ROW LEVEL SECURITY;

-- Policies para segurança
CREATE POLICY "Users can manage their own API configurations"
  ON public.api_configurations
  FOR ALL
  USING (email_usuario = auth.email())
  WITH CHECK (email_usuario = auth.email());

CREATE POLICY "Admins can manage all API configurations"
  ON public.api_configurations
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Trigger para updated_at
CREATE TRIGGER update_api_configurations_updated_at
  BEFORE UPDATE ON public.api_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão admin para Runway (se necessário)
INSERT INTO public.api_configurations (provider_name, provider_type, api_key, is_default, email_usuario, is_active) 
VALUES 
  ('runway', 'image', 'placeholder_runway_key', true, 'admin@system.com', false),
  ('openai', 'text', 'placeholder_openai_key', true, 'admin@system.com', false)
ON CONFLICT DO NOTHING;