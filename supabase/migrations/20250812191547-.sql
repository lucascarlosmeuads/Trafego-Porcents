-- Confirmar Emily nos gestores
INSERT INTO public.gestores (nome, email, ativo, created_at, updated_at)
VALUES ('Emily', 'emily@trafegoporcents.com', true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  ativo = EXCLUDED.ativo,
  updated_at = now();