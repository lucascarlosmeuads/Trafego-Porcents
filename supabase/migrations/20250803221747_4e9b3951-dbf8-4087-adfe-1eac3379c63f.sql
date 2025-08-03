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
    
    -- Buscar contador atual
    SELECT leads_distribuicao_controle.contador_atual INTO contador_atual
    FROM public.leads_distribuicao_controle
    LIMIT 1;
    
    -- Se não existe registro de controle, criar um
    IF contador_atual IS NULL THEN
      INSERT INTO public.leads_distribuicao_controle (contador_atual, created_at, updated_at)
      VALUES (1, now(), now());
      contador_atual := 1;
    END IF;
    
    -- Definir vendedor baseado na nova proporção:
    -- A cada 20 leads: 9 Edu (45%), 8 Itamar (40%), 3 João (15%)
    CASE contador_atual % 20
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
      contador_atual = (contador_atual % 20) + 1,
      ultima_distribuicao = now(), 
      updated_at = now();
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar distribuição manual para leads existentes usando UPDATE direto
UPDATE public.formularios_parceria
SET 
  vendedor_responsavel = CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 20 IN (1, 2, 4, 6, 9, 11, 13, 16, 18) THEN 'vendedoredu@trafegoporcents.com'
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 20 IN (3, 5, 8, 10, 12, 15, 17, 20) THEN 'vendedoritamar@trafegoporcents.com'
    WHEN ROW_NUMBER() OVER (ORDER BY created_at) % 20 IN (7, 14, 19) THEN 'vendedorjoao@trafegoporcents.com'
    ELSE 'vendedoredu@trafegoporcents.com'
  END,
  distribuido_em = now()
WHERE vendedor_responsavel IS NULL AND cliente_pago = false;

-- Inserir ou atualizar contador de controle
INSERT INTO public.leads_distribuicao_controle (contador_atual, ultima_distribuicao, created_at, updated_at)
VALUES (1, now(), now(), now())
ON CONFLICT (id) DO UPDATE SET
  contador_atual = 1,
  ultima_distribuicao = now(),
  updated_at = now();