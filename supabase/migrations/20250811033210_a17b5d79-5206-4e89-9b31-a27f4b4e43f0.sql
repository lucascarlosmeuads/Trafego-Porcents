-- Enable realtime and set replica identity for full row data
ALTER TABLE public.formularios_parceria REPLICA IDENTITY FULL;
ALTER TABLE public.kiwify_webhook_logs REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'formularios_parceria'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.formularios_parceria;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'kiwify_webhook_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kiwify_webhook_logs;
  END IF;
END $$;

-- Create useful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_form_parc_lower_email ON public.formularios_parceria (lower(email_usuario));
CREATE INDEX IF NOT EXISTS idx_form_parc_data_compra ON public.formularios_parceria (data_compra);
CREATE INDEX IF NOT EXISTS idx_form_parc_created_at ON public.formularios_parceria (created_at);

CREATE INDEX IF NOT EXISTS idx_kiwify_lower_email ON public.kiwify_webhook_logs (lower(email_comprador));
CREATE INDEX IF NOT EXISTS idx_kiwify_created_at ON public.kiwify_webhook_logs (created_at);

-- Attach triggers to formularios_parceria (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_validate_insert') THEN
    CREATE TRIGGER trg_form_parc_validate_insert
    BEFORE INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_partnership_form();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_updated_at') THEN
    CREATE TRIGGER trg_form_parc_updated_at
    BEFORE UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.update_formularios_parceria_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_distribuir') THEN
    CREATE TRIGGER trg_form_parc_distribuir
    BEFORE INSERT OR UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.distribuir_novo_lead();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_process_payment') THEN
    CREATE TRIGGER trg_form_parc_process_payment
    AFTER INSERT OR UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.process_parceria_client_payment();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_schedule_recovery') THEN
    CREATE TRIGGER trg_form_parc_schedule_recovery
    AFTER INSERT ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.schedule_recovery_on_insert();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_parc_cancel_recovery') THEN
    CREATE TRIGGER trg_form_parc_cancel_recovery
    AFTER UPDATE ON public.formularios_parceria
    FOR EACH ROW
    EXECUTE FUNCTION public.cancel_recovery_on_update();
  END IF;
END $$;

-- Attach trigger to kiwify_webhook_logs to process approvals automatically
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kiwify_process_paid') THEN
    CREATE TRIGGER trg_kiwify_process_paid
    AFTER INSERT ON public.kiwify_webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.process_kiwify_webhook_approval();
  END IF;
END $$;

-- Backfill approved webhooks for Aug 10th and for today
-- These calls will update leads and mark logs accordingly
SELECT * FROM public.reprocess_kiwify_webhooks_interval('2025-08-10'::date, '2025-08-10'::date);
SELECT * FROM public.reprocess_kiwify_webhooks_interval(current_date::date, current_date::date);
