-- Inserir as 4 vendas manualmente que ficaram de fora
INSERT INTO public.formularios_parceria (
  email_usuario,
  tipo_negocio,
  respostas,
  completo,
  cliente_pago,
  status_negociacao,
  vendedor_responsavel,
  distribuido_em,
  created_at,
  updated_at
) VALUES 
(
  'amersonpereira@icloid.com',
  'digital',
  '{"nome": "Amerson Juliano Pereira", "telefone": "+5547996104629", "email": "amersonpereira@icloid.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'jamilly_oliver@hotmail.com',
  'digital', 
  '{"nome": "Jamille Olivera", "telefone": "+5511974742241", "email": "jamilly_oliver@hotmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'jhonatanhr2@hotmail.com',
  'digital',
  '{"nome": "Jhonatan ribeiro", "telefone": "+5541999885969", "email": "jhonatanhr2@hotmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com', 
  now(),
  now(),
  now()
),
(
  'gregblue.shop@gmail.com',
  'digital',
  '{"nome": "Marcelo Gregorio", "telefone": "+5511971545454", "email": "gregblue.shop@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
);