
-- Adicionar coluna valor_venda_inicial na tabela todos_clientes
ALTER TABLE public.todos_clientes 
ADD COLUMN valor_venda_inicial NUMERIC;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.todos_clientes.valor_venda_inicial IS 'Valor inicial da venda do cliente em reais';
