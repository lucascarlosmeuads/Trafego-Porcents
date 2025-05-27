import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload, FileText, Image, Video, Trash2, Loader2 } from 'lucide-react'
import type { ArquivoCliente } from '@/hooks/useClienteData'

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
    if (tipo === 'application/pdf') return <FileText className="w-4 h-4 text-red-600" />
    return <FileText className="w-4 h-4" />
  }

  const sanitizeEmailForPath = (email: string) => {
    return email.replace(/[@.]/g, '_')
  }

  const validateFile = (file: File) => {
    console.log('🔍 [ArquivosUpload] Validando arquivo:', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      tipoDetectado: file.type || 'MIME type não detectado'
    })

    // Lista expandida de tipos permitidos com validações específicas para PDF
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf'
    ]
    
    // Validação especial para PDFs - verificar extensão também
    const isValidPDF = file.type === 'application/pdf' || 
                      (file.name.toLowerCase().endsWith('.pdf') && 
                       (file.type === 'application/pdf' || file.type === '' || file.type === 'application/octet-stream'))
    
    // Validação por extensão como backup
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'pdf']
    
    if (!allowedTypes.includes(file.type) && !isValidPDF && !allowedExtensions.includes(fileExtension || '')) {
      console.error('❌ [ArquivosUpload] Tipo não permitido:', {
        tipo: file.type,
        extensao: fileExtension,
        nome: file.name
      })
      return {
        valid: false,
        message: `Tipo de arquivo não permitido. Arquivo: ${file.name} (${file.type || 'tipo não detectado'}). Formatos aceitos: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WMV, PDF`
      }
    }

    // Validação de tamanho (máximo 2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      console.error('❌ [ArquivosUpload] Arquivo muito grande:', file.size)
      return {
        valid: false,
        message: `Arquivo muito grande. ${file.name} deve ter no máximo 2GB.`
      }
    }

    // Log para PDFs válidos
    if (isValidPDF) {
      console.log('✅ [ArquivosUpload] PDF válido detectado:', file.name)
    }

    return { valid: true, message: '' }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    console.log('🚀 [ArquivosUpload] Iniciando upload de', files.length, 'arquivo(s) para cliente:', emailCliente)

    try {
      // Verificar sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [ArquivosUpload] Erro ao verificar sessão:', sessionError)
        throw new Error('Erro de autenticação. Faça login novamente.')
      }

      if (!session?.user) {
        console.error('❌ [ArquivosUpload] Usuário não autenticado')
        throw new Error('Você precisa estar logado para enviar arquivos.')
      }

      console.log('✅ [ArquivosUpload] Usuário autenticado:', session.user.email)

      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          console.log('📤 [ArquivosUpload] Processando arquivo:', {
            nome: file.name,
            tipo: file.type,
            tamanho: formatFileSize(file.size),
            isPDF: file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
          })

          // Validar arquivo
          const validation = validateFile(file)
          if (!validation.valid) {
            toast({
              title: "Arquivo rejeitado",
              description: validation.message,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          // Preparar caminho do arquivo
          const sanitizedEmail = sanitizeEmailForPath(emailCliente)
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${sanitizedEmail}/${fileName}`

          console.log('📤 [ArquivosUpload] Enviando para storage:', {
            caminho: filePath,
            bucket: 'cliente-arquivos',
            tipo: file.type,
            tamanho: file.size
          })

          // Upload para o Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || undefined
            })

          if (uploadError) {
            console.error('❌ [ArquivosUpload] Erro no upload para storage:', {
              erro: uploadError,
              arquivo: file.name,
              caminho: filePath
            })
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [ArquivosUpload] Upload para storage concluído:', {
            caminho: uploadData.path,
            arquivo: file.name
          })

          // Salvar no banco de dados
          console.log('💾 [ArquivosUpload] Salvando no banco de dados...')
          
          const { data: dbData, error: dbError } = await supabase
            .from('arquivos_cliente')
            .insert({
              email_cliente: emailCliente,
              nome_arquivo: file.name,
              caminho_arquivo: filePath,
              tipo_arquivo: file.type || 'application/octet-stream',
              tamanho_arquivo: file.size,
              author_type: 'cliente'
            })
            .select()

          if (dbError) {
            console.error('❌ [ArquivosUpload] Erro ao salvar no banco:', {
              erro: dbError,
              arquivo: file.name
            })
            
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
            continue
          }

          console.log('✅ [ArquivosUpload] Arquivo salvo com sucesso no banco:', {
            id: dbData[0]?.id,
            arquivo: file.name,
            tipo: file.type
          })
          successCount++

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
        
        // Atualizar a lista de arquivos
        onArquivosUpdated()
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
            Envie imagens, vídeos e PDFs do seu produto para criação dos materiais publicitários
          </p>
          <Input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="max-w-xs mx-auto"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formatos aceitos: JPG, PNG, GIF, WebP, MP4, AVI, MOV, WMV, PDF (máx. 2GB por arquivo)
          </p>
          {uploading && (
            <div className="mt-4 text-center py-2">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">Enviando arquivos...</p>
              </div>
            </div>
          )}
        </div>

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
