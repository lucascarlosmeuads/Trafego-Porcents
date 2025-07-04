
-- Remover a constraint problemática que está causando o erro com ON CONFLICT
ALTER TABLE meta_ads_configs 
DROP CONSTRAINT IF EXISTS unique_cliente_gestor_config;

-- Remover também o índice único parcial que pode estar conflitando
DROP INDEX IF EXISTS idx_unique_admin_global_config;

-- Criar uma constraint única normal (não deferrable) que permitirá o ON CONFLICT funcionar
ALTER TABLE meta_ads_configs 
ADD CONSTRAINT unique_meta_ads_config 
UNIQUE (cliente_id, email_usuario);

-- Criar índice para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_meta_ads_configs_lookup 
ON meta_ads_configs (email_usuario, cliente_id);

-- Verificar se a função RPC ainda existe e está funcionando
-- (ela deve continuar funcionando normalmente com a nova constraint)
