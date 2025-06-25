
-- Adicionar campo para controlar rejeição dos termos
ALTER TABLE public.cliente_profiles 
ADD COLUMN termos_rejeitados boolean DEFAULT false;

-- Adicionar campo para data de rejeição
ALTER TABLE public.cliente_profiles 
ADD COLUMN data_rejeicao_termos timestamp with time zone DEFAULT NULL;
