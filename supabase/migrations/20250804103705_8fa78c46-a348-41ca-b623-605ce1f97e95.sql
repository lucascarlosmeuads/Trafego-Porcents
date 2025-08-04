-- Criar tabela para clientes de parceria
CREATE TABLE public.clientes_parceria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_cliente TEXT NOT NULL UNIQUE,
  nome_cliente TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID REFERENCES public.formularios_parceria(id),
  dados_formulario JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.clientes_parceria ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem apenas seus dados
CREATE POLICY "Clientes parceria podem ver apenas seus dados" 
ON public.clientes_parceria 
FOR SELECT 
USING (email_cliente = auth.email());

-- Política para clientes atualizarem apenas seus dados
CREATE POLICY "Clientes parceria podem atualizar apenas seus dados" 
ON public.clientes_parceria 
FOR UPDATE 
USING (email_cliente = auth.email());

-- Política para gestores e admins verem todos os dados
CREATE POLICY "Gestores e admins podem ver clientes parceria" 
ON public.clientes_parceria 
FOR ALL 
USING (is_gestor_user() OR is_admin_user());

-- Política para sistema inserir novos clientes
CREATE POLICY "Sistema pode inserir clientes parceria" 
ON public.clientes_parceria 
FOR INSERT 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_clientes_parceria_updated_at
BEFORE UPDATE ON public.clientes_parceria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar cliente parceria automaticamente
CREATE OR REPLACE FUNCTION public.create_parceria_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Só processa quando lead vira "aceitou" e cliente_pago = true
  IF (NEW.status_negociacao = 'aceitou' AND NEW.cliente_pago = true) AND 
     (OLD.status_negociacao != 'aceitou' OR OLD.cliente_pago != true) THEN
    
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
$$;

-- Trigger para criar cliente parceria automaticamente
CREATE TRIGGER trigger_create_parceria_client
AFTER UPDATE ON public.formularios_parceria
FOR EACH ROW
EXECUTE FUNCTION public.create_parceria_client();