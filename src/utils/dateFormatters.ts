
import { tableLogger } from './logger'

export const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return 'N/A'
  try {
    // Se a string está no formato YYYY-MM-DD, trata como data local (não UTC)
    // para evitar problemas de timezone
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number)
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
