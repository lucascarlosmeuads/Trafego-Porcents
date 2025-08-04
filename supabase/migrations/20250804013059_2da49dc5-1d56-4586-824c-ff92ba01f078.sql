-- Deletar os 13 leads duplicados adicionados por engano
DELETE FROM public.formularios_parceria 
WHERE email_usuario IN (
  'pabloalexsander@yahoo.com.br',
  'marcoswells77@gmail.com',
  'consultrancm@gmail.com',
  'cleitianesilvaesilva@gmail.om',
  'vidaleve.barreiras@gmail.com',
  'copetti2006@gmail.com',
  'rayestte@yahoo.com.br',
  'ranotecmt4@gmail.com',
  'joao.lima_14@hotmail.com',
  'masterimoveis.consultoria@hotmail.com',
  'luisnascimento.eng@hotmail.com',
  'eiranmarques@gmail.com',
  'allanalmeida069@gmail.com'
);

-- Verificar quantos leads restam
-- SELECT COUNT(*) as total_leads_restantes 
-- FROM public.formularios_parceria;