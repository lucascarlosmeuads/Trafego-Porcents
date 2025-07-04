
-- Adicionar novos campos na tabela todos_clientes
ALTER TABLE public.todos_clientes 
ADD COLUMN IF NOT EXISTS comissao_confirmada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS site_descricao_personalizada text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_todos_clientes_comissao_confirmada ON public.todos_clientes(comissao_confirmada);

-- Comentários para documentação
COMMENT ON COLUMN public.todos_clientes.comissao_confirmada IS 'Indica se o cliente confirmou o valor da comissão';
COMMENT ON COLUMN public.todos_clientes.site_descricao_personalizada IS 'Descrição personalizada de como o cliente deseja o site';
