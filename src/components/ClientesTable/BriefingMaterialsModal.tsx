import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Image, Video, Download, Eye, Calendar, User, Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface BriefingData {
  nome_produto: string
  descricao_resumida: string
  publico_alvo: string
  diferencial: string
  investimento_diario: number
  comissao_aceita: string
  observacoes_finais: string
  created_at: string
  updated_at: string
}

interface ArquivoCliente {
  id: string
  nome_arquivo: string
  caminho_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  created_at: string
  author_type: string
}

interface BriefingMaterialsModalProps {
  emailCliente: string
  nomeCliente: string
  trigger: React.ReactNode
  filterType?: 'briefing' | 'creative' | 'all'
}

export function BriefingMaterialsModal({ 
  emailCliente, 
  nomeCliente, 
  trigger, 
  filterType = 'all' 
}: BriefingMaterialsModalProps) {
  const { isAdmin, user } = useAuth()
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchClientData = async () => {
    if (!emailCliente || !open) return

    setLoading(true)
    console.log('🔍 [BriefingMaterialsModal] Carregando dados para:', emailCliente, 'filterType:', filterType)
    
    try {
      // SEMPRE buscar briefing quando modal abrir (exceto quando filterType for especificamente 'creative')
      if (filterType !== 'creative') {
        console.log('📋 [BriefingMaterialsModal] Carregando briefing...')
        const { data: briefingData, error: briefingError } = await supabase
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .maybeSingle()

        if (briefingError) {
          console.error('❌ [BriefingMaterialsModal] Erro ao buscar briefing:', briefingError)
          setBriefing(null)
        } else if (briefingData) {
          console.log('✅ [BriefingMaterialsModal] Briefing encontrado:', briefingData)
          setBriefing(briefingData)
        } else {
          console.log('📋 [BriefingMaterialsModal] Briefing não encontrado para:', emailCliente)
          setBriefing(null)
        }
      }

      // SEMPRE buscar arquivos quando filterType for 'creative' ou 'all'
      if (filterType !== 'briefing') {
        console.log('📁 [BriefingMaterialsModal] Carregando arquivos...')
        const { data: arquivosData, error: arquivosError } = await supabase
          .from('arquivos_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .order('created_at', { ascending: false })

        if (arquivosError) {
          console.error('❌ [BriefingMaterialsModal] Erro ao buscar arquivos:', arquivosError)
          setArquivos([])
        } else {
          console.log('✅ [BriefingMaterialsModal] Arquivos encontrados:', arquivosData?.length || 0)
          
          // Para tipo 'creative', filtrar apenas imagens, vídeos e PDFs
          if (filterType === 'creative') {
            const mediaFiles = arquivosData?.filter(arquivo => 
              arquivo.tipo_arquivo.startsWith('image/') || 
              arquivo.tipo_arquivo.startsWith('video/') ||
              arquivo.tipo_arquivo === 'application/pdf'
            ) || []
            setArquivos(mediaFiles)
          } else {
            setArquivos(arquivosData || [])
          }
        }
      }

    } catch (error) {
      console.error('💥 [BriefingMaterialsModal] Erro crítico:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar materiais do cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Reset states when opening modal
      setBriefing(null)
      setArquivos([])
      fetchClientData()
    }
  }, [open, emailCliente, filterType])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="w-4 h-4 text-blue-600" />
    if (tipo.startsWith('video/')) return <Video className="w-4 h-4 text-purple-600" />
    if (tipo === 'application/pdf') return <FileText className="w-4 h-4 text-red-600" />
    return <FileText className="w-4 h-4 text-gray-600" />
  }

  const sanitizeEmailForPath = (email: string) => {
    return email.replace(/[@.]/g, '_')
  }

  const handleManagerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    console.log('🚀 [Manager Upload] Iniciando upload de', files.length, 'arquivo(s)')

    try {
      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          console.log('📤 [Manager Upload] Processando arquivo:', file.name)

          // Validar tipo de arquivo (incluindo PDF)
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
            'application/pdf'
          ]
          
          if (!allowedTypes.includes(file.type)) {
            console.warn('⚠️ [Manager Upload] Tipo não permitido:', file.type)
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
            console.warn('⚠️ [Manager Upload] Arquivo muito grande:', file.size)
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
          const fileName = `gestor_${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${sanitizedEmail}/${fileName}`

          console.log('📤 [Manager Upload] Enviando para storage:', filePath)

          // Upload para o Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file)

          if (uploadError) {
            console.error('❌ [Manager Upload] Erro no upload para storage:', uploadError)
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [Manager Upload] Upload para storage concluído')
          console.log('💾 [Manager Upload] Salvando no banco de dados...')

          // Salvar informações do arquivo no banco
          const { error: dbError } = await supabase
            .from('arquivos_cliente')
            .insert({
              email_cliente: emailCliente,
              nome_arquivo: file.name,
              caminho_arquivo: filePath,
              tipo_arquivo: file.type,
              tamanho_arquivo: file.size,
              author_type: 'gestor'
            })

          if (dbError) {
            console.error('❌ [Manager Upload] Erro ao salvar no banco:', dbError)
            
            // Tentar remover o arquivo do storage se falhou no banco
            try {
              await supabase.storage
                .from('cliente-arquivos')
                .remove([filePath])
              console.log('🧹 [Manager Upload] Arquivo removido do storage após erro no banco')
            } catch (cleanupError) {
              console.error('❌ [Manager Upload] Erro ao limpar storage:', cleanupError)
            }
            
            toast({
              title: "Erro ao salvar arquivo",
              description: `Falha ao registrar ${file.name}: ${dbError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [Manager Upload] Arquivo salvo com sucesso no banco')
          successCount++

        } catch (fileError) {
          console.error('❌ [Manager Upload] Erro ao processar arquivo:', file.name, fileError)
          errorCount++
        }
      }

      // Mostrar resultado final
      if (successCount > 0) {
        toast({
          title: "Upload concluído!",
          description: `${successCount} arquivo(s) enviado(s) com sucesso.`,
        })
        console.log('🎉 [Manager Upload] Upload concluído:', successCount, 'sucessos,', errorCount, 'erros')
        
        // Refresh data
        fetchClientData()
      } else if (errorCount > 0) {
        toast({
          title: "Falha no upload",
          description: "Nenhum arquivo foi enviado com sucesso. Verifique os erros acima.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('💥 [Manager Upload] Erro crítico no upload:', error)
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

  const handleDownloadFile = async (arquivo: ArquivoCliente) => {
    try {
      const { data, error } = await supabase.storage
        .from('cliente-arquivos')
        .download(arquivo.caminho_arquivo)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = arquivo.nome_arquivo
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('❌ [BriefingMaterialsModal] Erro ao baixar arquivo:', error)
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive"
      })
    }
  }

  const handleViewFile = async (arquivo: ArquivoCliente) => {
    try {
      const { data, error } = await supabase.storage
        .from('cliente-arquivos')
        .createSignedUrl(arquivo.caminho_arquivo, 60)

      if (error) throw error

      window.open(data.signedUrl, '_blank')

    } catch (error) {
      console.error('❌ [BriefingMaterialsModal] Erro ao visualizar arquivo:', error)
      toast({
        title: "Erro ao visualizar",
        description: "Não foi possível abrir o arquivo",
        variant: "destructive"
      })
    }
  }

  const getModalTitle = () => {
    switch (filterType) {
      case 'briefing':
        return `Briefing de ${nomeCliente}`
      case 'creative':
        return `Materiais Criativos de ${nomeCliente}`
      default:
        return `Materiais de ${nomeCliente}`
    }
  }

  const hasContent = () => {
    if (loading) return true // Show loading state
    
    switch (filterType) {
      case 'briefing':
        return briefing !== null
      case 'creative':
        return arquivos.length > 0
      default:
        // Para filterType 'all', mostrar conteúdo se tem briefing OU arquivos
        return briefing !== null || arquivos.length > 0
    }
  }

  const getEmptyMessage = () => {
    switch (filterType) {
      case 'briefing':
        return {
          title: "Briefing ainda não enviado",
          description: "O cliente ainda não enviou o briefing do produto."
        }
      case 'creative':
        return {
          title: "Materiais criativos não enviados",
          description: "O cliente ainda não enviou imagens, vídeos ou PDFs."
        }
      default:
        return {
          title: "Nenhum material encontrado",
          description: "Este cliente ainda não enviou briefing ou materiais."
        }
    }
  }

  // Separar arquivos por autor apenas se filterType for 'creative' ou 'all'
  const arquivosCliente = arquivos.filter(arquivo => arquivo.author_type === 'cliente')
  const arquivosGestor = arquivos.filter(arquivo => arquivo.author_type === 'gestor')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {getModalTitle()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{emailCliente}</p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <p className="text-sm text-muted-foreground">Carregando materiais...</p>
            </div>
          ) : !hasContent() ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">{getEmptyMessage().title}</p>
              <p className="text-sm text-gray-500">{getEmptyMessage().description}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SEÇÃO DE BRIEFING - Sempre mostrar quando briefing existe e filterType não é 'creative' */}
              {filterType !== 'creative' && briefing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Briefing do Produto
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Enviado em {new Date(briefing.created_at).toLocaleDateString('pt-BR')}
                      {briefing.updated_at !== briefing.created_at && (
                        <span>• Atualizado em {new Date(briefing.updated_at).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Nome do Produto</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{briefing.nome_produto || 'Não informado'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Investimento Diário</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          R$ {briefing.investimento_diario ? briefing.investimento_diario.toFixed(2) : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Descrição Resumida</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {briefing.descricao_resumida || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Público-Alvo</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {briefing.publico_alvo || 'Não informado'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Diferencial do Produto</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {briefing.diferencial || 'Não informado'}
                      </p>
                    </div>
                    
                    {briefing.observacoes_finais && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Observações Finais</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {briefing.observacoes_finais}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">Comissão Aceita:</h4>
                      <Badge variant={briefing.comissao_aceita === 'sim' ? 'default' : 'secondary'}>
                        {briefing.comissao_aceita === 'sim' ? 'Sim' : briefing.comissao_aceita === 'nao' ? 'Não' : 'Não informado'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SEÇÃO DE MATERIAIS CRIATIVOS - APENAS quando filterType não é 'briefing' */}
              {filterType !== 'briefing' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-purple-600" />
                      Materiais Criativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload de novos arquivos pelo gestor - apenas para admins e gestores */}
                    {(isAdmin || user?.email) && (
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Upload className="w-5 h-5 text-purple-600" />
                          <h4 className="font-medium text-purple-700">Adicionar Criativos da Equipe</h4>
                        </div>
                        <Input
                          type="file"
                          multiple
                          accept="image/*,video/*,.pdf"
                          onChange={handleManagerFileUpload}
                          disabled={uploading}
                          className="mb-2"
                        />
                        <p className="text-xs text-purple-600">
                          Envie materiais para o cliente: imagens, vídeos ou PDFs (máx. 50MB por arquivo)
                        </p>
                        {uploading && (
                          <div className="flex items-center gap-2 mt-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <p className="text-sm text-purple-600">Enviando arquivos...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Materiais enviados pelo cliente */}
                    {arquivosCliente.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Materiais enviados pelo cliente ({arquivosCliente.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {arquivosCliente.map((arquivo) => (
                            <div key={arquivo.id} className="border rounded-lg p-3 bg-blue-50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(arquivo.tipo_arquivo)}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{arquivo.nome_arquivo}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(arquivo.tamanho_arquivo)} • 
                                      {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleViewFile(arquivo)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDownloadFile(arquivo)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Baixar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Criativos adicionados pela equipe */}
                    {arquivosGestor.length > 0 && (
                      <div>
                        <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Criativos da Tráfego Porcents ({arquivosGestor.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {arquivosGestor.map((arquivo) => (
                            <div key={arquivo.id} className="border-2 border-purple-300 rounded-lg p-3 bg-purple-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(arquivo.tipo_arquivo)}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{arquivo.nome_arquivo}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="secondary" className="text-xs px-1 py-0">
                                        Equipe
                                      </Badge>
                                      <p className="text-xs text-purple-600">
                                        {formatFileSize(arquivo.tamanho_arquivo)} • 
                                        {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleViewFile(arquivo)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDownloadFile(arquivo)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Baixar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {arquivos.length === 0 && !loading && filterType !== 'briefing' && (
                      <div className="text-center py-6">
                        <Image className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">Nenhum material criativo encontrado</p>
                        <p className="text-sm text-gray-500">O cliente ainda não enviou imagens, vídeos ou PDFs.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
