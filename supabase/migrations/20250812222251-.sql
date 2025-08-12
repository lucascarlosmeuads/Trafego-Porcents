-- Auto-process Kiwify logs via DB trigger and add performance indexes
-- 1) Trigger: process approvals before insert
DROP TRIGGER IF EXISTS trg_kiwify_logs_auto_process ON public.kiwify_webhook_logs;
CREATE TRIGGER trg_kiwify_logs_auto_process
BEFORE INSERT ON public.kiwify_webhook_logs
FOR EACH ROW
EXECUTE FUNCTION public.process_kiwify_webhook_approval();

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_form_email_lower ON public.formularios_parceria (lower(email_usuario));
CREATE INDEX IF NOT EXISTS idx_form_created_at ON public.formularios_parceria (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_email_lower_status ON public.kiwify_webhook_logs (lower(email_comprador), status_processamento);
CREATE INDEX IF NOT EXISTS idx_form_vendedor_pago_export ON public.formularios_parceria (vendedor_responsavel, cliente_pago, exportado_em, created_at DESC);

-- 3) Retroactively reprocess last 30 days of Kiwify webhook logs
SELECT * FROM public.reprocess_kiwify_webhooks_interval((CURRENT_DATE - INTERVAL '30 days')::date, CURRENT_DATE::date);
