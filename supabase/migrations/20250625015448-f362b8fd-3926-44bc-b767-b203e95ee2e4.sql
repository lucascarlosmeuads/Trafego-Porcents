
-- Adicionar campos para as novas perguntas no formulário de briefing
ALTER TABLE public.briefings_cliente 
ADD COLUMN forma_pagamento text DEFAULT NULL;

ALTER TABLE public.briefings_cliente 
ADD COLUMN tipo_prestacao_servico text DEFAULT NULL;

ALTER TABLE public.briefings_cliente 
ADD COLUMN localizacao_divulgacao text DEFAULT NULL;
