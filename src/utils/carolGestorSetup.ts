
import { supabase } from '@/lib/supabase'

export const cadastrarCarolComoGestora = async () => {
  try {
    console.log('🚀 [CAROL-SETUP] Iniciando cadastro da Carol como gestora...')
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado')
    }

    const response = await fetch(`https://rxpgqunqsegypssoqpyf.supabase.co/functions/v1/create-carol-gestor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao cadastrar Carol')
    }

    console.log('✅ [CAROL-SETUP] Carol cadastrada com sucesso:', result.message)
    return result
  } catch (error: any) {
    console.error('💥 [CAROL-SETUP] Erro:', error)
    throw error
  }
}
