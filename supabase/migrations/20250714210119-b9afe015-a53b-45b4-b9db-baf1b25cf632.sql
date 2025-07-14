-- Adicionar coluna para armazenar planejamento estratégico na tabela briefings_cliente
ALTER TABLE public.briefings_cliente 
ADD COLUMN planejamento_estrategico TEXT DEFAULT NULL;

-- Criar índice para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_briefings_cliente_planejamento 
ON public.briefings_cliente (id) 
WHERE planejamento_estrategico IS NOT NULL;