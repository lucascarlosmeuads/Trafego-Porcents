
// Status de campanha
export const CAMPAIGN_STATUS = {
  CLIENTE_NOVO: 'Cliente Novo',
  FORMULARIO: 'Formulário',
  CRIATIVO: 'Criativo',
  CONFIGURANDO_BM: 'Configurando BM',
  AGENDAMENTO: 'Agendamento',
  OTIMIZACAO: 'Otimização',
  BRIEF: 'Brief',
  CLIENTE_ANTIGO: 'Cliente Antigo',
  SITE: 'Site',
  SUBINDO_CAMPANHA: 'Subindo Campanha',
  REEMBOLSO: 'Reembolso',
  CAMPANHA_ANUAL: 'Campanha Anual',
  URGENTE: 'Urgente',
  CLIENTE_SUMIU: 'Cliente Sumiu',
  PROBLEMA: 'Problema',
  EM_ANDAMENTO: 'Em andamento',
  OFF: 'Off',
  NO_AR: 'No Ar',
  CAMPANHA_NO_AR: 'Campanha no Ar'
} as const;

export type StatusCampanha = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];

// Status do site
export const SITE_STATUS = {
  PENDENTE: 'pendente',
  EM_PRODUCAO: 'em_producao',
  AGUARDANDO_APROVACAO: 'aguardando_aprovacao',
  APROVADO: 'aprovado',
  ONLINE: 'online',
  CANCELADO: 'cancelado'
} as const;

export type SiteStatus = typeof SITE_STATUS[keyof typeof SITE_STATUS];

// Status de comissão
export const COMMISSION_STATUS = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado'
} as const;

export type ComissionStatus = typeof COMMISSION_STATUS[keyof typeof COMMISSION_STATUS];

// Cores dos status (para uso em componentes)
export const STATUS_COLORS = {
  [CAMPAIGN_STATUS.CLIENTE_NOVO]: 'bg-blue-100 text-blue-800',
  [CAMPAIGN_STATUS.FORMULARIO]: 'bg-yellow-100 text-yellow-800',
  [CAMPAIGN_STATUS.CRIATIVO]: 'bg-purple-100 text-purple-800',
  [CAMPAIGN_STATUS.CONFIGURANDO_BM]: 'bg-orange-100 text-orange-800',
  [CAMPAIGN_STATUS.AGENDAMENTO]: 'bg-cyan-100 text-cyan-800',
  [CAMPAIGN_STATUS.OTIMIZACAO]: 'bg-green-100 text-green-800',
  [CAMPAIGN_STATUS.BRIEF]: 'bg-indigo-100 text-indigo-800',
  [CAMPAIGN_STATUS.CLIENTE_ANTIGO]: 'bg-gray-100 text-gray-800',
  [CAMPAIGN_STATUS.SITE]: 'bg-teal-100 text-teal-800',
  [CAMPAIGN_STATUS.SUBINDO_CAMPANHA]: 'bg-lime-100 text-lime-800',
  [CAMPAIGN_STATUS.REEMBOLSO]: 'bg-red-100 text-red-800',
  [CAMPAIGN_STATUS.CAMPANHA_ANUAL]: 'bg-emerald-100 text-emerald-800',
  [CAMPAIGN_STATUS.URGENTE]: 'bg-red-200 text-red-900',
  [CAMPAIGN_STATUS.CLIENTE_SUMIU]: 'bg-gray-200 text-gray-700',
  [CAMPAIGN_STATUS.PROBLEMA]: 'bg-red-100 text-red-800',
  [CAMPAIGN_STATUS.EM_ANDAMENTO]: 'bg-blue-100 text-blue-800',
  [CAMPAIGN_STATUS.OFF]: 'bg-gray-300 text-gray-800',
  [CAMPAIGN_STATUS.NO_AR]: 'bg-green-200 text-green-800',
  [CAMPAIGN_STATUS.CAMPANHA_NO_AR]: 'bg-green-200 text-green-800'
} as const;

// Mensagens padrão
export const MESSAGES = {
  SUCCESS: {
    SAVE: 'Dados salvos com sucesso!',
    UPDATE: 'Atualizado com sucesso!',
    DELETE: 'Removido com sucesso!',
    UPLOAD: 'Arquivo enviado com sucesso!'
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado',
    NETWORK: 'Erro de conexão. Tente novamente.',
    VALIDATION: 'Dados inválidos. Verifique os campos.',
    PERMISSION: 'Você não tem permissão para esta ação',
    NOT_FOUND: 'Item não encontrado'
  },
  LOADING: {
    SAVE: 'Salvando...',
    UPDATE: 'Atualizando...',
    DELETE: 'Removendo...',
    UPLOAD: 'Enviando arquivo...',
    FETCH: 'Carregando dados...'
  }
} as const;

// Configurações de UI
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
  },
  DEBOUNCE: {
    SEARCH: 300,
    SAVE: 500
  },
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/*', 'application/pdf', '.doc', '.docx']
  },
  MODAL: {
    ANIMATION_DURATION: 200
  }
} as const;

// Email patterns e validações
export const VALIDATION = {
  EMAIL_PATTERNS: {
    ADMIN: /@admin\./,
    TRAFEGO: /@trafegoporcents\.com$/,
    GESTOR: /@trafegoporcents\.com$/
  },
  PHONE_PATTERN: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  BM_PATTERN: /^\d+$/
} as const;

// Gestores válidos (enum do banco)
export const VALID_GESTORES = [
  'jose@trafegoporcents.com',
  'falcao@trafegoporcents.com', 
  'rullian@trafegoporcents.com',
  'danielribeiro@trafegoporcents.com',
  'danielmoreira@trafegoporcents.com',
  'carol@trafegoporcents.com',
  'guilherme@trafegoporcents.com',
  'emily@trafegoporcents.com',
  'leandrodrumzique@trafegoporcents.com',
  'kimberlly@trafegoporcents.com',
  'junior@trafegoporcents.com',
  'kely@trafegoporcents.com',
  'jefferson@trafegoporcents.com'
] as const;

// Valores padrão
export const DEFAULTS = {
  COMMISSION_VALUE: 60.00,
  CLIENT_STATUS: CAMPAIGN_STATUS.CLIENTE_NOVO,
  SITE_STATUS: SITE_STATUS.PENDENTE,
  COMMISSION_STATUS: COMMISSION_STATUS.PENDENTE
} as const;

// Tipos de origem de cadastro
export const ORIGEM_CADASTRO = {
  VENDA: 'venda',
  MAX_INTEGRATION: 'max_integration',
  MANUAL: 'manual',
  IMPORTACAO: 'importacao'
} as const;

export type OrigemCadastro = typeof ORIGEM_CADASTRO[keyof typeof ORIGEM_CADASTRO];

// Configurações de toast
export const TOAST_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000
  }
} as const;
