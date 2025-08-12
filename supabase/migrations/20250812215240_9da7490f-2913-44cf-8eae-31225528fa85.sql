
-- 1) Distribuir 100% para o Edu em novos leads
CREATE OR REPLACE FUNCTION public.distribuir_novo_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  vendedor_email TEXT := 'vendedoredu@trafegoporcents.com';
BEGIN
  -- Só distribui se o lead não tem vendedor e não está pago
  IF NEW.vendedor_responsavel IS NULL AND COALESCE(NEW.cliente_pago, false) = false THEN
    NEW.vendedor_responsavel := vendedor_email;
    NEW.distribuido_em := now();

    -- Opcional: atualizar o controle apenas para manter o timestamp
    UPDATE public.leads_distribuicao_controle
      SET ultima_distribuicao = now(),
          updated_at = now()
    WHERE contador_atual IS NOT NULL;

    RAISE LOG 'Lead % distribuído 100%% para %', NEW.id, vendedor_email;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Deixar a distribuição retroativa também 100% para o Edu
CREATE OR REPLACE FUNCTION public.aplicar_distribuicao_retroativa()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  lead_record RECORD;
  vendedor_email TEXT := 'vendedoredu@trafegoporcents.com';
  total_processados INTEGER := 0;
BEGIN
  RAISE LOG 'Iniciando distribuição retroativa 100%% Edu';

  -- Desabilitar triggers temporariamente (caso exista algum fluxo adicional)
  ALTER TABLE public.formularios_parceria DISABLE TRIGGER ALL;

  FOR lead_record IN 
    SELECT id FROM public.formularios_parceria 
    WHERE vendedor_responsavel IS NULL 
      AND COALESCE(cliente_pago, false) = false
    ORDER BY created_at ASC
  LOOP
    UPDATE public.formularios_parceria 
    SET 
      vendedor_responsavel = vendedor_email,
      distribuido_em = now(),
      updated_at = now()
    WHERE id = lead_record.id
      AND vendedor_responsavel IS NULL 
      AND COALESCE(cliente_pago, false) = false;

    total_processados := total_processados + 1;
  END LOOP;

  -- Reabilitar triggers
  ALTER TABLE public.formularios_parceria ENABLE TRIGGER ALL;

  -- Atualizar controle (opcional)
  INSERT INTO public.leads_distribuicao_controle (contador_atual, ultima_distribuicao, created_at, updated_at)
  VALUES (1, now(), now(), now())
  ON CONFLICT (id) DO UPDATE SET
    contador_atual = 1,
    ultima_distribuicao = now(),
    updated_at = now();
    
  RAISE LOG 'Distribuição retroativa concluída. % leads processados para o Edu.', total_processados;
END;
$function$;

-- 3) Aplicar imediatamente para os leads já existentes sem vendedor e não pagos
UPDATE public.formularios_parceria 
SET 
  vendedor_responsavel = 'vendedoredu@trafegoporcents.com',
  distribuido_em = now(),
  updated_at = now()
WHERE vendedor_responsavel IS NULL 
  AND COALESCE(cliente_pago, false) = false;
