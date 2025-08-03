-- Função para distribuir leads existentes sem trigger de validação
CREATE OR REPLACE FUNCTION public.aplicar_distribuicao_retroativa()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  lead_record RECORD;
  contador INTEGER := 1;
  vendedor_email TEXT;
BEGIN
  -- Listar triggers existentes que podem interferir
  PERFORM pg_notify('debug', 'Iniciando distribuição retroativa');
  
  -- Processar todos os leads sem vendedor e não pagos
  FOR lead_record IN 
    SELECT id FROM public.formularios_parceria 
    WHERE vendedor_responsavel IS NULL AND cliente_pago = false
    ORDER BY created_at ASC
  LOOP
    -- Aplicar lógica de distribuição 45% Edu, 40% Itamar, 15% João
    CASE (contador - 1) % 20 + 1
      WHEN 1, 2, 4, 6, 9, 11, 13, 16, 18 THEN -- 45% Edu
        vendedor_email := 'vendedoredu@trafegoporcents.com';
      WHEN 3, 5, 8, 10, 12, 15, 17, 20 THEN -- 40% Itamar
        vendedor_email := 'vendedoritamar@trafegoporcents.com';
      WHEN 7, 14, 19 THEN -- 15% João
        vendedor_email := 'vendedorjoao@trafegoporcents.com';
      ELSE
        vendedor_email := 'vendedoredu@trafegoporcents.com';
    END CASE;
    
    -- Atualizar apenas as colunas necessárias, evitando triggers
    UPDATE public.formularios_parceria 
    SET 
      vendedor_responsavel = vendedor_email,
      distribuido_em = now(),
      updated_at = now()
    WHERE id = lead_record.id
      AND vendedor_responsavel IS NULL 
      AND cliente_pago = false;
    
    contador := contador + 1;
  END LOOP;
  
  -- Atualizar contador na tabela de controle
  INSERT INTO public.leads_distribuicao_controle (contador_atual, ultima_distribuicao, created_at, updated_at)
  VALUES (contador, now(), now(), now())
  ON CONFLICT (id) DO UPDATE SET
    contador_atual = contador,
    ultima_distribuicao = now(),
    updated_at = now();
    
  PERFORM pg_notify('debug', format('Distribuição retroativa concluída. %s leads processados.', contador - 1));
END;
$function$;