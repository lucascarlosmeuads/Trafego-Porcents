
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Image, Video, Download, Eye, Calendar, User, Upload, Loader2, MessageSquare, CheckCircle, XCircle, Palette, Type, Monitor, Smartphone } from 'lucide-react'
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
  quer_site: boolean
  nome_marca: string
  resumo_conversa_vendedor: string
  forma_pagamento: string
  tipo_prestacao_servico: string
  localizacao_divulgacao: string
  // Novos campos da etapa 2
  direcionamento_campanha: string
  abrangencia_atendimento: string
  possui_facebook: boolean
  possui_instagram: boolean
  utiliza_whatsapp_business: boolean
  // Novos campos da etapa 3
  criativos_prontos: boolean
  videos_prontos: boolean
  cores_desejadas: string
  tipo_fonte: string
  cores_proibidas: string
  fonte_especifica: string
  estilo_visual: string
  tipos_imagens_preferidas: string[]
  etapa_atual: number
  formulario_completo: boolean
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
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [arquivosLoading, setArquivosLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchBriefing = async () => {
    if (!emailCliente) {
      console.log('❌ [BriefingMaterialsModal] Email do cliente não fornecido')
      return
    }

    setBriefingLoading(true)
    console.log('🚀 [BriefingMaterialsModal] BUSCANDO BRIEFING PREENCHIDO PELO CLIENTE para:', emailCliente)
    
    try {
      // CORREÇÃO: Busca mais robusta com case-insensitive e trim
      const emailNormalizado = emailCliente.trim().toLowerCase()
      console.log('🔍 [BriefingMaterialsModal] Email normalizado para busca:', emailNormalizado)
      
      const { data: briefingData, error: briefingError } = await supabase
        .from('briefings_cliente')
        .select('*')
        .ilike('email_cliente', emailNormalizado)
        .maybeSingle()

      console.log('🔍 [BriefingMaterialsModal] Resultado da busca do briefing:', {
        email: emailNormalizado,
        encontrou: !!briefingData,
        erro: briefingError,
        dados: briefingData ? {
          produto: briefingData.nome_produto,
          investimento: briefingData.investimento_diario,
          criado_em: briefingData.created_at,
          resumo_conversa: briefingData.resumo_conversa_vendedor ? 'SIM' : 'NÃO'
        } : null
      })

      if (briefingError) {
        console.error('❌ [BriefingMaterialsModal] Erro ao buscar briefing:', briefingError)
        
        // Se não encontrou com ilike, tentar busca exata como fallback
        console.log('🔄 [BriefingMaterialsModal] Tentando busca exata como fallback...')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .maybeSingle()
          
        if (fallbackError) {
          console.error('❌ [BriefingMaterialsModal] Erro na busca fallback:', fallbackError)
          setBriefing(null)
        } else {
          console.log('✅ [BriefingMaterialsModal] BRIEFING ENCONTRADO via fallback!')
          setBriefing(fallbackData)
        }
      } else if (briefingData) {
        console.log('✅ [BriefingMaterialsModal] BRIEFING ENCONTRADO! Cliente preencheu o formulário.')
        setBriefing(briefingData)
      } else {
        console.log('⚠️ [BriefingMaterialsModal] Nenhum briefing encontrado - cliente ainda não preencheu o formulário')
        setBriefing(null)
      }
    } catch (error) {
      console.error('💥 [BriefingMaterialsModal] Erro crítico ao buscar briefing:', error)
      setBriefing(null)
    } finally {
      setBriefingLoading(false)
    }
  }

  const fetchArquivos = async () => {
    if (!emailCliente) return

    setArquivosLoading(true)
    console.log('📁 [BriefingMaterialsModal] Buscando arquivos para:', emailCliente)
    
    try {
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
    } catch (error) {
      console.error('💥 [BriefingMaterialsModal] Erro crítico ao buscar arquivos:', error)
      setArquivos([])
    } finally {
      setArquivosLoading(false)
    }
  }

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (open && emailCliente) {
      console.log('🔓 [BriefingMaterialsModal] Modal aberto - buscando dados para:', emailCliente)
      
      setLoading(true)
      setBriefing(null)
      setArquivos([])

      const fetchAllData = async () => {
        try {
          // SEMPRE buscar o briefing quando não for filterType 'creative'
          if (filterType !== 'creative') {
            console.log('📋 [BriefingMaterialsModal] Buscando briefing (filterType não é creative)')
            await fetchBriefing()
          } else {
            console.log('🎨 [BriefingMaterialsModal] Pulando busca de briefing (filterType = creative)')
          }
          
          // Buscar arquivos se necessário
          if (filterType !== 'briefing') {
            console.log('📁 [BriefingMaterialsModal] Buscando arquivos')
            await fetchArquivos()
          } else {
            console.log('📋 [BriefingMaterialsModal] Pulando busca de arquivos (filterType = briefing)')
          }
        } catch (error) {
          console.error('💥 [BriefingMaterialsModal] Erro na busca completa:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchAllData()
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

  const validateManagerFile = (file: File) => {
    console.log('🔍 [BriefingMaterialsModal] Validando arquivo do gestor:', {
      nome: file.name,
      tipo: file.type,
      tamanho: file.size
    })

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf'
    ]
    
    // Validação especial para PDFs
    const isValidPDF = file.type === 'application/pdf' || 
                      (file.name.toLowerCase().endsWith('.pdf') && 
                       (file.type === 'application/pdf' || file.type === '' || file.type === 'application/octet-stream'))
    
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'wmv', 'pdf']
    
    if (!allowedTypes.includes(file.type) && !isValidPDF && !allowedExtensions.includes(fileExtension || '')) {
      return {
        valid: false,
        message: `Tipo de arquivo não permitido: ${file.name} (${file.type || 'tipo não detectado'})`
      }
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      return {
        valid: false,
        message: `Arquivo muito grande: ${file.name} deve ter no máximo 2GB.`
      }
    }

    return { valid: true, message: '' }
  }

  const handleManagerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    console.log('🚀 [BriefingMaterialsModal] Gestor iniciando upload de', files.length, 'arquivo(s)')

    try {
      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          console.log('📤 [BriefingMaterialsModal] Processando arquivo do gestor:', {
            nome: file.name,
            tipo: file.type,
            isPDF: file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
          })

          const validation = validateManagerFile(file)
          if (!validation.valid) {
            toast({
              title: "Arquivo rejeitado",
              description: validation.message,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          const sanitizedEmail = sanitizeEmailForPath(emailCliente)
          const fileName = `gestor_${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${sanitizedEmail}/${fileName}`

          console.log('📤 [BriefingMaterialsModal] Enviando arquivo do gestor para storage:', filePath)

          const { error: uploadError } = await supabase.storage
            .from('cliente-arquivos')
            .upload(filePath, file, {
              contentType: file.type || undefined
            })

          if (uploadError) {
            console.error('❌ [BriefingMaterialsModal] Erro no upload do gestor:', uploadError)
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          const { error: dbError } = await supabase
            .from('arquivos_cliente')
            .insert({
              email_cliente: emailCliente,
              nome_arquivo: file.name,
              caminho_arquivo: filePath,
              tipo_arquivo: file.type || 'application/octet-stream',
              tamanho_arquivo: file.size,
              author_type: 'gestor'
            })

          if (dbError) {
            try {
              await supabase.storage
                .from('cliente-arquivos')
                .remove([filePath])
            } catch (cleanupError) {
              console.error('❌ Erro ao limpar storage:', cleanupError)
            }
            
            toast({
              title: "Erro ao salvar arquivo",
              description: `Falha ao registrar ${file.name}: ${dbError.message}`,
              variant: "destructive"
            })
            errorCount++
            continue
          }

          console.log('✅ [BriefingMaterialsModal] Arquivo do gestor salvo com sucesso:', file.name)
          successCount++

        } catch (fileError) {
          console.error('❌ Erro ao processar arquivo:', file.name, fileError)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload concluído!",
          description: `${successCount} arquivo(s) enviado(s) com sucesso.`,
        })
        fetchArquivos()
      } else if (errorCount > 0) {
        toast({
          title: "Falha no upload",
          description: "Nenhum arquivo foi enviado com sucesso.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('💥 Erro crítico no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
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
      console.error('❌ Erro ao baixar arquivo:', error)
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
      console.error('❌ Erro ao visualizar arquivo:', error)
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

  const formatFormaPagamento = (forma: string) => {
    switch (forma) {
      case 'cartao':
        return 'Cartão de Crédito'
      case 'boleto':
        return 'Boleto'
      case 'pix':
        return 'Pix'
      default:
        return forma || 'Não informado'
    }
  }

  const formatTipoPrestacao = (tipo: string) => {
    switch (tipo) {
      case 'presencial':
        return 'Presencial'
      case 'online':
        return 'Online'
      case 'hibrido':
        return 'Híbrido'
      default:
        return tipo || 'Não informado'
    }
  }

  const formatDirecionamentoCampanha = (direcionamento: string) => {
    switch (direcionamento) {
      case 'whatsapp':
        return 'WhatsApp'
      case 'site':
        return 'Site'
      default:
        return direcionamento || 'Não informado'
    }
  }

  const formatAbrangenciaAtendimento = (abrangencia: string) => {
    switch (abrangencia) {
      case 'brasil':
        return 'Todo o Brasil'
      case 'regiao':
        return 'Somente sua região'
      default:
        return abrangencia || 'Não informado'
    }
  }

  const formatTipoFonte = (tipo: string) => {
    switch (tipo) {
      case 'moderna':
        return 'Moderna'
      case 'serifada':
        return 'Serifada'
      case 'bold':
        return 'Bold'
      case 'minimalista':
        return 'Minimalista'
      case 'tech':
        return 'Tech'
      case 'retro':
        return 'Retrô'
      default:
        return tipo || 'Não informado'
    }
  }

  const formatEstiloVisual = (estilo: string) => {
    switch (estilo) {
      case 'limpo':
        return 'Visual Limpo'
      case 'elementos':
        return 'Visual com Mais Elementos'
      default:
        return estilo || 'Não informado'
    }
  }

  const formatTiposImagens = (tipos: string[]) => {
    if (!tipos || tipos.length === 0) return 'Não informado'
    
    const labels: { [key: string]: string } = {
      'pessoas-reais': 'Pessoas reais',
      'mockups-produto': 'Mockups de produto',
      'vetores-ilustrativos': 'Vetores ilustrativos',
      'fundos-texturizados': 'Fundos texturizados',
      'outro': 'Outro'
    }
    
    return tipos.map(tipo => labels[tipo] || tipo).join(', ')
  }

  const arquivosCliente = arquivos.filter(arquivo => arquivo.author_type === 'cliente')
  const arquivosGestor = arquivos.filter(arquivo => arquivo.author_type === 'gestor')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {getModalTitle()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{emailCliente}</p>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* SEÇÃO DO BRIEFING - SEMPRE RENDERIZADA quando não for filterType 'creative' */}
            {filterType !== 'creative' && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <FileText className="w-5 h-5" />
                    📝 Formulário Completo Preenchido pelo Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {briefingLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-green-600">Carregando formulário...</p>
                    </div>
                  ) : briefing ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Calendar className="w-3 h-3" />
                        Preenchido em {new Date(briefing.created_at).toLocaleDateString('pt-BR')}
                        {briefing.updated_at !== briefing.created_at && (
                          <span>• Atualizado em {new Date(briefing.updated_at).toLocaleDateString('pt-BR')}</span>
                        )}
                        {briefing.formulario_completo && (
                          <Badge className="bg-green-100 text-green-800 ml-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completo
                          </Badge>
                        )}
                      </div>

                      {/* ETAPA 1 - INFORMAÇÕES DO NEGÓCIO */}
                      <Card className="bg-blue-50 border-2 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-blue-700 text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Etapa 1 - Informações do Negócio
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* RESUMO DA CONVERSA COM VENDEDOR */}
                          {briefing.resumo_conversa_vendedor && (
                            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                              <h4 className="font-semibold text-sm mb-2 text-purple-700 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                💬 Resumo da Conversa com Vendedor
                              </h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200 whitespace-pre-wrap">
                                {briefing.resumo_conversa_vendedor}
                              </p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-blue-700">📦 Nome do Produto</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200">
                                {briefing.nome_produto || 'Não informado'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-blue-700">🏷️ Nome da Marca</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200">
                                {briefing.nome_marca || 'Não informado'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-blue-700">📝 Descrição Resumida</h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200 whitespace-pre-wrap">
                              {briefing.descricao_resumida || 'Não informado'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-blue-700">🎯 Público-Alvo</h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200 whitespace-pre-wrap">
                              {briefing.publico_alvo || 'Não informado'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-blue-700">⭐ Diferencial do Produto</h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200 whitespace-pre-wrap">
                              {briefing.diferencial || 'Não informado'}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-blue-700">🌐 Quer um site?</h4>
                              <Badge variant={briefing.quer_site ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                                {briefing.quer_site ? '✅ Sim' : '❌ Não'}
                              </Badge>
                            </div>
                          </div>
                          
                          {briefing.observacoes_finais && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-blue-700">💬 Observações Finais</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-blue-200 whitespace-pre-wrap">
                                {briefing.observacoes_finais}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* ETAPA 2 - INFORMAÇÕES DA CAMPANHA */}
                      <Card className="bg-orange-50 border-2 border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-orange-700 text-lg flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            Etapa 2 - Informações da Campanha
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">💰 Investimento Diário</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                R$ {briefing.investimento_diario ? briefing.investimento_diario.toFixed(2) : 'Não informado'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">🎯 Direcionamento</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                {formatDirecionamentoCampanha(briefing.direcionamento_campanha)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">🌍 Abrangência</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                {formatAbrangenciaAtendimento(briefing.abrangencia_atendimento)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">💳 Forma de Pagamento</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                {formatFormaPagamento(briefing.forma_pagamento)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">📍 Tipo de Prestação</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                {formatTipoPrestacao(briefing.tipo_prestacao_servico)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-orange-700">🌎 Localização</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-200">
                                {briefing.localizacao_divulgacao || 'Não informado'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-3 text-orange-700">📱 Redes Sociais e Ferramentas</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={briefing.possui_facebook ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                                {briefing.possui_facebook ? '✅' : '❌'} Facebook
                              </Badge>
                              <Badge variant={briefing.possui_instagram ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                                {briefing.possui_instagram ? '✅' : '❌'} Instagram
                              </Badge>
                              <Badge variant={briefing.utiliza_whatsapp_business ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                                {briefing.utiliza_whatsapp_business ? '✅' : '❌'} WhatsApp Business
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* ETAPA 3 - CRIATIVOS E DESIGN */}
                      <Card className="bg-purple-50 border-2 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-purple-700 text-lg flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Etapa 3 - Criativos e Design
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-3 text-purple-700">🎨 Materiais Disponíveis</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant={briefing.criativos_prontos ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                                {briefing.criativos_prontos ? '✅' : '❌'} Criativos Prontos
                              </Badge>
                              <Badge variant={briefing.videos_prontos ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                                {briefing.videos_prontos ? '✅' : '❌'} Vídeos Prontos
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-purple-700 flex items-center gap-1">
                                <Palette className="w-4 h-4" />
                                Cores Desejadas
                              </h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                                {briefing.cores_desejadas || 'Não informado'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-purple-700 flex items-center gap-1">
                                <Type className="w-4 h-4" />
                                Tipo de Fonte
                              </h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                                {formatTipoFonte(briefing.tipo_fonte)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-purple-700">🚫 Cores Proibidas</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                                {briefing.cores_proibidas || 'Nenhuma restrição'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-purple-700">✍️ Fonte Específica</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                                {briefing.fonte_especifica || 'Sem preferência'}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-purple-700">🎨 Estilo Visual</h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                              {formatEstiloVisual(briefing.estilo_visual)}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-purple-700">🖼️ Tipos de Imagens Preferidas</h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-purple-200">
                              {formatTiposImagens(briefing.tipos_imagens_preferidas)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* INFORMAÇÕES ADICIONAIS */}
                      {briefing.comissao_aceita && (
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-green-700">💼 Comissão Aceita:</h4>
                          <Badge variant={briefing.comissao_aceita === 'sim' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                            {briefing.comissao_aceita === 'sim' ? '✅ Sim' : briefing.comissao_aceita === 'nao' ? '❌ Não' : briefing.comissao_aceita || '❓ Não informado'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">Formulário ainda não preenchido</p>
                      <p className="text-sm text-gray-500">O cliente ainda não preencheu o formulário de gestão de tráfego.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SEÇÃO DE MATERIAIS CRIATIVOS */}
            {filterType !== 'briefing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" />
                    🎨 Materiais Criativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload pelo gestor */}
                  {(isAdmin || user?.email) && (
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-purple-700">📤 Adicionar Criativos da Equipe</h4>
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,application/pdf"
                        onChange={handleManagerFileUpload}
                        disabled={uploading}
                        className="mb-2"
                      />
                      <p className="text-xs text-purple-600">
                        Envie materiais para o cliente: imagens, vídeos ou PDFs (máx. 2GB por arquivo)
                      </p>
                      {uploading && (
                        <div className="flex items-center gap-2 mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <p className="text-sm text-purple-600">Enviando arquivos...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {arquivosLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando arquivos...</p>
                    </div>
                  ) : (
                    <>
                      {/* Materiais do cliente */}
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

                      {/* Criativos da equipe */}
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

                      {arquivos.length === 0 && (
                        <div className="text-center py-6">
                          <Image className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">Nenhum material criativo encontrado</p>
                          <p className="text-sm text-gray-500">O cliente ainda não enviou imagens, vídeos ou PDFs.</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
