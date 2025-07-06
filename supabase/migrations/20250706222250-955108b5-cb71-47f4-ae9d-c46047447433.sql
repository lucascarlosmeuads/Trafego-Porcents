
-- Limpar registros duplicados na tabela meta_ads_configs
DELETE FROM meta_ads_configs 
WHERE id NOT IN (
  SELECT DISTINCT ON (COALESCE(cliente_id::text, email_usuario)) id
  FROM meta_ads_configs
  ORDER BY COALESCE(cliente_id::text, email_usuario), created_at DESC
);

-- Remover a constraint antiga que estava causando problemas
ALTER TABLE meta_ads_configs DROP CONSTRAINT IF EXISTS unique_meta_ads_config;

-- Criar nova constraint mais inteligente que permite apenas 1 config por cliente OU 1 config global por gestor
ALTER TABLE meta_ads_configs ADD CONSTRAINT unique_meta_ads_config_smart 
UNIQUE (COALESCE(cliente_id, -1), CASE WHEN cliente_id IS NULL THEN email_usuario ELSE NULL END);
