
import { supabase } from '@/lib/supabase'

export const ensureClienteArquivosBucket = async () => {
  console.log('🔧 [storageHelpers] Verificando bucket cliente-arquivos...')
  
  try {
    // Try to list files in the bucket to check if it exists
    const { error: listError } = await supabase.storage
      .from('cliente-arquivos')
      .list('', { limit: 1 })

    if (listError && listError.message.includes('Bucket not found')) {
      console.log('📁 [storageHelpers] Bucket não existe, criando...')
      
      // Create the bucket
      const { error: createError } = await supabase.storage
        .createBucket('cliente-arquivos', {
          public: true,
          allowedMimeTypes: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
          ],
          fileSizeLimit: 52428800 // 50MB
        })

      if (createError) {
        console.error('❌ [storageHelpers] Erro ao criar bucket:', createError)
        throw new Error(`Falha ao criar bucket: ${createError.message}`)
      }

      console.log('✅ [storageHelpers] Bucket cliente-arquivos criado com sucesso')
    } else if (listError) {
      console.error('❌ [storageHelpers] Erro inesperado ao verificar bucket:', listError)
      throw listError
    } else {
      console.log('✅ [storageHelpers] Bucket cliente-arquivos já existe')
    }

    return true
  } catch (error) {
    console.error('💥 [storageHelpers] Erro crítico:', error)
    throw error
  }
}

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
