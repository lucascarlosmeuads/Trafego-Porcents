
-- Adicionar Carol na tabela gestores (com verificação mais robusta)
INSERT INTO public.gestores (
  nome,
  email,
  pode_adicionar_cliente,
  ativo,
  created_at,
  updated_at
) VALUES (
  'Carol',
  'carol@trafegoporcents.com',
  true,
  true,
  now(),
  now()
) 
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  pode_adicionar_cliente = EXCLUDED.pode_adicionar_cliente,
  ativo = EXCLUDED.ativo,
  updated_at = EXCLUDED.updated_at;

-- Verificar se Carol foi inserida corretamente
SELECT * FROM public.gestores WHERE email = 'carol@trafegoporcents.com';
