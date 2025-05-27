
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

// Helper function to check file size limits and storage usage
export const checkStorageUsage = async () => {
  console.log('📊 [storageHelpers] Verificando uso do storage...')
  
  try {
    const { data: files, error } = await supabase
      .from('arquivos_cliente')
      .select('tamanho_arquivo')

    if (error) {
      console.error('❌ [storageHelpers] Erro ao buscar tamanhos dos arquivos:', error)
      return null
    }

    const totalSize = files?.reduce((acc, file) => acc + (file.tamanho_arquivo || 0), 0) || 0
    const totalSizeGB = totalSize / (1024 * 1024 * 1024)
    
    console.log(`📊 [storageHelpers] Uso total do storage: ${totalSizeGB.toFixed(2)} GB`)
    console.log(`📊 [storageHelpers] Total de arquivos: ${files?.length || 0}`)
    
    return {
      totalSize,
      totalSizeGB,
      totalFiles: files?.length || 0
    }
  } catch (error) {
    console.error('💥 [storageHelpers] Erro ao verificar uso do storage:', error)
    return null
  }
}

// Helper to get file size in human readable format
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
