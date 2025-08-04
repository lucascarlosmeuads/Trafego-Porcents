-- Correção completa dos leads: 5 vendas de 02/08/2025 + 19 vendas de 03/08/2025
-- Primeiro, resetar todos os leads atuais
UPDATE public.formularios_parceria 
SET cliente_pago = false, status_negociacao = 'pendente'
WHERE cliente_pago = true;

-- Inserir as 5 vendas de 02/08/2025
INSERT INTO public.formularios_parceria (
  id, created_at, updated_at, email_usuario, tipo_negocio, 
  cliente_pago, status_negociacao, vendedor_responsavel, distribuido_em, completo, respostas
) VALUES
-- Venda 1: 02/08/2025 23:51:59
(gen_random_uuid(), '2025-08-02 23:51:59-03', now(), 'nelsolar.nelsolar@outlook.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-02 23:51:59-03', true, '{"nome": "Nelrisvan Moreira de Sousa", "telefone": "+5589994033195", "valor_medio_produto": 500}'),

-- Venda 2: 02/08/2025 22:23:07
(gen_random_uuid(), '2025-08-02 22:23:07-03', now(), 'franciscomilhas1987@yahoo.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-02 22:23:07-03', true, '{"nome": "Francisco Eugenio Martoni Mendes de Andrada", "telefone": "+5532998336783", "valor_medio_produto": 500}'),

-- Venda 3: 02/08/2025 21:46:52 (Nilvan - apenas uma entrada)
(gen_random_uuid(), '2025-08-02 21:46:52-03', now(), 'nilvanandrade@hotmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-02 21:46:52-03', true, '{"nome": "Nilvan Andrade De Freitas", "telefone": "+5587991887330", "valor_medio_produto": 500}'),

-- Venda 4: 02/08/2025 15:38:55
(gen_random_uuid(), '2025-08-02 15:38:55-03', now(), 'eliel.estudio@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-02 15:38:55-03', true, '{"nome": "Eliel Camilo da Silva", "telefone": "+5519992927446", "valor_medio_produto": 500}'),

-- Venda 5: 02/08/2025 13:48:06
(gen_random_uuid(), '2025-08-02 13:48:06-03', now(), 'dinizcorretorslz@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-02 13:48:06-03', true, '{"nome": "Jossenilson Diniz Alves", "telefone": "+5598985605727", "valor_medio_produto": 500}');

-- Inserir as 19 vendas de 03/08/2025
INSERT INTO public.formularios_parceria (
  id, created_at, updated_at, email_usuario, tipo_negocio, 
  cliente_pago, status_negociacao, vendedor_responsavel, distribuido_em, completo, respostas
) VALUES
-- Venda 1: 03/08/2025 21:53:17
(gen_random_uuid(), '2025-08-03 21:53:17-03', now(), 'luiziensen22@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 21:53:17-03', true, '{"nome": "Luiz Alberto de Almeida iensen", "telefone": "+5542999600107", "valor_medio_produto": 500}'),

-- Venda 2: 03/08/2025 21:12:47
(gen_random_uuid(), '2025-08-03 21:12:47-03', now(), 'kuesley@playservicos.com.br', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 21:12:47-03', true, '{"nome": "Kuesley Fernandes do Nascimento", "telefone": "+5567991360075", "valor_medio_produto": 500}'),

-- Venda 3: 03/08/2025 20:34:32
(gen_random_uuid(), '2025-08-03 20:34:32-03', now(), 'gregblue.shop@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 20:34:32-03', true, '{"nome": "Marcelo Gregorio", "telefone": "+5511971545454", "valor_medio_produto": 500}'),

-- Venda 4: 03/08/2025 20:17:05
(gen_random_uuid(), '2025-08-03 20:17:05-03', now(), 'jhonatanhr2@hotmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 20:17:05-03', true, '{"nome": "Jhonatan ribeiro", "telefone": "+5541999885969", "valor_medio_produto": 500}'),

-- Venda 5: 03/08/2025 20:10:05
(gen_random_uuid(), '2025-08-03 20:10:05-03', now(), 'jamilly_oliver@hotmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 20:10:05-03', true, '{"nome": "Jamille Olivera", "telefone": "+5511974742241", "valor_medio_produto": 500}'),

-- Venda 6: 03/08/2025 19:35:23
(gen_random_uuid(), '2025-08-03 19:35:23-03', now(), 'amersonpereira@icloid.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 19:35:23-03', true, '{"nome": "Amerson Juliano Pereira", "telefone": "+5547996104629", "valor_medio_produto": 500}'),

-- Venda 7: 03/08/2025 18:29:45
(gen_random_uuid(), '2025-08-03 18:29:45-03', now(), 'eiranmarques@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 18:29:45-03', true, '{"nome": "Eiran Marques", "telefone": "+5581971110000", "valor_medio_produto": 500}'),

-- Venda 8: 03/08/2025 18:22:56
(gen_random_uuid(), '2025-08-03 18:22:56-03', now(), 'allanalmeida069@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 18:22:56-03', true, '{"nome": "Allan Andrade", "telefone": "+5563991378924", "valor_medio_produto": 500}'),

-- Venda 9: 03/08/2025 18:22:48
(gen_random_uuid(), '2025-08-03 18:22:48-03', now(), 'silasdigital10@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 18:22:48-03', true, '{"nome": "Rosilei Antonio Antunes", "telefone": "+5551995394151", "valor_medio_produto": 500}'),

-- Venda 10: 03/08/2025 17:56:47
(gen_random_uuid(), '2025-08-03 17:56:47-03', now(), 'pabloalexsander@yahoo.com.br', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 17:56:47-03', true, '{"nome": "Pablo alexsander de souza pereira", "telefone": "+5598992320069", "valor_medio_produto": 500}'),

-- Venda 11: 03/08/2025 17:32:15
(gen_random_uuid(), '2025-08-03 17:32:15-03', now(), 'joao.lima_14@hotmail.com', 'service', true, 'aceitou', 'vendedorjoao@trafegoporcents.com', '2025-08-03 17:32:15-03', true, '{"nome": "João pedro de lima pereira", "telefone": "+5524974056982", "valor_medio_produto": 500}'),

-- Venda 12: 03/08/2025 17:03:20
(gen_random_uuid(), '2025-08-03 17:03:20-03', now(), 'consultrancm@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 17:03:20-03', true, '{"nome": "Marcos willian", "telefone": "+5544991127978", "valor_medio_produto": 500}'),

-- Venda 13: 03/08/2025 16:13:03
(gen_random_uuid(), '2025-08-03 16:13:03-03', now(), 'luisnascimento.eng@hotmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 16:13:03-03', true, '{"nome": "Luis Antonio Pereira do Nascimento", "telefone": "+5566999055524", "valor_medio_produto": 500}'),

-- Venda 14: 03/08/2025 14:48:44
(gen_random_uuid(), '2025-08-03 14:48:44-03', now(), 'mrssp1308@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 14:48:44-03', true, '{"nome": "Marcos Roberto silva", "telefone": "+5562992812867", "valor_medio_produto": 500}'),

-- Venda 15: 03/08/2025 14:31:08 (email corrigido: .com em vez de .om)
(gen_random_uuid(), '2025-08-03 14:31:08-03', now(), 'cleitianesilvaesilva@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 14:31:08-03', true, '{"nome": "Cleitiane da Silva e Silva", "telefone": "+5591991867728", "valor_medio_produto": 500}'),

-- Venda 16: 03/08/2025 14:15:10
(gen_random_uuid(), '2025-08-03 14:15:10-03', now(), 'ranotecmt4@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 14:15:10-03', true, '{"nome": "Ranover Alves Rodrigues", "telefone": "+5565984052592", "valor_medio_produto": 500}'),

-- Venda 17: 03/08/2025 13:47:20
(gen_random_uuid(), '2025-08-03 13:47:20-03', now(), 'masterimoveis.consultoria@hotmail.com', 'service', true, 'aceitou', 'vendedorjoao@trafegoporcents.com', '2025-08-03 13:47:20-03', true, '{"nome": "fabiano oliveira", "telefone": "+5584999382895", "valor_medio_produto": 500}'),

-- Venda 18: 03/08/2025 12:36:44
(gen_random_uuid(), '2025-08-03 12:36:44-03', now(), 'marcoswells77@gmail.com', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 12:36:44-03', true, '{"nome": "Marcos Wellington da silva", "telefone": "+5541997892000", "valor_medio_produto": 500}'),

-- Venda 19: 03/08/2025 11:26:08 (Lucas Brito - apenas uma entrada)
(gen_random_uuid(), '2025-08-03 11:26:08-03', now(), 'lucasbritocorretor87@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 11:26:08-03', true, '{"nome": "Lucas Brito", "telefone": "+5585986043622", "valor_medio_produto": 500}');

-- Inserir vendas restantes de 03/08/2025
INSERT INTO public.formularios_parceria (
  id, created_at, updated_at, email_usuario, tipo_negocio, 
  cliente_pago, status_negociacao, vendedor_responsavel, distribuido_em, completo, respostas
) VALUES
-- Venda 20: 03/08/2025 09:47:04
(gen_random_uuid(), '2025-08-03 09:47:04-03', now(), 'rayestte@yahoo.com.br', 'service', true, 'aceitou', 'vendedoritamar@trafegoporcents.com', '2025-08-03 09:47:04-03', true, '{"nome": "RAYESTTE Ferreira bruno braga", "telefone": "+5531988998780", "valor_medio_produto": 500}'),

-- Venda 21: 03/08/2025 07:46:06
(gen_random_uuid(), '2025-08-03 07:46:06-03', now(), 'copetti2006@gmail.com', 'service', true, 'aceitou', 'vendedoredu@trafegoporcents.com', '2025-08-03 07:46:06-03', true, '{"nome": "Luis Copetti", "telefone": "+5555999578900", "valor_medio_produto": 500}'),

-- Venda 22: 03/08/2025 07:24:46
(gen_random_uuid(), '2025-08-03 07:24:46-03', now(), 'vidaleve.barreiras@gmail.com', 'service', true, 'aceitou', 'vendedorjoao@trafegoporcents.com', '2025-08-03 07:24:46-03', true, '{"nome": "Vidalevebarreiras", "telefone": "+5577990718683", "valor_medio_produto": 500}');

-- Atualizar contador de distribuição
INSERT INTO public.leads_distribuicao_controle (contador_atual, ultima_distribuicao, created_at, updated_at)
VALUES (4, now(), now(), now())
ON CONFLICT (id) DO UPDATE SET
  contador_atual = 4,
  ultima_distribuicao = now(),
  updated_at = now();