// Sistema de Comissões Duplas para Cliente Novo
// Vendedor: R$ 500 → R$ 40 | R$ 350 → R$ 30
// Admin/Gestor: R$ 500 → R$ 100 | R$ 350 → R$ 80

const COMMISSION_RULES_CLIENTE_NOVO = [
  { saleValue: 500, sellerCommission: 40, managerCommission: 100 },
  { saleValue: 350, sellerCommission: 30, managerCommission: 80 }
] as const

export type CommissionType = 'seller' | 'manager'

export const calculateDualCommission = (
  saleValue: number, 
  commissionType: CommissionType
): number => {
  // Buscar regra exata
  const rule = COMMISSION_RULES_CLIENTE_NOVO.find(r => r.saleValue === saleValue)
  
  if (rule) {
    return commissionType === 'seller' ? rule.sellerCommission : rule.managerCommission
  }
  
  // Se não encontrar regra exata, retornar 0 (valores fixos apenas)
  return 0
}

export const isClienteNovoSale = (statusCampanha: string): boolean => {
  return statusCampanha === 'Cliente Novo'
}

export const hasValidSaleValue = (valorVenda: number | null | undefined): boolean => {
  if (valorVenda === null || valorVenda === undefined || isNaN(valorVenda) || valorVenda <= 0) {
    return false
  }
  
  return COMMISSION_RULES_CLIENTE_NOVO.some(rule => rule.saleValue === valorVenda)
}

export const getCommissionForDisplay = (
  cliente: any, 
  commissionType: CommissionType
): number => {
  // Se é Cliente Novo e tem valor_venda_inicial válido, usar sistema duplo
  if (isClienteNovoSale(cliente.status_campanha) && hasValidSaleValue(cliente.valor_venda_inicial)) {
    return calculateDualCommission(cliente.valor_venda_inicial, commissionType)
  }
  
  // Se é Cliente Novo sem valor_venda_inicial, assumir R$ 500 (padrão mais comum)
  if (isClienteNovoSale(cliente.status_campanha)) {
    return calculateDualCommission(500, commissionType) // 100 para gestor/admin
  }
  
  // Senão, usar valor padrão do banco
  return cliente.valor_comissao || 60
}

export const getCommissionDescription = (
  saleValue: number, 
  commissionType: CommissionType
): string => {
  const rule = COMMISSION_RULES_CLIENTE_NOVO.find(r => r.saleValue === saleValue)
  
  if (rule) {
    const commission = commissionType === 'seller' ? rule.sellerCommission : rule.managerCommission
    const typeLabel = commissionType === 'seller' ? 'Vendedor' : 'Gestor/Admin'
    return `Venda de R$ ${rule.saleValue} → Comissão ${typeLabel}: R$ ${commission}`
  }
  
  return 'Valor de venda não possui comissão definida'
}

export const getClienteNovoCommissionRules = () => {
  return COMMISSION_RULES_CLIENTE_NOVO
}

export const getValidSaleValues = (): number[] => {
  return COMMISSION_RULES_CLIENTE_NOVO.map(rule => rule.saleValue)
}