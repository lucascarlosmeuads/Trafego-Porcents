-- Enable required extensions for scheduling HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1) Recovery queue table
CREATE TABLE IF NOT EXISTS public.evolution_recovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.formularios_parceria(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | sent | failed | cancelled | skipped
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evolution_recovery_queue_scheduled_at
  ON public.evolution_recovery_queue (scheduled_at);

-- Ensure only one active (pending/processing) job per lead
CREATE UNIQUE INDEX IF NOT EXISTS ux_evolution_recovery_queue_lead_active
  ON public.evolution_recovery_queue (lead_id)
  WHERE status IN ('pending','processing');

-- Enable RLS and restrict access
ALTER TABLE public.evolution_recovery_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- Admins can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'evolution_recovery_queue' AND policyname = 'Admins can view recovery queue'
  ) THEN
    CREATE POLICY "Admins can view recovery queue"
    ON public.evolution_recovery_queue
    FOR SELECT
    USING (is_admin_user());
  END IF;

  -- Admins can manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'evolution_recovery_queue' AND policyname = 'Admins can manage recovery queue'
  ) THEN
    CREATE POLICY "Admins can manage recovery queue"
    ON public.evolution_recovery_queue
    FOR ALL
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  END IF;
END $$;

-- Auto-update updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_evolution_recovery_queue_updated_at'
  ) THEN
    CREATE TRIGGER trg_evolution_recovery_queue_updated_at
    BEFORE UPDATE ON public.evolution_recovery_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Triggers to schedule/cancel entries based on lead status
CREATE OR REPLACE FUNCTION public.schedule_recovery_on_insert()
RETURNS trigger AS $$
BEGIN
  -- Only schedule if not buyer and not paid
  IF COALESCE(NEW.status_negociacao, 'pendente') <> 'comprou' AND COALESCE(NEW.cliente_pago, false) = false THEN
    -- Avoid duplicates for active jobs
    IF NOT EXISTS (
      SELECT 1 FROM public.evolution_recovery_queue q
      WHERE q.lead_id = NEW.id AND q.status IN ('pending','processing')
    ) THEN
      INSERT INTO public.evolution_recovery_queue (lead_id, scheduled_at, status)
      VALUES (NEW.id, now() + INTERVAL '12 minutes', 'pending');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_schedule_recovery_on_insert'
  ) THEN
    CREATE TRIGGER trg_schedule_recovery_on_insert
    AFTER INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.schedule_recovery_on_insert();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_recovery_on_update()
RETURNS trigger AS $$
BEGIN
  -- If the lead becomes a buyer or is marked as paid, cancel any active jobs
  IF (NEW.status_negociacao = 'comprou') OR (COALESCE(NEW.cliente_pago, false) = true) THEN
    UPDATE public.evolution_recovery_queue
      SET status = 'cancelled', updated_at = now()
    WHERE lead_id = NEW.id AND status IN ('pending','processing');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cancel_recovery_on_update'
  ) THEN
    CREATE TRIGGER trg_cancel_recovery_on_update
    AFTER UPDATE OF status_negociacao, cliente_pago ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.cancel_recovery_on_update();
  END IF;
END $$;

-- 3) Schedule the processor to run every minute (rate limit via max 2 per run)
-- This requires pg_cron and pg_net (enabled above)
-- The function will be created next; the schedule can exist beforehand.
SELECT cron.schedule(
  'process-evolution-recovery-queue-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/evolution-process-recovery-queue',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4cGdxdW5xc2VneXBzc29xcHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzEyODcsImV4cCI6MjA2MzE0NzI4N30.9ZzV-alsdI4EqrzRwFDxP9Vjr2l_KXHMPN9dVyf5ZWI"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
