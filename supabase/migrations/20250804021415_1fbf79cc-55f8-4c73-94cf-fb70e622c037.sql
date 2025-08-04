-- CORREÇÃO DEFINITIVA: CRIAR 25 LEADS REAIS DO KIWIFY
-- Resetar todos os leads pagos e criar apenas os 25 leads reais da lista fornecida

-- 1. RESETAR TODOS OS LEADS PAGOS
UPDATE public.formularios_parceria 
SET 
  cliente_pago = false,
  status_negociacao = 'pendente',
  updated_at = now()
WHERE cliente_pago = true;

-- 2. DELETAR LEADS DUPLICADOS SE EXISTIREM (para evitar conflitos)
DELETE FROM public.formularios_parceria 
WHERE email_usuario IN (
  'fred.med85@hotmail.com',
  'luiziensen22@gmail.com',
  'kuesley@playservicos.com.br',
  'gregblue.shop@gmail.com',
  'jhonatanhr2@hotmail.com',
  'jamilly_oliver@hotmail.com',
  'amersonpereira@icloid.com',
  'eiranmarques@gmail.com',
  'allanalmeida069@gmail.com',
  'silasdigital10@gmail.com',
  'pabloalexsander@yahoo.com.br',
  'joao.lima_14@hotmail.com',
  'consultrancm@gmail.com',
  'luisnascimento.eng@hotmail.com',
  'mrssp1308@gmail.com',
  'cleitianesilvaesilva@gmail.om',
  'ranotecmt4@gmail.com',
  'masterimoveis.consultoria@hotmail.com',
  'marcoswells77@gmail.com',
  'lucasbritocorretor87@gmail.com',
  'rayestte@yahoo.com.br',
  'copetti2006@gmail.com',
  'vidaleve.barreiras@gmail.com',
  'nelsolar.nelsolar@outlook.com',
  'franciscomilhas1987@yahoo.com',
  'nilvanandrade@hotmail.com',
  'eliel.estudio@gmail.com',
  'dinizcorretorslz@gmail.com'
);

-- 3. CRIAR OS 25 LEADS REAIS - DIA 02/08/2025 (5 vendas)
INSERT INTO public.formularios_parceria (
  email_usuario,
  tipo_negocio,
  cliente_pago,
  status_negociacao,
  created_at,
  updated_at,
  completo,
  respostas
) VALUES
('nelsolar.nelsolar@outlook.com', 'service', true, 'aceitou', '2025-08-02 23:51:59-03:00', now(), true, '{"nome": "Nelrisvan Moreira de Sousa", "telefone": "+5589994033195"}'::jsonb),
('franciscomilhas1987@yahoo.com', 'service', true, 'aceitou', '2025-08-02 22:23:07-03:00', now(), true, '{"nome": "Francisco Eugenio Martoni Mendes de Andrada", "telefone": "+5532998336783"}'::jsonb),
('nilvanandrade@hotmail.com', 'service', true, 'aceitou', '2025-08-02 21:46:52-03:00', now(), true, '{"nome": "Nilvan Andrade De Freitas", "telefone": "+5587991887330"}'::jsonb),
('eliel.estudio@gmail.com', 'service', true, 'aceitou', '2025-08-02 15:38:55-03:00', now(), true, '{"nome": "Eliel Camilo da Silva", "telefone": "+5519992927446"}'::jsonb),
('dinizcorretorslz@gmail.com', 'service', true, 'aceitou', '2025-08-02 13:48:06-03:00', now(), true, '{"nome": "Jossenilson Diniz Alves", "telefone": "+5598985605727"}'::jsonb);

-- 4. CRIAR OS 20 LEADS REAIS - DIA 03/08/2025 (20 vendas)
INSERT INTO public.formularios_parceria (
  email_usuario,
  tipo_negocio,
  cliente_pago,
  status_negociacao,
  created_at,
  updated_at,
  completo,
  respostas
) VALUES
('fred.med85@hotmail.com', 'service', true, 'aceitou', '2025-08-03 22:47:19-03:00', now(), true, '{"nome": "Frederico Campos de Oliveira", "telefone": "+5511961450058"}'::jsonb),
('luiziensen22@gmail.com', 'service', true, 'aceitou', '2025-08-03 21:53:17-03:00', now(), true, '{"nome": "Luiz Alberto de Almeida iensen", "telefone": "+5542999600107"}'::jsonb),
('kuesley@playservicos.com.br', 'service', true, 'aceitou', '2025-08-03 21:12:47-03:00', now(), true, '{"nome": "Kuesley Fernandes do Nascimento", "telefone": "+5567991360075"}'::jsonb),
('gregblue.shop@gmail.com', 'service', true, 'aceitou', '2025-08-03 20:34:32-03:00', now(), true, '{"nome": "Marcelo Gregorio", "telefone": "+5511971545454"}'::jsonb),
('jhonatanhr2@hotmail.com', 'service', true, 'aceitou', '2025-08-03 20:17:05-03:00', now(), true, '{"nome": "Jhonatan ribeiro", "telefone": "+5541999885969"}'::jsonb),
('jamilly_oliver@hotmail.com', 'service', true, 'aceitou', '2025-08-03 20:10:05-03:00', now(), true, '{"nome": "Jamille Olivera", "telefone": "+5511974742241"}'::jsonb),
('amersonpereira@icloid.com', 'service', true, 'aceitou', '2025-08-03 19:35:23-03:00', now(), true, '{"nome": "Amerson Juliano Pereira", "telefone": "+5547996104629"}'::jsonb),
('eiranmarques@gmail.com', 'service', true, 'aceitou', '2025-08-03 18:29:45-03:00', now(), true, '{"nome": "Eiran Marques", "telefone": "+5581971110000"}'::jsonb),
('allanalmeida069@gmail.com', 'service', true, 'aceitou', '2025-08-03 18:22:56-03:00', now(), true, '{"nome": "Allan Andrade", "telefone": "+5563991378924"}'::jsonb),
('silasdigital10@gmail.com', 'service', true, 'aceitou', '2025-08-03 18:22:48-03:00', now(), true, '{"nome": "Rosilei Antonio Antunes", "telefone": "+5551995394151"}'::jsonb),
('pabloalexsander@yahoo.com.br', 'service', true, 'aceitou', '2025-08-03 17:56:47-03:00', now(), true, '{"nome": "Pablo alexsander de souza pereira", "telefone": "+5598992320069"}'::jsonb),
('joao.lima_14@hotmail.com', 'service', true, 'aceitou', '2025-08-03 17:32:15-03:00', now(), true, '{"nome": "João pedro de lima pereira", "telefone": "+5524974056982"}'::jsonb),
('consultrancm@gmail.com', 'service', true, 'aceitou', '2025-08-03 17:03:20-03:00', now(), true, '{"nome": "Marcos willian", "telefone": "+5544991127978"}'::jsonb),
('luisnascimento.eng@hotmail.com', 'service', true, 'aceitou', '2025-08-03 16:13:03-03:00', now(), true, '{"nome": "Luis Antonio Pereira do Nascimento", "telefone": "+5566999055524"}'::jsonb),
('mrssp1308@gmail.com', 'service', true, 'aceitou', '2025-08-03 14:48:44-03:00', now(), true, '{"nome": "Marcos Roberto silva", "telefone": "+5562992812867"}'::jsonb),
('cleitianesilvaesilva@gmail.om', 'service', true, 'aceitou', '2025-08-03 14:31:08-03:00', now(), true, '{"nome": "Cleitiane da Silva e Silva", "telefone": "+5591991867728"}'::jsonb),
('ranotecmt4@gmail.com', 'service', true, 'aceitou', '2025-08-03 14:15:10-03:00', now(), true, '{"nome": "Ranover Alves Rodrigues", "telefone": "+5565984052592"}'::jsonb),
('masterimoveis.consultoria@hotmail.com', 'service', true, 'aceitou', '2025-08-03 13:47:20-03:00', now(), true, '{"nome": "fabiano oliveira", "telefone": "+5584999382895"}'::jsonb),
('marcoswells77@gmail.com', 'service', true, 'aceitou', '2025-08-03 12:36:44-03:00', now(), true, '{"nome": "Marcos Wellington da silva", "telefone": "+5541997892000"}'::jsonb),
('lucasbritocorretor87@gmail.com', 'service', true, 'aceitou', '2025-08-03 11:26:08-03:00', now(), true, '{"nome": "Lucas Brito", "telefone": "+5585986043622"}'::jsonb);

-- 5. INSERIR OS LEADS RESTANTES DO DIA 03/08
INSERT INTO public.formularios_parceria (
  email_usuario,
  tipo_negocio,
  cliente_pago,
  status_negociacao,
  created_at,
  updated_at,
  completo,
  respostas
) VALUES
('rayestte@yahoo.com.br', 'service', true, 'aceitou', '2025-08-03 09:47:04-03:00', now(), true, '{"nome": "RAYESTTE Ferreira bruno braga", "telefone": "+5531988998780"}'::jsonb),
('copetti2006@gmail.com', 'service', true, 'aceitou', '2025-08-03 07:46:06-03:00', now(), true, '{"nome": "Luis Copetti", "telefone": "+5555999578900"}'::jsonb),
('vidaleve.barreiras@gmail.com', 'service', true, 'aceitou', '2025-08-03 07:24:46-03:00', now(), true, '{"nome": "Vidalevebarreiras", "telefone": "+5577990718683"}'::jsonb);