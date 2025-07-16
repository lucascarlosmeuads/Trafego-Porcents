-- Adicionar campo copy_id para identificar qual copy específica gerou a imagem
ALTER TABLE criativos_gerados 
ADD COLUMN copy_id text;