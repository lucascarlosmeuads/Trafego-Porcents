-- Adicionar coluna de marcação por cores na tabela todos_clientes
ALTER TABLE public.todos_clientes 
ADD COLUMN cor_marcacao TEXT;

-- Adicionar constraint para validar as 5 cores permitidas
ALTER TABLE public.todos_clientes 
ADD CONSTRAINT check_cor_marcacao 
CHECK (cor_marcacao IS NULL OR cor_marcacao IN ('laranja', 'azul', 'roxo', 'verde', 'rosa'));