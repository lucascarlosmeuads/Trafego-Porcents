-- Criação da tabela de configuração da Kiwify
CREATE TABLE public.kiwify_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_secret TEXT NOT NULL,
  client_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  webhook_url TEXT GENERATED ALWAYS AS ('https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/kiwify-webhook') STORED,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criação da tabela de logs do webhook
CREATE TABLE public.kiwify_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_data JSONB NOT NULL,
  email_comprador TEXT,
  lead_encontrado BOOLEAN DEFAULT false,
  lead_id UUID,
  status_processamento TEXT NOT NULL DEFAULT 'processando',
  detalhes_erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kiwify_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiwify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para kiwify_config (apenas admins)
CREATE POLICY "Admins podem gerenciar configuração Kiwify" 
ON public.kiwify_config 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Políticas para kiwify_webhook_logs (apenas admins)
CREATE POLICY "Admins podem ver logs Kiwify" 
ON public.kiwify_webhook_logs 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Sistema pode inserir logs Kiwify" 
ON public.kiwify_webhook_logs 
FOR INSERT 
WITH CHECK (true);

-- Trigger para atualizar updated_at na configuração
CREATE TRIGGER update_kiwify_config_updated_at
  BEFORE UPDATE ON public.kiwify_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir a configuração inicial com os dados fornecidos
INSERT INTO public.kiwify_config (client_secret, client_id, account_id)
VALUES ('84a13d686daceb5f443a485bc9bc0bfe4ca8d3cec7609de545e98cf9c8f56e8c', '8fa8c6af-c143-4379-8992-edea88ee1d6d', 'eBfQnangp4eQYkN');