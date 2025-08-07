-- Corrigir CHECK CONSTRAINT para permitir 'pendente' e outros status válidos
-- Primeiro, remover o constraint existente
ALTER TABLE public.formularios_parceria DROP CONSTRAINT IF EXISTS formularios_parceria_status_negociacao_check;

-- Criar novo constraint permitindo todos os valores necessários incluindo 'pendente'
ALTER TABLE public.formularios_parceria ADD CONSTRAINT formularios_parceria_status_negociacao_check 
CHECK (status_negociacao IN ('pendente', 'lead', 'comprou', 'recusou', 'planejando', 'planejamento_entregue', 'upsell_pago'));

-- Atualizar qualquer registro com status NULL para 'pendente' (padrão)
UPDATE public.formularios_parceria 
SET status_negociacao = 'pendente' 
WHERE status_negociacao IS NULL;