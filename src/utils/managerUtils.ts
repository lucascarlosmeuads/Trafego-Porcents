
import { supabase } from '@/lib/supabase'

export const determineManager = async (email: string, selectedMgr?: string, isAdmin?: boolean): Promise<{ manager: string }> => {
  // Se for admin e tiver gestor selecionado, usar o gestor selecionado
  if (isAdmin && selectedMgr) {
    return {
      manager: selectedMgr
    }
  }
  
  if (email === 'lucas@admin.com') {
    return {
      manager: 'Lucas Falcão'
    }
  }
  
  // Buscar primeiro na tabela gestores para nomes corretos
  try {
    console.log('🔍 [managerUtils] Buscando gestor por email na tabela gestores:', email)
    
    const { data: gestorData, error: gestorError } = await supabase
      .from('gestores')
      .select('nome, email, ativo')
      .eq('email', email)
      .eq('ativo', true)
      .single()

    if (!gestorError && gestorData) {
      console.log('✅ [managerUtils] Gestor encontrado na tabela gestores:', gestorData.nome)
      return {
        manager: gestorData.nome
      }
    }
  } catch (err) {
    console.warn('[managerUtils] Gestor não encontrado na tabela gestores, usando fallback')
  }
  
  // Mapear emails específicos para gestores (fallback)
  const managerMapping: { [key: string]: { manager: string } } = {
    'andreza@gestor.com': { manager: 'Andreza' },
    'lucas.falcao@gestor.com': { manager: 'Lucas Falcão' },
    'andreza@trafegoporcents.com': { manager: 'Andreza' },
    'lucas.falcao@trafegoporcents.com': { manager: 'Lucas Falcão' },
    'carol@trafegoporcents.com': { manager: 'Carol' },
    'junior@trafegoporcents.com': { manager: 'Junior' }
  }
  
  // Se for um email específico mapeado, usar o mapeamento
  if (managerMapping[email]) {
    return {
      manager: managerMapping[email].manager
    }
  }
  
  // Se não encontrou, extrair nome do email se for @trafegoporcents.com
  if (email.endsWith('@trafegoporcents.com')) {
    const username = email.split('@')[0]
    const managerName = username.charAt(0).toUpperCase() + username.slice(1)
    return {
      manager: managerName
    }
  }
  
  return {
    manager: 'Gestor'
  }
}
