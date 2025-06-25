
-- Adicionar coluna para controlar se o cliente aceitou os termos
ALTER TABLE cliente_profiles 
ADD COLUMN termos_aceitos BOOLEAN DEFAULT FALSE,
ADD COLUMN data_aceite_termos TIMESTAMP WITH TIME ZONE NULL;

-- Comentário explicativo das colunas
COMMENT ON COLUMN cliente_profiles.termos_aceitos IS 'Indica se o cliente aceitou os termos de uso e condições gerais';
COMMENT ON COLUMN cliente_profiles.data_aceite_termos IS 'Data e hora em que o cliente aceitou os termos';
