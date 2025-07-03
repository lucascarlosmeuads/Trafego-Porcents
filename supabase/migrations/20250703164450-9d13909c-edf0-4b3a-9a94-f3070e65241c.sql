
-- Primeiro, vamos limpar registros duplicados existentes
DELETE FROM meta_ads_configs 
WHERE id NOT IN (
  SELECT DISTINCT ON (cliente_id, email_usuario) id
  FROM meta_ads_configs 
  WHERE cliente_id IS NOT NULL
  ORDER BY cliente_id, email_usuario, created_at DESC
);

-- Adicionar constraint única para evitar duplicatas futuras
ALTER TABLE meta_ads_configs 
ADD CONSTRAINT unique_cliente_email_config 
UNIQUE (cliente_id, email_usuario);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_meta_ads_configs_cliente_email 
ON meta_ads_configs (cliente_id, email_usuario) 
WHERE cliente_id IS NOT NULL;
