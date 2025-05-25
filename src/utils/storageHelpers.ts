
import { supabase } from '@/lib/supabase'

export const syncStorageWithDatabase = async () => {
  console.log('🔄 [storageHelpers] Iniciando sincronização storage <-> banco...')
  
  try {
    // List all files in storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('cliente-arquivos')
      .list('', { limit: 1000, offset: 0 })

    if (storageError) {
      console.error('❌ [storageHelpers] Erro ao listar arquivos do storage:', storageError)
      return false
    }

    // Get all files from database
    const { data: dbFiles, error: dbError } = await supabase
      .from('arquivos_cliente')
      .select('caminho_arquivo')

    if (dbError) {
      console.error('❌ [storageHelpers] Erro ao buscar arquivos do banco:', dbError)
      return false
    }

    const dbPaths = new Set(dbFiles?.map(f => f.caminho_arquivo) || [])
    let orphanCount = 0

    // Check for files in storage but not in database
    for (const folder of storageFiles || []) {
      if (folder.name && folder.name !== '.emptyFolderPlaceholder') {
        const { data: folderFiles } = await supabase.storage
          .from('cliente-arquivos')
          .list(folder.name)

        for (const file of folderFiles || []) {
          const fullPath = `${folder.name}/${file.name}`
          if (!dbPaths.has(fullPath)) {
            console.warn('⚠️ [storageHelpers] Arquivo órfão encontrado:', fullPath)
            orphanCount++
          }
        }
      }
    }

    console.log(`✅ [storageHelpers] Sincronização concluída. ${orphanCount} arquivos órfãos encontrados.`)
    return true

  } catch (error) {
    console.error('💥 [storageHelpers] Erro na sincronização:', error)
    return false
  }
}
