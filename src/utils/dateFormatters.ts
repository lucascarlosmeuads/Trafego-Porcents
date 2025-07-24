
import { tableLogger } from './logger'

export const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return 'N/A'
  try {
    // Extrai apenas a parte da data (YYYY-MM-DD) de strings com timestamp
    const dateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      const datePart = dateMatch[1]
      const [year, month, day] = datePart.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month é zero-indexed
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
    
    // Para outros formatos, usa o parsing padrão
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch (error) {
    tableLogger.error('Erro ao formatar data', { dateString, error })
    return 'N/A'
  }
}
