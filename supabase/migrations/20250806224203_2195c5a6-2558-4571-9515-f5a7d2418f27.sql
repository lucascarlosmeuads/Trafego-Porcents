-- Atualizar funções que usam status antigos para novos status

-- Atualizar função create_parceria_client
CREATE OR REPLACE FUNCTION public.create_parceria_client()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Só processa quando lead vira "comprou" e cliente_pago = true
  IF (NEW.status_negociacao = 'comprou' AND NEW.cliente_pago = true) AND 
     (OLD.status_negociacao != 'comprou' OR OLD.cliente_pago != true) THEN
    
    -- Verificar se já existe cliente parceria com este email
    IF NOT EXISTS (
      SELECT 1 FROM public.clientes_parceria 
      WHERE email_cliente = NEW.email_usuario
    ) THEN
      -- Inserir novo cliente parceria
      INSERT INTO public.clientes_parceria (
        email_cliente,
        nome_cliente,
        lead_id,
        dados_formulario,
        created_at,
        updated_at
      ) VALUES (
        NEW.email_usuario,
        COALESCE((NEW.respostas->>'nome'), 'Cliente Parceria'),
        NEW.id,
        NEW.respostas,
        now(),
        now()
      );
      
      -- Usar pg_notify para chamar edge function
      PERFORM pg_notify('create_parceria_user', NEW.email_usuario);
      
      RAISE LOG 'Cliente parceria criado para email: %', NEW.email_usuario;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Atualizar função process_parceria_client_payment
CREATE OR REPLACE FUNCTION public.process_parceria_client_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Só processa quando lead vira "comprou" e cliente_pago = true
  IF (NEW.status_negociacao = 'comprou' AND NEW.cliente_pago = true) AND 
     (OLD IS NULL OR OLD.status_negociacao != 'comprou' OR OLD.cliente_pago != true) THEN
    
    -- Log da operação
    RAISE LOG 'Cliente pagou - processando criação de usuário Auth: %', NEW.email_usuario;
    
    -- Verificar se já existe cliente parceria com este email
    IF NOT EXISTS (
      SELECT 1 FROM public.clientes_parceria 
      WHERE email_cliente = NEW.email_usuario
    ) THEN
      -- Inserir novo cliente parceria
      INSERT INTO public.clientes_parceria (
        email_cliente,
        nome_cliente,
        lead_id,
        dados_formulario,
        created_at,
        updated_at
      ) VALUES (
        NEW.email_usuario,
        COALESCE((NEW.respostas->>'nome'), 'Cliente Parceria'),
        NEW.id,
        NEW.respostas,
        now(),
        now()
      );
      
      RAISE LOG 'Cliente parceria criado para email: %', NEW.email_usuario;
    END IF;
    
    -- Usar pg_notify para chamar edge function de criação de usuário Auth
    PERFORM pg_notify('create_parceria_user', NEW.email_usuario);
    
    RAISE LOG 'Notificação enviada para criar usuário Auth: %', NEW.email_usuario;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Atualizar função process_kiwify_webhook_approval
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
$function$;

-- Atualizar função processar_leads_retroativos
CREATE OR REPLACE FUNCTION public.processar_leads_retroativos()
 RETURNS TABLE(leads_processados integer, clientes_criados integer, usuarios_auth_criados integer, detalhes jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  lead_record RECORD;
  clientes_inseridos INTEGER := 0;
  total_leads INTEGER := 0;
  usuarios_criados INTEGER := 0;
  detalhes_resultado JSONB := '[]'::jsonb;
BEGIN
  -- Buscar todos os leads que estão "comprou" e "cliente_pago" mas não têm cliente parceria
  FOR lead_record IN 
    SELECT f.* FROM public.formularios_parceria f
    LEFT JOIN public.clientes_parceria cp ON cp.email_cliente = f.email_usuario
    WHERE f.status_negociacao = 'comprou' 
      AND f.cliente_pago = true
      AND f.email_usuario IS NOT NULL
      AND cp.id IS NULL
  LOOP
    total_leads := total_leads + 1;
    
    -- Criar cliente parceria se não existir
    INSERT INTO public.clientes_parceria (
      email_cliente,
      nome_cliente,
      lead_id,
      dados_formulario,
      created_at,
      updated_at
    ) VALUES (
      lead_record.email_usuario,
      COALESCE((lead_record.respostas->>'nome'), 'Cliente Parceria'),
      lead_record.id,
      lead_record.respostas,
      lead_record.created_at, -- Manter data original
      now()
    );
    
    clientes_inseridos := clientes_inseridos + 1;
    
    -- Sinalizar criação de usuário Auth via pg_notify
    PERFORM pg_notify('create_parceria_user', lead_record.email_usuario);
    usuarios_criados := usuarios_criados + 1;
    
    -- Adicionar aos detalhes
    detalhes_resultado := detalhes_resultado || jsonb_build_object(
      'email', lead_record.email_usuario,
      'nome', COALESCE((lead_record.respostas->>'nome'), 'Cliente Parceria'),
      'data_lead', lead_record.created_at,
      'vendedor', lead_record.vendedor_responsavel
    );
    
    RAISE LOG 'Cliente parceria retroativo criado: %', lead_record.email_usuario;
  END LOOP;
  
  RETURN QUERY SELECT 
    total_leads,
    clientes_inseridos,
    usuarios_criados,
    detalhes_resultado;
END;
$function$;