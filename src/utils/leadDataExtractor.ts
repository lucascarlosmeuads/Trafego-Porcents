// Função utilitária para extrair dados de leads de forma robusta
export interface ExtractedLeadData {
  nome: string;
  email: string;
  whatsapp: string;
  produtoDescricao: string;
  valorMedio: string;
  tipoNegocio: string;
  jaTevVendas: string;
}

export function extractLeadData(lead: any): ExtractedLeadData {
  const respostas = lead.respostas || {};
  const dadosPersonais = respostas.dadosPersonais || {};
  const negocio = respostas.negocio || {};
  
  // Extração robusta do nome
  const nome = 
    dadosPersonais.nome ||
    respostas.nome ||
    respostas.nomeCompleto ||
    lead.nome ||
    'Nome não encontrado';

  // Extração robusta do email
  const email = 
    lead.email_usuario ||
    dadosPersonais.email ||
    respostas.email ||
    'Email não informado';

  // Extração robusta do WhatsApp/telefone
  const whatsapp = 
    dadosPersonais.whatsapp ||
    respostas.whatsapp ||
    dadosPersonais.telefone ||
    respostas.telefone ||
    respostas.phone ||
    respostas.celular ||
    'Não informado';

  // Extração robusta da descrição do produto
  const produtoDescricao = 
    lead.produto_descricao ||
    negocio.produtoDescricao ||
    respostas.produtoDescricao ||
    negocio.descricaoProduto ||
    respostas.descricaoProduto ||
    negocio.produto ||
    respostas.produto ||
    'Não informado';

  // Extração robusta do valor médio
  const valorMedioNum = 
    lead.valor_medio_produto ||
    negocio.valorMedio ||
    respostas.valorMedio ||
    negocio.precoMedio ||
    respostas.precoMedio ||
    negocio.ticket ||
    respostas.ticket ||
    null;

  const valorMedio = valorMedioNum 
    ? `R$ ${Number(valorMedioNum).toFixed(2)}` 
    : 'Não informado';

  // Extração robusta do tipo de negócio
  const tipoNegocio = translateTipoNegocio(
    lead.tipo_negocio ||
    negocio.tipo ||
    respostas.tipoNegocio ||
    negocio.categoria ||
    respostas.categoria ||
    'Não informado'
  );

  // Extração de informação sobre vendas anteriores
  const jaTevVendasBool = 
    lead.ja_teve_vendas ||
    negocio.jaTevVendas ||
    respostas.jaTevVendas ||
    negocio.temVendas ||
    respostas.temVendas;

  const jaTevVendas = 
    jaTevVendasBool === true ? 'Sim' :
    jaTevVendasBool === false ? 'Não' :
    'Não informado';

  return {
    nome,
    email,
    whatsapp,
    produtoDescricao,
    valorMedio,
    tipoNegocio,
    jaTevVendas
  };
}

export function translateTipoNegocio(tipo: string): string {
  if (!tipo) return 'Não informado';
  
  const tipos: { [key: string]: string } = {
    'digital': 'Digital',
    'physical': 'Físico',
    'service': 'Serviço',
    'ecommerce': 'E-commerce',
    'consultoria': 'Consultoria',
    'curso': 'Curso Online',
    'infoproduto': 'Infoproduto',
    'software': 'Software',
    'app': 'Aplicativo',
    'saas': 'SaaS',
    'marketplace': 'Marketplace',
    'dropshipping': 'Dropshipping'
  };
  
  return tipos[tipo.toLowerCase()] || tipo || 'Não informado';
}

export function translateStatus(status: string): string {
  if (!status) return 'Lead';
  
  const statuses: { [key: string]: string } = {
    'lead': 'Lead',
    'comprou': 'Comprou',
    'recusou': 'Não quer',
    'planejando': 'Planejando',
    'planejamento_entregue': 'Planejamento Entregue',
    'upsell_pago': 'Upsell Pago'
  };
  
  return statuses[status.toLowerCase()] || status || 'Lead';
}

// Função para verificar se um lead tem informações completas
export function isLeadComplete(lead: any): boolean {
  const data = extractLeadData(lead);
  return (
    data.nome !== 'Nome não encontrado' &&
    data.whatsapp !== 'Não informado' &&
    data.produtoDescricao !== 'Não informado'
  );
}

// Função para obter prioridade do lead (para ordenação)
export function getLeadPriority(lead: any): number {
  const data = extractLeadData(lead);
  let priority = 0;
  
  // Mais pontos para leads mais completos
  if (data.nome !== 'Nome não encontrado') priority += 1;
  if (data.whatsapp !== 'Não informado') priority += 2; // WhatsApp é mais importante
  if (data.produtoDescricao !== 'Não informado') priority += 1;
  if (data.valorMedio !== 'Não informado') priority += 1;
  
  return priority;
}