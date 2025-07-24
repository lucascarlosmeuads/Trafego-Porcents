import React from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

export function CreateClienteNovoButton() {
  const createUser = async () => {
    try {
      console.log('🚀 Chamando edge function para criar usuário clientenovo...')
      
      const { data, error } = await supabase.functions.invoke('create-clientenovo-user', {
        body: {}
      })

      if (error) {
        console.error('❌ Erro na edge function:', error)
        alert(`Erro: ${error.message}`)
        return
      }

      console.log('✅ Resposta da edge function:', data)
      alert(`Sucesso! ${data.message}`)
      
    } catch (error) {
      console.error('❌ Erro ao chamar edge function:', error)
      alert(`Erro: ${error}`)
    }
  }

  return (
    <Button onClick={createUser}>
      Criar Usuário ClienteNovo
    </Button>
  )
}