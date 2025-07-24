// Calculador de comissões fixas para Cliente Novo
// Valores fixos conforme especificado:
// R$ 500 venda -> R$ 40 comissão
// R$ 350 venda -> R$ 30 comissão

const COMMISSION_RULES_CLIENTE_NOVO = [
  { saleValue: 500, commission: 40 },
  { saleValue: 350, commission: 30 }
] as const

export const calculateClienteNovoCommission = (saleValue: number): number => {
  // Buscar regra exata
  const exactRule = COMMISSION_RULES_CLIENTE_NOVO.find(rule => rule.saleValue === saleValue)
  
  if (exactRule) {
    return exactRule.commission
  }
  
  // Se não encontrar regra exata, retornar 0 (valores fixos apenas)
  return 0
}

export const isValidClienteNovoSaleValue = (saleValue: number | null | undefined): boolean => {
  if (saleValue === null || saleValue === undefined || isNaN(saleValue) || saleValue <= 0) {
    return false
  }
  
  return COMMISSION_RULES_CLIENTE_NOVO.some(rule => rule.saleValue === saleValue)
}

export const getClienteNovoCommissionDescription = (saleValue: number): string => {
  const rule = COMMISSION_RULES_CLIENTE_NOVO.find(r => r.saleValue === saleValue)
  
  if (rule) {
    return `Venda de R$ ${rule.saleValue} → Comissão fixa de R$ ${rule.commission}`
  }
  
  return 'Valor de venda não possui comissão definida'
}

export const getClienteNovoCommissionRules = () => {
  return COMMISSION_RULES_CLIENTE_NOVO
}

export const getValidSaleValues = (): number[] => {
  return COMMISSION_RULES_CLIENTE_NOVO.map(rule => rule.saleValue)
}