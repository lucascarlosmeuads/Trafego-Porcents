-- Criar tabela chat_atendentes que está faltando
CREATE TABLE IF NOT EXISTS public.chat_atendentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id TEXT NOT NULL,
  email_cliente TEXT NOT NULL,
  email_atendente TEXT NOT NULL,
  pode_atender BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  designado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email_cliente, email_atendente)
);

-- Habilitar RLS
ALTER TABLE public.chat_atendentes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat_atendentes
CREATE POLICY "chat_atendentes_select_policy" ON public.chat_atendentes
FOR SELECT USING (
  auth.email() = ANY(ARRAY[
    'admin@trafegoporcents.com',
    'andreza@trafegoporcents.com',
    'carol@trafegoporcents.com'
  ]) OR 
  email_atendente = auth.email() OR 
  email_cliente = auth.email()
);

CREATE POLICY "chat_atendentes_insert_policy" ON public.chat_atendentes
FOR INSERT WITH CHECK (
  auth.email() = ANY(ARRAY[
    'admin@trafegoporcents.com',
    'andreza@trafegoporcents.com',
    'carol@trafegoporcents.com'
  ]) OR 
  email_atendente = auth.email()
);

CREATE POLICY "chat_atendentes_update_policy" ON public.chat_atendentes
FOR UPDATE USING (
  auth.email() = ANY(ARRAY[
    'admin@trafegoporcents.com',
    'andreza@trafegoporcents.com',
    'carol@trafegoporcents.com'
  ]) OR 
  email_atendente = auth.email()
);

CREATE POLICY "chat_atendentes_delete_policy" ON public.chat_atendentes
FOR DELETE USING (
  auth.email() = ANY(ARRAY[
    'admin@trafegoporcents.com',
    'andreza@trafegoporcents.com',
    'carol@trafegoporcents.com'
  ])
);