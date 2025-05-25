import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { FileText, Image, Video, Download, Eye, Calendar, User, Upload, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

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
  author_type: 'cliente' | 'gestor'
}

interface VendaCliente {
  id: string
  produto_vendido: string
  valor_venda: number
  data_venda: string
  observacoes: string
  created_at: string
}

interface BriefingMaterialsModalProps {
  emailCliente: string
  nomeCliente: string
  trigger: React.ReactNode
  filterType?: 'briefing' | 'creative' | 'all'
  allowManagerUpload?: boolean
}

export function BriefingMaterialsModal({ 
  emailCliente, 
  nomeCliente, 
  trigger, 
  filterType = 'all',
  allowManagerUpload = false
}: BriefingMaterialsModalProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [vendas, setVendas] = useState<VendaCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchClientData = async () => {
    if (!emailCliente || !open) return

    setLoading(true)
    try {
      if (filterType === 'briefing' || filterType === 'all') {
        const { data: briefingData, error: briefingError } = await supabase
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .single()

        if (briefingError && briefingError.code !== 'PGRST116') {
          console.error('Erro ao buscar briefing:', briefingError)
        } else {
          setBriefing(briefingData)
        }
      }

      // Buscar arquivos apenas se for tipo 'creative' ou 'all'
      if (filterType === 'creative' || filterType === 'all') {
        const { data: arquivosData, error: arquivosError } = await supabase
          .from('arquivos_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .order('created_at', { ascending: false })

        if (arquivosError) {
          console.error('Erro ao buscar arquivos:', arquivosError)
        } else {
          // Filtrar apenas imagens e vídeos para o tipo 'creative'
          if (filterType === 'creative') {
            const mediaFiles = arquivosData?.filter(arquivo => 
              arquivo.tipo_arquivo.startsWith('image/') || arquivo.tipo_arquivo.startsWith('video/')
            ) || []
            setArquivos(mediaFiles)
          } else {
            setArquivos(arquivosData || [])
          }
        }
      }

      if (filterType === 'all') {
        const { data: vendasData, error: vendasError } = await supabase
          .from('vendas_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .order('data_venda', { ascending: false })

        if (vendasError) {
          console.error('Erro ao buscar vendas:', vendasError)
        } else {
          setVendas(vendasData || [])
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
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
    fetchClientData()
  }, [open, emailCliente, filterType])

  // Function to sanitize email for use in file paths
  const sanitizeEmailForPath = (email: string) => {
    return email.replace(/[@.]/g, '_')
  }

  // Manager file upload functionality
  const handleManagerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          // Validar tipo de arquivo
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
          ]
          
          if (!allowedTypes.includes(file.type)) {
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
            toast({
              title: "Arquivo muito grande",
              description: `O arquivo ${file.name} deve ter no máximo 50MB.`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          // Sanitize email and create file path
          const sanitizedEmail = sanitizeEmailForPath(emailCliente)
          const timestamp = Date.now()
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const fileName = `manager-${timestamp}-${sanitizedFileName}`
          const filePath = `${sanitizedEmail}/${fileName}`

          console.log('📁 [BriefingMaterialsModal] Manager uploading file:', { 
            originalEmail: emailCliente, 
            sanitizedEmail, 
            fileName, 
            filePath,
            fileSize: file.size,
            fileType: file.type
          })

          // Upload para o Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('❌ [BriefingMaterialsModal] Erro no upload:', uploadError)
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [BriefingMaterialsModal] Upload concluído:', uploadData)

          // Salvar informações do arquivo no banco com author_type = 'gestor'
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
            console.error('❌ [BriefingMaterialsModal] Erro ao salvar no banco:', dbError)
            // Tentar remover o arquivo do storage se falhou no banco
            await supabase.storage
              .from('cliente-arquivos')
              .remove([filePath])
            
            toast({
              title: "Erro ao salvar arquivo",
              description: `Falha ao registrar ${file.name} no banco de dados.`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [BriefingMaterialsModal] Arquivo registrado no banco (gestor):', fileName)
          successCount++

        } catch (fileError) {
          console.error('❌ [BriefingMaterialsModal] Erro ao processar arquivo:', file.name, fileError)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload concluído!",
          description: `${successCount} arquivo(s) enviado(s) com sucesso.`,
        })
        fetchClientData() // Refresh data
      }

      if (errorCount > 0) {
        toast({
          title: "Alguns arquivos falharam",
          description: `${errorCount} arquivo(s) não puderam ser enviados.`,
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('💥 [BriefingMaterialsModal] Erro geral no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Erro inesperado. Tente novamente em alguns instantes.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Limpar o input
      e.target.value = ''
    }
  }

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
    return <FileText className="w-4 h-4 text-gray-600" />
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
      console.error('Erro ao baixar arquivo:', error)
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
      console.error('Erro ao visualizar arquivo:', error)
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
    switch (filterType) {
      case 'briefing':
        return briefing !== null
      case 'creative':
        return arquivos.length > 0
      default:
        return briefing || arquivos.length > 0 || vendas.length > 0
    }
  }

  const getEmptyMessage = () => {
    switch (filterType) {
      case 'briefing':
        return {
          title: "Briefing não enviado",
          description: "O cliente ainda não enviou o briefing do produto."
        }
      case 'creative':
        return {
          title: "Materiais criativos não enviados",
          description: "O cliente ainda não enviou imagens ou vídeos."
        }
      default:
        return {
          title: "Nenhum material encontrado",
          description: "Este cliente ainda não enviou briefing ou materiais."
        }
    }
  }

  // Separate files by author type
  const clienteFiles = arquivos.filter(arquivo => arquivo.author_type === 'cliente')
  const gestorFiles = arquivos.filter(arquivo => arquivo.author_type === 'gestor')

  const renderFileGrid = (files: ArquivoCliente[], title: string, emptyMessage: string) => {
    if (files.length === 0) {
      return (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <h5 className="font-medium text-sm text-muted-foreground">{title} ({files.length})</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((arquivo) => (
            <div key={arquivo.id} className="border rounded-lg p-3">
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
    )
  }

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
              {/* Briefing - apenas para tipo 'briefing' ou 'all' */}
              {(filterType === 'briefing' || filterType === 'all') && briefing && (
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
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{briefing.nome_produto}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Investimento Diário</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          R$ {briefing.investimento_diario?.toFixed(2) || 'Não informado'}
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

              {/* Vendas - apenas para tipo 'all' */}
              {filterType === 'all' && vendas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Histórico de Vendas ({vendas.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vendas.map((venda) => (
                        <div key={venda.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-sm">{venda.produto_vendido}</h5>
                            <div className="text-right">
                              <p className="font-medium text-green-600">R$ {venda.valor_venda.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {venda.observacoes && (
                            <p className="text-xs text-gray-600 mt-2">{venda.observacoes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Arquivos - para tipo 'creative' (apenas mídia) ou 'all' (todos os arquivos) */}
              {(filterType === 'creative' || filterType === 'all') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="w-5 h-5 text-purple-600" />
                        {filterType === 'creative' ? 'Materiais Criativos' : 'Materiais Enviados'}
                      </div>
                      {allowManagerUpload && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleManagerFileUpload}
                            disabled={uploading}
                            className="hidden"
                            id="manager-upload"
                          />
                          <Button
                            onClick={() => document.getElementById('manager-upload')?.click()}
                            disabled={uploading}
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {uploading ? 'Enviando...' : 'Adicionar Arquivo'}
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Client files */}
                    {renderFileGrid(
                      clienteFiles,
                      "Materiais enviados pelo cliente",
                      "Nenhum material enviado pelo cliente ainda."
                    )}
                    
                    {/* Separator if both sections have content or manager upload is allowed */}
                    {(clienteFiles.length > 0 && gestorFiles.length > 0) || allowManagerUpload && (
                      <Separator />
                    )}
                    
                    {/* Manager files */}
                    {(gestorFiles.length > 0 || allowManagerUpload) && renderFileGrid(
                      gestorFiles,
                      "Materiais adicionados pela equipe",
                      allowManagerUpload ? "Adicione materiais usando o botão acima." : "Nenhum material adicionado pela equipe ainda."
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
