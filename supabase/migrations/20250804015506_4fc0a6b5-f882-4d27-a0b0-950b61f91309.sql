-- CORREÇÃO DEFINITIVA: PROCESSAR APENAS VENDAS REAIS DO WEBHOOK KIWIFY
-- Resetar todos os leads e processar apenas vendas confirmadas via webhook

-- 1. RESETAR TODOS OS LEADS (limpar dados inconsistentes)
UPDATE public.formularios_parceria 
SET 
  cliente_pago = false,
  status_negociacao = 'pendente',
  updated_at = now()
WHERE cliente_pago = true;

-- 2. PROCESSAR VENDAS APROVADAS DO WEBHOOK
-- Atualizar leads baseado nos logs de webhook com sucesso
UPDATE public.formularios_parceria 
SET 
  cliente_pago = true,
  status_negociacao = 'aceitou',
  updated_at = now()
WHERE email_usuario IN (
  SELECT DISTINCT kwl.email_comprador
  FROM public.kiwify_webhook_logs kwl
  WHERE kwl.status_processamento = 'sucesso'
    AND kwl.lead_encontrado = true
    AND kwl.email_comprador IS NOT NULL
    AND kwl.created_at >= '2025-08-02'::date
    AND kwl.created_at < '2025-08-05'::date
);

-- 3. PROCESSAR VENDAS DO WEBHOOK DATA ESPECÍFICA (02/08 e 03/08)
-- Verificar webhooks com order_status = 'paid' nos dados JSON
UPDATE public.formularios_parceria 
SET 
  cliente_pago = true,
  status_negociacao = 'aceitou',
  updated_at = now()
WHERE email_usuario IN (
  SELECT DISTINCT (kwl.webhook_data->'Customer'->>'email')::text as email
  FROM public.kiwify_webhook_logs kwl
  WHERE kwl.webhook_data->>'order_status' = 'paid'
    AND kwl.webhook_data->>'webhook_event_type' = 'order_approved'
    AND kwl.webhook_data->'Customer'->>'email' IS NOT NULL
    AND kwl.created_at >= '2025-08-02'::date
    AND kwl.created_at < '2025-08-05'::date
)
AND email_usuario IS NOT NULL;

-- 4. PROCESSAR EMAILS ESPECÍFICOS DOS LOGS QUE VIMOS (baseado nos logs do edge function)
-- O email "fred.med85@hotmail.com" apareceu várias vezes nos logs
UPDATE public.formularios_parceria 
SET 
  cliente_pago = true,
  status_negociacao = 'aceitou',
  updated_at = now()
WHERE email_usuario = 'fred.med85@hotmail.com'
  AND EXISTS (
    SELECT 1 FROM public.kiwify_webhook_logs kwl 
    WHERE kwl.email_comprador = 'fred.med85@hotmail.com'
      AND kwl.webhook_data->>'order_status' = 'paid'
  );

-- 5. CRIAR FUNÇÃO PARA PROCESSAR FUTUROS WEBHOOKS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.process_kiwify_webhook_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Só processa se for um webhook de aprovação de pedido
  IF NEW.webhook_data->>'webhook_event_type' = 'order_approved' 
     AND NEW.webhook_data->>'order_status' = 'paid' 
     AND NEW.email_comprador IS NOT NULL THEN
    
    -- Atualizar lead se existir
    UPDATE public.formularios_parceria 
    SET 
      cliente_pago = true,
      status_negociacao = 'aceitou',
      updated_at = now()
    WHERE email_usuario = NEW.email_comprador
      AND cliente_pago = false;
    
    -- Marcar log como processado se encontrou lead
    IF FOUND THEN
      NEW.status_processamento := 'sucesso';
      NEW.lead_encontrado := true;
    ELSE
      NEW.status_processamento := 'lead_nao_encontrado';
      NEW.lead_encontrado := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGER PARA PROCESSAR AUTOMATICAMENTE NOVOS WEBHOOKS
DROP TRIGGER IF EXISTS trigger_process_kiwify_webhook ON public.kiwify_webhook_logs;
CREATE TRIGGER trigger_process_kiwify_webhook
  BEFORE INSERT ON public.kiwify_webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_kiwify_webhook_approval();

-- 7. LOG DA OPERAÇÃO
INSERT INTO public.kiwify_webhook_logs (
  webhook_data,
  email_comprador,
  status_processamento,
  detalhes_erro
) VALUES (
  '{"operation": "manual_correction", "timestamp": "' || now()::text || '"}',
  'system@correction.com',
  'sucesso',
  'Correção manual executada - resetando leads e processando apenas vendas confirmadas via webhook'
);