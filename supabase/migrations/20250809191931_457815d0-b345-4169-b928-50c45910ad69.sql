
-- 1) Garantir que a tabela exista (ignora se já existir)
CREATE TABLE IF NOT EXISTS public.waseller_dispatch_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  server_url text NOT NULL,
  instance_name text NOT NULL,
  default_country_code text NOT NULL DEFAULT '+55',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) RLS ligado (idempotente)
ALTER TABLE public.waseller_dispatch_config ENABLE ROW LEVEL SECURITY;

-- 3) Índice único por api_type para manter 1 config por tipo
CREATE UNIQUE INDEX IF NOT EXISTS waseller_dispatch_config_api_type_key
ON public.waseller_dispatch_config (api_type);

-- 4) Política: admins podem gerenciar tudo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'waseller_dispatch_config' 
      AND policyname = 'Admins can manage dispatch config'
  ) THEN
    CREATE POLICY "Admins can manage dispatch config"
      ON public.waseller_dispatch_config
      FOR ALL
      USING (is_admin_user())
      WITH CHECK (is_admin_user());
  END IF;
END$$;

-- (Opcional) Política apenas de leitura para funções anônimas? Não é necessário,
-- as Edge Functions usam service role e já ignoram RLS.

-- 5) Gatilho updated_at (usa função já existente update_updated_at_column())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'waseller_dispatch_config_set_updated_at'
  ) THEN
    CREATE TRIGGER waseller_dispatch_config_set_updated_at
    BEFORE UPDATE ON public.waseller_dispatch_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 6) Upsert da sua configuração Evolution
INSERT INTO public.waseller_dispatch_config (
  api_type, enabled, server_url, instance_name, default_country_code
) VALUES (
  'evolution', true, 'http://72.60.7.194:8080', 'lucas', '+55'
)
ON CONFLICT (api_type) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  server_url = EXCLUDED.server_url,
  instance_name = EXCLUDED.instance_name,
  default_country_code = EXCLUDED.default_country_code,
  updated_at = now();
