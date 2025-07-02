
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const parseCurrency = (value: string): number => {
  // Remove tudo exceto dígitos, vírgulas e pontos
  const cleanValue = value.replace(/[^\d.,]/g, '')
  
  // Converte vírgula para ponto (padrão brasileiro)
  const normalizedValue = cleanValue.replace(',', '.')
  
  const parsed = parseFloat(normalizedValue)
  return isNaN(parsed) ? 0 : parsed
}

export const formatCurrencyInput = (value: string): string => {
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers) / 100
  
  return formatCurrency(amount).replace('R$ ', '')
}
