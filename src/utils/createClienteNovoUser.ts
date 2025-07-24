import { supabase } from '@/integrations/supabase/client'

export async function createClienteNovoUser() {
  try {
    console.log('🚀 Chamando edge function para criar usuário clientenovo...')
    
    const { data, error } = await supabase.functions.invoke('create-clientenovo-user', {
      body: {}
    })

    if (error) {
      console.error('❌ Erro na edge function:', error)
      return { success: false, error }
    }

    console.log('✅ Resposta da edge function:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Erro ao chamar edge function:', error)
    return { success: false, error }
  }
}