-- Create Waseller config table
CREATE TABLE IF NOT EXISTS public.waseller_dispatch_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  enabled boolean NOT NULL DEFAULT true,
  -- API/base configuration
  base_url text NOT NULL,
  endpoint_path text NOT NULL,
  default_country_code text NOT NULL DEFAULT '+55',
  campaign_id text,
  -- dispatch/selection options (used by auto-dispatch)
  min_lead_age_minutes integer NOT NULL DEFAULT 0,
  max_per_run integer NOT NULL DEFAULT 50,
  target_statuses text[] NOT NULL DEFAULT ARRAY['pendente','nao_atendeu','sem_resposta']::text[]
);

-- RLS
ALTER TABLE public.waseller_dispatch_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage and view
CREATE POLICY "Admins can manage waseller config"
ON public.waseller_dispatch_config
AS RESTRICTIVE
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Timestamp trigger function already exists as update_updated_at_column()
DROP TRIGGER IF EXISTS trg_update_waseller_dispatch_config ON public.waseller_dispatch_config;
CREATE TRIGGER trg_update_waseller_dispatch_config
BEFORE UPDATE ON public.waseller_dispatch_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create Waseller logs table
CREATE TABLE IF NOT EXISTS public.waseller_dispatch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  lead_id uuid NOT NULL,
  phone text,
  recipient_name text,
  message_preview text,
  status text NOT NULL, -- success | error
  status_code integer,
  error_message text,
  trigger_type text NOT NULL DEFAULT 'manual', -- manual | auto
  requester_email text,
  request_payload jsonb DEFAULT '{}'::jsonb,
  response_body jsonb,
  waseller_message_id text
);

ALTER TABLE public.waseller_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view waseller logs"
ON public.waseller_dispatch_logs
FOR SELECT
TO public
USING (is_admin_user());

-- Allow inserting logs from system (edge functions) for any user (no JWT in functions)
CREATE POLICY "System can insert waseller logs"
ON public.waseller_dispatch_logs
FOR INSERT
TO public
WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_waseller_logs_lead_id ON public.waseller_dispatch_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_waseller_logs_created_at ON public.waseller_dispatch_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waseller_config_enabled ON public.waseller_dispatch_config(enabled);

-- Seed a default config row if none exists
INSERT INTO public.waseller_dispatch_config (enabled, base_url, endpoint_path, default_country_code, campaign_id)
SELECT true, 'https://api.waseller.com', '/v1/messages', '+55', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.waseller_dispatch_config);
