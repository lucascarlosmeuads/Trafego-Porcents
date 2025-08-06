-- Migração para atualizar status dos leads de parceria
-- Passo 1: Remover a constraint antiga
ALTER TABLE public.formularios_parceria 
DROP CONSTRAINT formularios_parceria_status_negociacao_check;

-- Passo 2: Atualizar registros existentes
UPDATE public.formularios_parceria 
SET status_negociacao = CASE 
  WHEN status_negociacao = 'pendente' THEN 'lead'
  WHEN status_negociacao = 'aceitou' THEN 'comprou'
  WHEN status_negociacao = 'pensando' THEN 'planejando'
  ELSE status_negociacao
END
WHERE status_negociacao IN ('pendente', 'aceitou', 'pensando');

-- Passo 3: Adicionar nova constraint com os novos valores
ALTER TABLE public.formularios_parceria 
ADD CONSTRAINT formularios_parceria_status_negociacao_check 
CHECK (status_negociacao = ANY (ARRAY['lead'::text, 'comprou'::text, 'recusou'::text, 'planejando'::text, 'planejamento_entregue'::text, 'upsell_pago'::text]));