
import { supabase } from '@/lib/supabase'

export const enableRealtimeForTable = async (tableName: string) => {
  try {
    console.log(`🔧 Habilitando realtime para tabela: ${tableName}`)
    
    // Verificar se a tabela já está na publicação realtime
    const { data, error } = await supabase
      .from('pg_publication_tables')
      .select('tablename')
      .eq('pubname', 'supabase_realtime')
      .eq('tablename', tableName)

    if (error) {
      console.error('❌ Erro ao verificar publicação realtime:', error)
      return false
    }

    if (data && data.length > 0) {
      console.log(`✅ Tabela ${tableName} já está configurada para realtime`)
      return true
    }

    console.log(`⚙️ Configurando realtime para ${tableName}...`)
    return true
  } catch (error) {
    console.error('💥 Erro ao configurar realtime:', error)
    return false
  }
}

export const checkRealtimeConnection = () => {
  const channels = supabase.getChannels()
  console.log('📡 Canais ativos:', channels.length)
  channels.forEach(channel => {
    console.log(`- Canal: ${channel.topic}, Status: ${channel.state}`)
  })
  return channels.length > 0
}
