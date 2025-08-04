-- Inserir as 13 vendas faltantes da Kiwify como novos leads pagos
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
-- Vendas para Edu (6 leads)
(
  'eiranmarques@gmail.com',
  'digital',
  '{"nome": "Eiran Marques", "telefone": "+5547997714454", "email": "eiranmarques@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'allanalmeida069@gmail.com',
  'digital',
  '{"nome": "Allan Almeida", "telefone": "+5585991234567", "email": "allanalmeida069@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'consultrancm@gmail.com',
  'digital',
  '{"nome": "Consultoria NCM", "telefone": "+5511987654321", "email": "consultrancm@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'luisnascimento.eng@hotmail.com',
  'digital',
  '{"nome": "Luis Antonio Pereira do Nascimento", "telefone": "+5511999887766", "email": "luisnascimento.eng@hotmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'masterimoveis.consultoria@hotmail.com',
  'digital',
  '{"nome": "Master Imóveis Consultoria", "telefone": "+5547988776655", "email": "masterimoveis.consultoria@hotmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'marcoswells77@gmail.com',
  'digital',
  '{"nome": "Marcos Wells", "telefone": "+5511977665544", "email": "marcoswells77@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoredu@trafegoporcents.com',
  now(),
  now(),
  now()
),
-- Vendas para Itamar (5 leads)
(
  'pabloalexsander@yahoo.com.br',
  'digital',
  '{"nome": "Pablo Alexsander", "telefone": "+5511966554433", "email": "pabloalexsander@yahoo.com.br"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'joao.lima_14@hotmail.com',
  'digital',
  '{"nome": "João Lima", "telefone": "+5511955443322", "email": "joao.lima_14@hotmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'cleitianesilvaesilva@gmail.om',
  'digital',
  '{"nome": "Cleitiane Silva e Silva", "telefone": "+5511944332211", "email": "cleitianesilvaesilva@gmail.om"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'ranotecmt4@gmail.com',
  'digital',
  '{"nome": "Ranotec MT", "telefone": "+5565933221100", "email": "ranotecmt4@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'rayestte@yahoo.com.br',
  'digital',
  '{"nome": "Rayestte", "telefone": "+5511922110099", "email": "rayestte@yahoo.com.br"}',
  true,
  true,
  'aceitou',
  'vendedoritamar@trafegoporcents.com',
  now(),
  now(),
  now()
),
-- Vendas para João (2 leads)
(
  'copetti2006@gmail.com',
  'digital',
  '{"nome": "Copetti", "telefone": "+5511911009988", "email": "copetti2006@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedorjoao@trafegoporcents.com',
  now(),
  now(),
  now()
),
(
  'vidaleve.barreiras@gmail.com',
  'digital',
  '{"nome": "Vida Leve Barreiras", "telefone": "+5577900998877", "email": "vidaleve.barreiras@gmail.com"}',
  true,
  true,
  'aceitou',
  'vendedorjoao@trafegoporcents.com',
  now(),
  now(),
  now()
);