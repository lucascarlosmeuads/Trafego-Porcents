import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload, FileText, Image, Video, Trash2, Loader2 } from 'lucide-react'
import type { ArquivoCliente } from '@/hooks/useClienteData'
import { ensureClienteArquivosBucket } from '@/utils/storageHelpers'

interface ArquivosUploadProps {
  emailCliente: string
  arquivos: ArquivoCliente[]
  onArquivosUpdated: () => void
}

export function ArquivosUpload({ emailCliente, arquivos, onArquivosUpdated }: ArquivosUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="w-4 h-4" />
    if (tipo.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  // Function to sanitize email for use in file paths
  const sanitizeEmailForPath = (email: string) => {
    return email.replace(/[@.]/g, '_')
  }

  // Enhanced bucket creation with proper policies
  const ensureClienteArquivosBucket = async () => {
    console.log('🔧 [ArquivosUpload] Verificando/criando bucket cliente-arquivos...')
    
    try {
      // Try to list files in the bucket to check if it exists
      const { error: listError } = await supabase.storage
        .from('cliente-arquivos')
        .list('', { limit: 1 })

      if (listError && listError.message.includes('Bucket not found')) {
        console.log('📁 [ArquivosUpload] Bucket não existe, criando...')
        
        // Create the bucket as public
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
          console.error('❌ [ArquivosUpload] Erro ao criar bucket:', createError)
          throw new Error(`Falha ao criar bucket: ${createError.message}`)
        }

        console.log('✅ [ArquivosUpload] Bucket cliente-arquivos criado com sucesso')
      } else if (listError) {
        console.error('❌ [ArquivosUpload] Erro inesperado ao verificar bucket:', listError)
        throw listError
      } else {
        console.log('✅ [ArquivosUpload] Bucket cliente-arquivos já existe')
      }

      return true
    } catch (error) {
      console.error('💥 [ArquivosUpload] Erro crítico na verificação do bucket:', error)
      throw error
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    console.log('🚀 [ArquivosUpload] Iniciando upload de', files.length, 'arquivo(s) para cliente:', emailCliente)

    try {
      // First ensure we have a valid user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [ArquivosUpload] Erro ao verificar sessão:', sessionError)
        throw new Error('Erro de autenticação. Faça login novamente.')
      }

      if (!session) {
        console.error('❌ [ArquivosUpload] Usuário não autenticado')
        throw new Error('Você precisa estar logado para enviar arquivos.')
      }

      console.log('✅ [ArquivosUpload] Usuário autenticado:', session.user.email)

      // Ensure storage bucket exists
      await ensureClienteArquivosBucket()

      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          console.log('📤 [ArquivosUpload] Processando arquivo:', file.name, 'Tamanho:', file.size)

          // Validar tipo de arquivo
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
          ]
          
          if (!allowedTypes.includes(file.type)) {
            console.warn('⚠️ [ArquivosUpload] Tipo não permitido:', file.type)
            toast({
              title: "Tipo de arquivo não permitido",
              description: `O arquivo ${file.name} não é suportado.`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          // Validar tamanho (máximo 50MB)
          if (file.size > 50 * 1024 * 1024) {
            console.warn('⚠️ [ArquivosUpload] Arquivo muito grande:', file.size)
            toast({
              title: "Arquivo muito grande",
              description: `O arquivo ${file.name} deve ter no máximo 50MB.`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          // Sanitize email for storage path
          const sanitizedEmail = sanitizeEmailForPath(emailCliente)
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${sanitizedEmail}/${fileName}`

          console.log('📤 [ArquivosUpload] Enviando para storage:', filePath)

          // Upload para o Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('❌ [ArquivosUpload] Erro no upload para storage:', uploadError)
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [ArquivosUpload] Upload para storage concluído:', uploadData.path)
          console.log('💾 [ArquivosUpload] Salvando no banco de dados...')

          // Salvar informações do arquivo no banco com retry
          let dbInsertSuccess = false
          let dbRetries = 3

          while (!dbInsertSuccess && dbRetries > 0) {
            const { data: dbData, error: dbError } = await supabase
              .from('arquivos_cliente')
              .insert({
                email_cliente: emailCliente,
                nome_arquivo: file.name,
                caminho_arquivo: filePath,
                tipo_arquivo: file.type,
                tamanho_arquivo: file.size,
                author_type: 'cliente'
              })
              .select()

            if (dbError) {
              console.error('❌ [ArquivosUpload] Erro ao salvar no banco (tentativa restante:', dbRetries - 1, '):', dbError)
              dbRetries--
              
              if (dbRetries === 0) {
                // Tentar remover o arquivo do storage se falhou no banco
                try {
                  await supabase.storage
                    .from('cliente-arquivos')
                    .remove([filePath])
                  console.log('🧹 [ArquivosUpload] Arquivo removido do storage após erro no banco')
                } catch (cleanupError) {
                  console.error('❌ [ArquivosUpload] Erro ao limpar storage:', cleanupError)
                }
                
                toast({
                  title: "Erro ao salvar arquivo",
                  description: `Falha ao registrar ${file.name}: ${dbError.message}`,
                  variant: "destructive"
                })
                errorCount++
                break
              } else {
                // Wait a bit before retry
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } else {
              console.log('✅ [ArquivosUpload] Arquivo salvo com sucesso no banco:', dbData)
              dbInsertSuccess = true
              successCount++
            }
          }

        } catch (fileError) {
          console.error('❌ [ArquivosUpload] Erro ao processar arquivo:', file.name, fileError)
          toast({
            title: "Erro no processamento",
            description: `Falha ao processar ${file.name}`,
            variant: "destructive"
          })
          errorCount++
        }
      }

      // Mostrar resultado final
      if (successCount > 0) {
        toast({
          title: "Upload concluído!",
          description: `${successCount} arquivo(s) enviado(s) com sucesso.`,
        })
        console.log('🎉 [ArquivosUpload] Upload concluído:', successCount, 'sucessos,', errorCount, 'erros')
        
        // Trigger callback to refresh data
        setTimeout(() => {
          onArquivosUpdated()
        }, 500)
      } else if (errorCount > 0) {
        toast({
          title: "Falha no upload",
          description: "Nenhum arquivo foi enviado com sucesso. Verifique os erros acima.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('💥 [ArquivosUpload] Erro crítico no upload:', error)
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Limpar o input
      e.target.value = ''
    }
  }

  const handleDeleteFile = async (arquivo: ArquivoCliente) => {
    try {
      console.log('🗑️ [ArquivosUpload] Removendo arquivo:', arquivo.nome_arquivo)

      // Remover do banco primeiro
      const { error: dbError } = await supabase
        .from('arquivos_cliente')
        .delete()
        .eq('id', arquivo.id)

      if (dbError) {
        console.error('❌ [ArquivosUpload] Erro ao remover do banco:', dbError)
        throw dbError
      }

      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from('cliente-arquivos')
        .remove([arquivo.caminho_arquivo])

      if (storageError) {
        console.warn('⚠️ [ArquivosUpload] Erro ao remover do storage (mas removido do banco):', storageError)
      }

      toast({
        title: "Arquivo removido",
        description: `${arquivo.nome_arquivo} foi removido com sucesso.`,
      })

      onArquivosUpdated()

    } catch (error) {
      console.error('❌ [ArquivosUpload] Erro ao remover arquivo:', error)
      toast({
        title: "Erro ao remover arquivo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadFile = async (arquivo: ArquivoCliente) => {
    try {
      console.log('⬇️ [ArquivosUpload] Baixando arquivo:', arquivo.nome_arquivo)

      const { data, error } = await supabase.storage
        .from('cliente-arquivos')
        .download(arquivo.caminho_arquivo)

      if (error) {
        console.error('❌ [ArquivosUpload] Erro ao baixar:', error)
        throw error
      }

      // Criar URL para download
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = arquivo.nome_arquivo
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('✅ [ArquivosUpload] Download concluído')

    } catch (error) {
      console.error('❌ [ArquivosUpload] Erro ao baixar arquivo:', error)
      toast({
        title: "Erro ao baixar arquivo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    }
  }

  // Separar arquivos por autor
  const arquivosCliente = arquivos.filter(arquivo => arquivo.author_type === 'cliente')
  const arquivosGestor = arquivos.filter(arquivo => arquivo.author_type === 'gestor')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio de Materiais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Envie imagens e vídeos do seu produto para criação dos materiais publicitários
          </p>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formatos aceitos: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WMV (máx. 50MB)
          </p>
        </div>

        {uploading && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm text-blue-600">Enviando arquivos...</p>
            </div>
          </div>
        )}

        {/* Seção: Seus Arquivos Enviados */}
        {arquivosCliente.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Seus Arquivos Enviados ({arquivosCliente.length})</h4>
            {arquivosCliente.map((arquivo) => (
              <div key={arquivo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(arquivo.tipo_arquivo)}
                  <div>
                    <p className="text-sm font-medium">{arquivo.nome_arquivo}</p>
                    <p className="text-xs text-gray-500">
                      {arquivo.tamanho_arquivo && formatFileSize(arquivo.tamanho_arquivo)} • 
                      {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadFile(arquivo)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(arquivo)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seção: Criativos da Equipe */}
        {arquivosGestor.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-700">Criativos da Equipe ({arquivosGestor.length})</h4>
            <p className="text-xs text-gray-600">Materiais enviados pela nossa equipe para sua campanha.</p>
            {arquivosGestor.map((arquivo) => (
              <div key={arquivo.id} className="flex items-center justify-between p-3 border-2 border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-center gap-3">
                  {getFileIcon(arquivo.tipo_arquivo)}
                  <div>
                    <p className="text-sm font-medium">{arquivo.nome_arquivo}</p>
                    <p className="text-xs text-gray-500">
                      {arquivo.tamanho_arquivo && formatFileSize(arquivo.tamanho_arquivo)} • 
                      {new Date(arquivo.created_at).toLocaleDateString('pt-BR')} • 
                      <span className="text-purple-600">Equipe</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadFile(arquivo)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {arquivos.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Nenhum arquivo enviado ainda.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
