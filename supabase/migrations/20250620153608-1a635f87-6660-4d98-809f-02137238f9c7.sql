
-- Adicionar coluna link_campanha na tabela todos_clientes
ALTER TABLE public.todos_clientes 
ADD COLUMN link_campanha text;

-- Comentário para documentar a nova coluna
COMMENT ON COLUMN public.todos_clientes.link_campanha IS 'Link para acompanhar a campanha do cliente';
