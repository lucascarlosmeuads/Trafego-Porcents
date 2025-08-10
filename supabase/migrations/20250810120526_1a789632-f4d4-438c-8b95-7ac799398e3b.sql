
-- 1) Tabela para armazenar eventos do Webhook da Evolution API
CREATE TABLE IF NOT EXISTS public.evolution_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT,
  instance_name TEXT,
  status TEXT DEFAULT 'received',
  headers JSONB,
  query JSONB,
  payload JSONB NOT NULL,
  error_message TEXT
);

-- 2) Índices úteis para consultas e monitoramento
CREATE INDEX IF NOT EXISTS idx_evolution_webhook_events_created_at 
  ON public.evolution_webhook_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evolution_webhook_events_event_type 
  ON public.evolution_webhook_events (event_type);

CREATE INDEX IF NOT EXISTS idx_evolution_webhook_events_instance_name 
  ON public.evolution_webhook_events (instance_name);

-- 3) Habilitar RLS e políticas
ALTER TABLE public.evolution_webhook_events ENABLE ROW LEVEL SECURITY;

-- Leitura apenas para administradores (usa a função is_admin_user() já existente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'evolution_webhook_events' 
      AND policyname = 'Admins can read webhook events'
  ) THEN
    CREATE POLICY "Admins can read webhook events"
      ON public.evolution_webhook_events
      FOR SELECT
      USING (public.is_admin_user());
  END IF;
END$$;

-- Observação:
-- A inserção será feita pelas Edge Functions usando a Service Role Key,
-- que ignora RLS por padrão, mantendo os dados seguros (sem expor INSERT público).
