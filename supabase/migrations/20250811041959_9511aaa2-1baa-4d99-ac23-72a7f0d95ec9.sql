
-- 1) Garantir que o trigger de processamento automático existe (processa antes de inserir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_process_kiwify_webhook_approval'
  ) THEN
    CREATE TRIGGER trg_process_kiwify_webhook_approval
    BEFORE INSERT ON public.kiwify_webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.process_kiwify_webhook_approval();
  END IF;
END
$$;

-- 2) Reprocessar webhooks pagos/aprovados dos dias 10 e 11/08
--    Isso marca cliente_pago = true, status_negociacao = 'comprou' e preenche data_compra
SELECT *
FROM public.reprocess_kiwify_webhooks_interval('2025-08-10'::date, '2025-08-11'::date);

-- 3) Conferência: quantos leads ficaram como 'comprou' por dia (usando data_compra ou updated_at)
SELECT 'comprou_dia_10' AS label, COUNT(*) AS total
FROM public.formularios_parceria
WHERE status_negociacao = 'comprou'
  AND COALESCE(data_compra, updated_at)::date = '2025-08-10';

SELECT 'comprou_dia_11' AS label, COUNT(*) AS total
FROM public.formularios_parceria
WHERE status_negociacao = 'comprou'
  AND COALESCE(data_compra, updated_at)::date = '2025-08-11';

-- 4) Diagnóstico: webhooks pagos do dia 10/08 sem lead correspondente
WITH paid AS (
  SELECT 
    id AS log_id,
    lower(email_comprador) AS email_norm,
    created_at,
    webhook_data
  FROM public.kiwify_webhook_logs
  WHERE created_at::date = '2025-08-10'
    AND (
      (webhook_data->>'order_status') = 'paid'
      OR (webhook_data->>'webhook_event_type') IN ('order_approved','checkout.approved')
      OR (webhook_data ? 'approved_at')
      OR (webhook_data ? 'approved_date')
      OR (webhook_data ? 'paid_at')
    )
)
SELECT 
  'webhooks_pagos_sem_lead_dia_10' AS label,
  COUNT(*) AS total_sem_lead
FROM paid p
LEFT JOIN LATERAL (
  SELECT id 
  FROM public.formularios_parceria f 
  WHERE lower(f.email_usuario) = p.email_norm 
  ORDER BY f.created_at DESC 
  LIMIT 1
) t ON TRUE
WHERE t.id IS NULL;

-- 5) Diagnóstico: webhooks pagos do dia 11/08 sem lead correspondente
WITH paid AS (
  SELECT 
    id AS log_id,
    lower(email_comprador) AS email_norm,
    created_at,
    webhook_data
  FROM public.kiwify_webhook_logs
  WHERE created_at::date = '2025-08-11'
    AND (
      (webhook_data->>'order_status') = 'paid'
      OR (webhook_data->>'webhook_event_type') IN ('order_approved','checkout.approved')
      OR (webhook_data ? 'approved_at')
      OR (webhook_data ? 'approved_date')
      OR (webhook_data ? 'paid_at')
    )
)
SELECT 
  'webhooks_pagos_sem_lead_dia_11' AS label,
  COUNT(*) AS total_sem_lead
FROM paid p
LEFT JOIN LATERAL (
  SELECT id 
  FROM public.formularios_parceria f 
  WHERE lower(f.email_usuario) = p.email_norm 
  ORDER BY f.created_at DESC 
  LIMIT 1
) t ON TRUE
WHERE t.id IS NULL;
