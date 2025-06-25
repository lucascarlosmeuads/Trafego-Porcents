
-- Adicionar campo cliente_id na tabela meta_ads_configs para permitir configurações por cliente
ALTER TABLE public.meta_ads_configs 
ADD COLUMN cliente_id bigint;

-- Criar índice para melhor performance nas consultas por cliente
CREATE INDEX idx_meta_ads_configs_cliente_id ON public.meta_ads_configs(cliente_id);

-- Comentário para explicar o novo campo
COMMENT ON COLUMN public.meta_ads_configs.cliente_id IS 'ID do cliente específico para configurações individuais. Null = configuração global do gestor';
