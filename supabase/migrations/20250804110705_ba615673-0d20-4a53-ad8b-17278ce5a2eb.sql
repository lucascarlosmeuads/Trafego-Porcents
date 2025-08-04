-- Função para processar leads retroativos e criar clientes parceria
CREATE OR REPLACE FUNCTION public.processar_leads_retroativos()
RETURNS TABLE(
  leads_processados INTEGER,
  clientes_criados INTEGER,
  usuarios_auth_criados INTEGER,
  detalhes JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  lead_record RECORD;
  clientes_inseridos INTEGER := 0;
  total_leads INTEGER := 0;
  usuarios_criados INTEGER := 0;
  detalhes_resultado JSONB := '[]'::jsonb;
BEGIN
  -- Buscar todos os leads que estão "aceitou" e "cliente_pago" mas não têm cliente parceria
  FOR lead_record IN 
    SELECT f.* FROM public.formularios_parceria f
    LEFT JOIN public.clientes_parceria cp ON cp.email_cliente = f.email_usuario
    WHERE f.status_negociacao = 'aceitou' 
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
$$;

-- Executar a função para processar leads retroativos
SELECT * FROM public.processar_leads_retroativos();