-- Corrigir função com search_path apropriado
CREATE OR REPLACE FUNCTION process_parceria_client_payment()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Só processa quando lead vira "aceitou" e cliente_pago = true
  IF (NEW.status_negociacao = 'aceitou' AND NEW.cliente_pago = true) AND 
     (OLD IS NULL OR OLD.status_negociacao != 'aceitou' OR OLD.cliente_pago != true) THEN
    
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
$$;