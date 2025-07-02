
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export const parseCurrencyToNumber = (currencyString: string): number => {
  if (!currencyString) return 0
  
  // Remove R$, espaços e converte vírgula para ponto
  const numericValue = currencyString
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  
  const parsed = parseFloat(numericValue)
  return isNaN(parsed) ? 0 : parsed
}

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Converte para número dividindo por 100 (centavos para reais)
  const number = parseInt(numericValue) / 100
  
  return formatCurrency(number)
}

export const validateCurrencyValue = (value: number): { isValid: boolean; error?: string } => {
  if (value < 0.01) {
    return { isValid: false, error: 'O valor deve ser maior que R$ 0,01' }
  }
  
  if (value > 100000) {
    return { isValid: false, error: 'O valor não pode ser maior que R$ 100.000,00' }
  }
  
  return { isValid: true }
}
