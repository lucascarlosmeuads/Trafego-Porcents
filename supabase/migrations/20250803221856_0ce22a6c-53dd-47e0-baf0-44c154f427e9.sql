-- Corrigir a função de distribuição para proporções 45% Edu, 40% Itamar, 15% João
CREATE OR REPLACE FUNCTION public.distribuir_novo_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  contador_atual INTEGER;
  vendedor_email TEXT;
BEGIN
  -- Só distribui se o lead não tem vendedor e não está pago
  IF NEW.vendedor_responsavel IS NULL AND NEW.cliente_pago = false THEN
    
    -- Buscar contador atual ou criar se não existir
    SELECT contador_atual INTO contador_atual
    FROM public.leads_distribuicao_controle
    LIMIT 1;
    
    IF contador_atual IS NULL THEN
      INSERT INTO public.leads_distribuicao_controle (contador_atual, created_at, updated_at)
      VALUES (1, now(), now());
      contador_atual := 1;
    END IF;
    
    -- Definir vendedor baseado na nova proporção:
    -- A cada 20 leads: 9 Edu (45%), 8 Itamar (40%), 3 João (15%)
    CASE (contador_atual - 1) % 20 + 1
      WHEN 1, 2, 4, 6, 9, 11, 13, 16, 18 THEN -- 9 posições para Edu (45%)
        vendedor_email := 'vendedoredu@trafegoporcents.com';
      WHEN 3, 5, 8, 10, 12, 15, 17, 20 THEN -- 8 posições para Itamar (40%)
        vendedor_email := 'vendedoritamar@trafegoporcents.com';
      WHEN 7, 14, 19 THEN -- 3 posições para João (15%)
        vendedor_email := 'vendedorjoao@trafegoporcents.com';
      ELSE -- Fallback para Edu
        vendedor_email := 'vendedoredu@trafegoporcents.com';
    END CASE;
    
    -- Atualizar o lead com vendedor
    NEW.vendedor_responsavel := vendedor_email;
    NEW.distribuido_em := now();
    
    -- Incrementar contador
    UPDATE public.leads_distribuicao_controle 
    SET 
      contador_atual = contador_atual + 1,
      ultima_distribuicao = now(), 
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Função para distribuir leads existentes
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
  VALUES (contador, now(), now(), now())
  ON CONFLICT (id) DO UPDATE SET
    contador_atual = contador,
    ultima_distribuicao = now(),
    updated_at = now();
    
  RAISE NOTICE 'Distribuição retroativa concluída. % leads processados.', contador - 1;
END;
$function$;

-- Executar distribuição retroativa
SELECT public.aplicar_distribuicao_retroativa();