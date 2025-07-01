
-- Criar tabela para configuração da integração com App Max
CREATE TABLE public.max_integration_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gestor_email TEXT NOT NULL,
  gestor_nome TEXT NOT NULL,
  integration_active BOOLEAN NOT NULL DEFAULT true,
  webhook_url TEXT,
  webhook_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs da integração
CREATE TABLE public.max_integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id TEXT,
  status TEXT NOT NULL DEFAULT 'processando',
  dados_originais JSONB NOT NULL,
  cliente_criado_id BIGINT,
  gestor_atribuido TEXT,
  erro_detalhes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.max_integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.max_integration_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para max_integration_config
CREATE POLICY "Admins can manage max integration config"
ON public.max_integration_config
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Políticas RLS para max_integration_logs
CREATE POLICY "Admins can view max integration logs"
ON public.max_integration_logs
FOR SELECT
TO authenticated
USING (is_admin_user());

CREATE POLICY "System can insert max integration logs"
ON public.max_integration_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger para atualizar updated_at na config
CREATE OR REPLACE FUNCTION update_max_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_max_integration_config_updated_at
  BEFORE UPDATE ON public.max_integration_config
  FOR EACH ROW
  EXECUTE FUNCTION update_max_config_updated_at();

-- Inserir configuração inicial (desativada por padrão)
INSERT INTO public.max_integration_config (
  gestor_email,
  gestor_nome,
  integration_active,
  webhook_url
) VALUES (
  'andreza@trafegoporcents.com',
  'Andreza',
  false,
  'https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/max-webhook'
);
