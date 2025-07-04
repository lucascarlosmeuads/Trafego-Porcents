
import { tableLogger } from './logger'

export const formatDate = (dateString: string) => {
  if (!dateString || dateString.trim() === '') return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch (error) {
    tableLogger.error('Erro ao formatar data', { dateString, error })
    return 'N/A'
  }
}
