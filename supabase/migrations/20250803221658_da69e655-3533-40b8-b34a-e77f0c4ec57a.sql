-- Desabilitar temporariamente o trigger de validação
ALTER TABLE public.formularios_parceria DISABLE TRIGGER validate_partnership_form_trigger;

-- Aplicar distribuição retroativa para leads existentes sem vendedor
DO $$
DECLARE
  lead_record RECORD;
  contador INTEGER := 1;
  vendedor_email TEXT;
BEGIN
  -- Processar todos os leads sem vendedor e não pagos
  FOR lead_record IN 
    SELECT id FROM public.formularios_parceria 
    WHERE vendedor_responsavel IS NULL AND cliente_pago = false
    ORDER BY created_at ASC
  LOOP
    -- Aplicar lógica de distribuição 45% Edu, 40% Itamar, 15% João
    CASE contador % 20
      WHEN 1, 2, 4, 6, 9, 11, 13, 16, 18 THEN -- 45% Edu
        vendedor_email := 'vendedoredu@trafegoporcents.com';
      WHEN 3, 5, 8, 10, 12, 15, 17, 20 THEN -- 40% Itamar
        vendedor_email := 'vendedoritamar@trafegoporcents.com';
      WHEN 7, 14, 19 THEN -- 15% João
        vendedor_email := 'vendedorjoao@trafegoporcents.com';
      ELSE
        vendedor_email := 'vendedoredu@trafegoporcents.com';
    END CASE;
    
    -- Atualizar o lead
    UPDATE public.formularios_parceria 
    SET 
      vendedor_responsavel = vendedor_email,
      distribuido_em = now()
    WHERE id = lead_record.id;
    
    contador := contador + 1;
  END LOOP;
  
  -- Atualizar contador na tabela de controle
  INSERT INTO public.leads_distribuicao_controle (contador_atual, ultima_distribuicao, created_at, updated_at)
  VALUES ((contador % 20) + 1, now(), now(), now())
  ON CONFLICT (id) DO UPDATE SET
    contador_atual = (contador % 20) + 1,
    ultima_distribuicao = now(),
    updated_at = now();
    
  RAISE NOTICE 'Distribuição retroativa concluída. % leads processados.', contador - 1;
END $$;

-- Reabilitar o trigger de validação
ALTER TABLE public.formularios_parceria ENABLE TRIGGER validate_partnership_form_trigger;