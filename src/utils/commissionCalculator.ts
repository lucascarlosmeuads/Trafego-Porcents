
// Regras de comissão baseadas no valor da venda
const COMMISSION_RULES = [
  { saleValue: 500, commission: 100 },
  { saleValue: 350, commission: 80 },
  { saleValue: 250, commission: 60 }
] as const

// Comissão padrão quando não há valor de venda ou não se encaixa nas regras
const DEFAULT_COMMISSION = 60

/**
 * Calcula a comissão baseada no valor da venda
 * @param saleValue - Valor da venda em reais
 * @returns Valor da comissão calculada
 */
export function calculateCommission(saleValue: number): number {
  console.log(`🧮 [CommissionCalculator] Calculando comissão para venda de R$ ${saleValue}`)

  // Verificar se o valor corresponde exatamente a uma regra
  const exactRule = COMMISSION_RULES.find(rule => rule.saleValue === saleValue)
  if (exactRule) {
    console.log(`✅ [CommissionCalculator] Regra exata encontrada: R$ ${saleValue} → R$ ${exactRule.commission}`)
    return exactRule.commission
  }

  // Para valores intermediários, usar interpolação linear
  const sortedRules = [...COMMISSION_RULES].sort((a, b) => a.saleValue - b.saleValue)
  
  // Se valor é menor que o menor valor nas regras
  if (saleValue < sortedRules[0].saleValue) {
    console.log(`⚠️ [CommissionCalculator] Valor R$ ${saleValue} menor que regras. Usando comissão padrão: R$ ${DEFAULT_COMMISSION}`)
    return DEFAULT_COMMISSION
  }

  // Se valor é maior que o maior valor nas regras
  if (saleValue > sortedRules[sortedRules.length - 1].saleValue) {
    // Para valores acima de R$ 500, usar proporção baseada na regra mais alta
    const highestRule = sortedRules[sortedRules.length - 1]
    const proportion = saleValue / highestRule.saleValue
    const calculatedCommission = Math.round(highestRule.commission * proportion)
    console.log(`📈 [CommissionCalculator] Valor acima das regras. Calculando proporcionalmente: R$ ${calculatedCommission}`)
    return calculatedCommission
  }

  // Interpolação linear entre duas regras
  for (let i = 0; i < sortedRules.length - 1; i++) {
    const lowerRule = sortedRules[i]
    const upperRule = sortedRules[i + 1]

    if (saleValue > lowerRule.saleValue && saleValue < upperRule.saleValue) {
      const ratio = (saleValue - lowerRule.saleValue) / (upperRule.saleValue - lowerRule.saleValue)
      const interpolatedCommission = Math.round(lowerRule.commission + ratio * (upperRule.commission - lowerRule.commission))
      
      console.log(`🔄 [CommissionCalculator] Interpolação entre R$ ${lowerRule.saleValue} e R$ ${upperRule.saleValue}: R$ ${interpolatedCommission}`)
      return interpolatedCommission
    }
  }

  // Fallback para comissão padrão
  console.log(`🔄 [CommissionCalculator] Usando comissão padrão: R$ ${DEFAULT_COMMISSION}`)
  return DEFAULT_COMMISSION
}

/**
 * Valida se um valor de venda é válido para cálculo de comissão
 * @param saleValue - Valor da venda
 * @returns true se válido, false caso contrário
 */
export function isValidSaleValue(saleValue: number | null | undefined): boolean {
  return typeof saleValue === 'number' && saleValue > 0 && !isNaN(saleValue)
}

/**
 * Obtém a descrição da regra de comissão aplicada
 * @param saleValue - Valor da venda
 * @returns Descrição da regra aplicada
 */
export function getCommissionRuleDescription(saleValue: number): string {
  const commission = calculateCommission(saleValue)
  
  const exactRule = COMMISSION_RULES.find(rule => rule.saleValue === saleValue)
  if (exactRule) {
    return `Regra fixa: R$ ${saleValue} → R$ ${commission}`
  }

  if (saleValue < COMMISSION_RULES[0].saleValue || saleValue > COMMISSION_RULES[COMMISSION_RULES.length - 1].saleValue) {
    return `Valor fora das regras padrão. Calculado: R$ ${commission}`
  }

  return `Interpolação linear entre regras. Calculado: R$ ${commission}`
}

/**
 * Obtém todas as regras de comissão configuradas
 * @returns Array com as regras de comissão
 */
export function getCommissionRules() {
  return COMMISSION_RULES
}
