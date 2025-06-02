
import { supabase } from '@/lib/supabase'

export const createSellerUser = async (email: string, password: string, sellerName: string) => {
  try {
    console.log('🚀 [createSellerUser] Criando vendedor via edge function...')
    console.log('📧 [createSellerUser] Email:', email)
    console.log('👤 [createSellerUser] Nome:', sellerName)
    
    const { data, error } = await supabase.functions.invoke('create-seller-user', {
      body: {
        email: email,
        password: password,
        sellerName: sellerName
      }
    })

    if (error) {
      console.error('❌ [createSellerUser] Erro na edge function:', error)
      throw new Error(`Erro ao criar vendedor: ${error.message}`)
    }

    console.log('✅ [createSellerUser] Vendedor criado com sucesso:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('💥 [createSellerUser] Erro crítico:', error)
    throw error
  }
}

// Executar automaticamente para criar João Ladislau
export const createJoaoLadislau = async () => {
  try {
    const result = await createSellerUser(
      'joao.ladislau1@hotmail.com',
      'vendedor123',
      'João Ladislau'
    )
    
    console.log('🎉 [createJoaoLadislau] João Ladislau criado com sucesso!')
    return result
    
  } catch (error) {
    console.error('❌ [createJoaoLadislau] Falha ao criar João Ladislau:', error)
    throw error
  }
}
