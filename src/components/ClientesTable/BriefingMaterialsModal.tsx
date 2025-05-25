
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Image, Video, Download, Eye, Calendar, User } from 'lucide-react'
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
}

export function BriefingMaterialsModal({ emailCliente, nomeCliente, trigger }: BriefingMaterialsModalProps) {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [vendas, setVendas] = useState<VendaCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchClientData = async () => {
    if (!emailCliente || !open) return

    setLoading(true)
    try {
      // Buscar briefing
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

      // Buscar arquivos
      const { data: arquivosData, error: arquivosError } = await supabase
        .from('arquivos_cliente')
        .select('*')
        .eq('email_cliente', emailCliente)
        .order('created_at', { ascending: false })

      if (arquivosError) {
        console.error('Erro ao buscar arquivos:', arquivosError)
      } else {
        setArquivos(arquivosData || [])
      }

      // Buscar vendas
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
  }, [open, emailCliente])

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
        .createSignedUrl(arquivo.caminho_arquivo, 60) // URL válida por 1 hora

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

  const hasMaterials = briefing || arquivos.length > 0 || vendas.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Materiais de {nomeCliente}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{emailCliente}</p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Carregando materiais...</p>
            </div>
          ) : !hasMaterials ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">Nenhum material encontrado</p>
              <p className="text-sm text-gray-500">Este cliente ainda não enviou briefing ou materiais.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Briefing */}
              {briefing && (
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

              {/* Vendas */}
              {vendas.length > 0 && (
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

              {/* Arquivos */}
              {arquivos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-purple-600" />
                      Materiais Enviados ({arquivos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {arquivos.map((arquivo) => (
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
