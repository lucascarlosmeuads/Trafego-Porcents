-- Adicionar colunas na tabela formularios_parceria
ALTER TABLE public.formularios_parceria 
ADD COLUMN vendedor_responsavel TEXT,
ADD COLUMN distribuido_em TIMESTAMP WITH TIME ZONE;

-- Criar tabela para controle da distribuição
CREATE TABLE public.leads_distribuicao_controle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contador_atual INTEGER NOT NULL DEFAULT 1,
  ultima_distribuicao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir registro inicial
INSERT INTO public.leads_distribuicao_controle (contador_atual) VALUES (1);

-- Habilitar RLS na nova tabela
ALTER TABLE public.leads_distribuicao_controle ENABLE ROW LEVEL SECURITY;

-- Política de acesso para controle de distribuição (apenas admins)
CREATE POLICY "Admin access only for leads distribution control" 
ON public.leads_distribuicao_controle 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Função para distribuir leads automaticamente
CREATE OR REPLACE FUNCTION public.distribuir_novo_lead()
RETURNS TRIGGER AS $$
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
    
    -- Definir vendedor baseado na posição do contador
    -- Sequência: 3 para Edu, 2 para Itamar, 1 para João
    CASE 
      WHEN contador_atual IN (1, 2, 3) THEN
        vendedor_email := 'vendedoredu@trafegoporcents.com';
      WHEN contador_atual IN (4, 5) THEN
        vendedor_email := 'vendedoritamar@trafegoporcents.com';
      WHEN contador_atual = 6 THEN
        vendedor_email := 'vendedorjoao@trafegoporcents.com';
    END CASE;
    
    -- Atualizar o lead com vendedor
    NEW.vendedor_responsavel := vendedor_email;
    NEW.distribuido_em := now();
    
    -- Incrementar contador ou resetar
    IF contador_atual >= 6 THEN
      UPDATE public.leads_distribuicao_controle 
      SET contador_atual = 1, ultima_distribuicao = now(), updated_at = now();
    ELSE
      UPDATE public.leads_distribuicao_controle 
      SET contador_atual = contador_atual + 1, ultima_distribuicao = now(), updated_at = now();
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para distribuição automática
CREATE TRIGGER trigger_distribuir_novo_lead
  BEFORE INSERT ON public.formularios_parceria
  FOR EACH ROW
  EXECUTE FUNCTION public.distribuir_novo_lead();

-- Trigger para updated_at na tabela de controle
CREATE TRIGGER update_leads_distribuicao_controle_updated_at
  BEFORE UPDATE ON public.leads_distribuicao_controle
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índice para performance
CREATE INDEX idx_formularios_parceria_vendedor_responsavel 
ON public.formularios_parceria(vendedor_responsavel);

-- Comentários para documentação
COMMENT ON COLUMN public.formularios_parceria.vendedor_responsavel IS 'Email do vendedor responsável pelo lead';
COMMENT ON COLUMN public.formularios_parceria.distribuido_em IS 'Timestamp de quando o lead foi distribuído';
COMMENT ON TABLE public.leads_distribuicao_controle IS 'Controla a rotação de distribuição de leads para vendedores';