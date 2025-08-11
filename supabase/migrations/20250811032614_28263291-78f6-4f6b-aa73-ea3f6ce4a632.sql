
-- 1) Realtime: garantir que as tabelas estejam publicadas e com REPLICA IDENTITY FULL
ALTER TABLE public.formularios_parceria REPLICA IDENTITY FULL;
ALTER TABLE public.kiwify_webhook_logs REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.formularios_parceria;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kiwify_webhook_logs;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- 2) Triggers na tabela de leads (formularios_parceria)

-- Atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trg_form_updated_at ON public.formularios_parceria;
CREATE TRIGGER trg_form_updated_at
BEFORE UPDATE ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validação e sanitização do formulário
DROP TRIGGER IF EXISTS trg_validate_parceria ON public.formularios_parceria;
CREATE TRIGGER trg_validate_parceria
BEFORE INSERT OR UPDATE ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.validate_partnership_form();

-- Rate limit de submissões
DROP TRIGGER IF EXISTS trg_rate_limit_form ON public.formularios_parceria;
CREATE TRIGGER trg_rate_limit_form
BEFORE INSERT ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.check_form_submission_rate();

-- Distribuição de novo lead
DROP TRIGGER IF EXISTS trg_distribuir_lead ON public.formularios_parceria;
CREATE TRIGGER trg_distribuir_lead
BEFORE INSERT ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.distribuir_novo_lead();

-- Agendar recuperação ao inserir
DROP TRIGGER IF EXISTS trg_schedule_recovery ON public.formularios_parceria;
CREATE TRIGGER trg_schedule_recovery
AFTER INSERT ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.schedule_recovery_on_insert();

-- Cancelar recuperação quando vira comprador/pago
DROP TRIGGER IF EXISTS trg_cancel_recovery ON public.formularios_parceria;
CREATE TRIGGER trg_cancel_recovery
AFTER UPDATE ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.cancel_recovery_on_update();

-- Processar pagamento: criar cliente_parceria e notificar para criar usuário
DROP TRIGGER IF EXISTS trg_process_payment ON public.formularios_parceria;
CREATE TRIGGER trg_process_payment
AFTER UPDATE ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.process_parceria_client_payment();

-- 3) Trigger para processar webhooks pagos assim que forem inseridos
DROP TRIGGER IF EXISTS trg_process_kiwify_webhook ON public.kiwify_webhook_logs;
CREATE TRIGGER trg_process_kiwify_webhook
BEFORE INSERT ON public.kiwify_webhook_logs
FOR EACH ROW
EXECUTE FUNCTION public.process_kiwify_webhook_approval();

-- 4) Índices para performance
CREATE INDEX IF NOT EXISTS idx_form_email_usuario ON public.formularios_parceria (email_usuario);
CREATE INDEX IF NOT EXISTS idx_form_email_usuario_lower ON public.formularios_parceria ((lower(email_usuario)));
CREATE INDEX IF NOT EXISTS idx_form_data_compra ON public.formularios_parceria (data_compra);
CREATE INDEX IF NOT EXISTS idx_form_status_pago ON public.formularios_parceria (status_negociacao, cliente_pago);
CREATE INDEX IF NOT EXISTS idx_form_vendedor ON public.formularios_parceria (vendedor_responsavel);

CREATE INDEX IF NOT EXISTS idx_kiwify_email_lower ON public.kiwify_webhook_logs ((lower(email_comprador)));
CREATE INDEX IF NOT EXISTS idx_kiwify_created_at ON public.kiwify_webhook_logs (created_at);

-- 5) Função de reprocessamento retroativo (usa email e marca paid/order_approved)
CREATE OR REPLACE FUNCTION public.reprocess_kiwify_webhooks_interval(p_start_date date, p_end_date date DEFAULT NULL)
RETURNS TABLE(updated_leads int, processed_logs int)
LANGUAGE plpgsql
AS $$
DECLARE
  v_start timestamptz := p_start_date::timestamptz;
  v_end   timestamptz := COALESCE(p_end_date, p_start_date)::timestamptz + interval '23 hours 59 minutes 59 seconds';
BEGIN
  WITH paid AS (
    SELECT
      l.id AS log_id,
      lower(l.email_comprador) AS email_norm,
      l.webhook_data,
      l.created_at,
      COALESCE(
        NULLIF(l.webhook_data->>'approved_date','')::timestamptz,
        NULLIF(l.webhook_data->>'approved_at','')::timestamptz,
        NULLIF(l.webhook_data->>'paid_at','')::timestamptz,
        l.created_at
      ) AS paid_at_guess
    FROM public.kiwify_webhook_logs l
    WHERE l.created_at >= v_start
      AND l.created_at <= v_end
      AND (
        (l.webhook_data->>'order_status')::text = 'paid'
        OR (l.webhook_data->>'webhook_event_type') IN ('order_approved','checkout.approved')
        OR (l.webhook_data ? 'approved_at')
        OR (l.webhook_data ? 'approved_date')
        OR (l.webhook_data ? 'paid_at')
      )
  ), upd AS (
    UPDATE public.formularios_parceria f
    SET cliente_pago = true,
        status_negociacao = 'comprou',
        data_compra = COALESCE(f.data_compra, paid.paid_at_guess),
        updated_at = now()
    FROM paid
    WHERE lower(f.email_usuario) = paid.email_norm
      AND (COALESCE(f.cliente_pago,false) = false OR f.status_negociacao <> 'comprou' OR f.data_compra IS NULL)
    RETURNING f.id, paid.log_id
  ), upd_logs AS (
    UPDATE public.kiwify_webhook_logs l
    SET status_processamento = 'sucesso',
        lead_encontrado = true
    FROM upd u
    WHERE l.id = u.log_id
    RETURNING l.id
  )
  SELECT (SELECT count(*) FROM upd), (SELECT count(*) FROM paid)
  INTO updated_leads, processed_logs;

  RETURN NEXT;
END;
$$;

-- 6) Rodar agora para o dia 10 e hoje (backfill imediato)
DO $$
DECLARE
  d_today date := current_date;
BEGIN
  PERFORM * FROM public.reprocess_kiwify_webhooks_interval('2025-08-10'::date, '2025-08-10'::date);
  PERFORM * FROM public.reprocess_kiwify_webhooks_interval(d_today, d_today);
END $$;
