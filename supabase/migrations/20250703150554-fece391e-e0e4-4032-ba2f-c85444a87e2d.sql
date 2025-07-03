
-- Adicionar campo para data de cadastro personalizada
ALTER TABLE public.todos_clientes 
ADD COLUMN data_cadastro_desejada timestamp with time zone;

-- Adicionar campo para origem do cadastro
ALTER TABLE public.todos_clientes 
ADD COLUMN origem_cadastro text DEFAULT 'venda';

-- Atualizar todos os registros existentes para 'venda' (compatibilidade)
UPDATE public.todos_clientes 
SET origem_cadastro = 'venda' 
WHERE origem_cadastro IS NULL;

-- Criar índice para performance nas consultas
CREATE INDEX idx_todos_clientes_origem_cadastro ON public.todos_clientes(origem_cadastro);

-- Adicionar constraint para garantir valores válidos
ALTER TABLE public.todos_clientes 
ADD CONSTRAINT check_origem_cadastro 
CHECK (origem_cadastro IN ('venda', 'admin'));

-- Comentários para documentação
COMMENT ON COLUMN public.todos_clientes.data_cadastro_desejada IS 'Data e hora personalizada para quando o cliente deve aparecer como cadastrado';
COMMENT ON COLUMN public.todos_clientes.origem_cadastro IS 'Origem do cadastro: venda (conta nas métricas) ou admin (não conta)';
