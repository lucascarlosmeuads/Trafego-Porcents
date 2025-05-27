
import { getStatusDisplayLabel, type StatusCampanha } from '@/lib/supabase'

// Hook para usar o display label dos status
export const useStatusDisplay = () => {
  const getDisplayLabel = (status: StatusCampanha): string => {
    return getStatusDisplayLabel(status)
  }

  return { getDisplayLabel }
}
