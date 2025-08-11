-- Add data_compra to formularios_parceria and supporting index
ALTER TABLE public.formularios_parceria
ADD COLUMN IF NOT EXISTS data_compra TIMESTAMPTZ;

-- Index to speed up filtering by purchase date
CREATE INDEX IF NOT EXISTS idx_formularios_parceria_data_compra
  ON public.formularios_parceria (data_compra DESC);

-- Backfill data_compra for already purchased leads when missing
UPDATE public.formularios_parceria
SET data_compra = COALESCE(data_compra, updated_at, created_at)
WHERE status_negociacao = 'comprou'
  AND COALESCE(cliente_pago, false) = true
  AND data_compra IS NULL;

-- Update Kiwify webhook processing function to also set data_compra when marking purchase
CREATE OR REPLACE FUNCTION public.process_kiwify_webhook_approval()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Só processa se for um webhook de aprovação de pedido
  IF NEW.webhook_data->>'webhook_event_type' = 'order_approved' 
     AND NEW.webhook_data->>'order_status' = 'paid' 
     AND NEW.email_comprador IS NOT NULL THEN
    
    -- Atualizar lead se existir
    UPDATE public.formularios_parceria 
    SET 
      cliente_pago = true,
      status_negociacao = 'comprou',
      -- Usa datas do payload quando disponíveis; fallback para now()
      data_compra = COALESCE(
        NULLIF(NEW.webhook_data->>'approved_at','')::timestamptz,
        NULLIF(NEW.webhook_data->>'paid_at','')::timestamptz,
        NULLIF(NEW.webhook_data->>'created_at','')::timestamptz,
        now()
      ),
      updated_at = now()
    WHERE email_usuario = NEW.email_comprador
      AND COALESCE(cliente_pago, false) = false;
    
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
$function$;