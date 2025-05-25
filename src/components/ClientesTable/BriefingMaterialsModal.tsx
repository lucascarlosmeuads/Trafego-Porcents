
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, User, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { BriefingDisplay } from './BriefingDisplay'
import { FileGrid } from './FileGrid'
import { ManagerFileUpload } from './ManagerFileUpload'

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
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const fetchClientData = async () => {
    if (!emailCliente || !open) return

    setLoading(true)
    console.log('🔍 [BriefingMaterialsModal] Carregando dados para:', emailCliente)
    
    try {
      // Buscar briefing apenas se for tipo 'briefing' ou 'all'
      if (filterType === 'briefing' || filterType === 'all') {
        const { data: briefingData, error: briefingError } = await supabase
          .from('briefings_cliente')
          .select('*')
          .eq('email_cliente', emailCliente)
          .single()

        if (briefingError && briefingError.code !== 'PGRST116') {
          console.error('❌ [BriefingMaterialsModal] Erro ao buscar briefing:', briefingError)
        } else {
          console.log('📋 [BriefingMaterialsModal] Briefing encontrado:', briefingData ? 'Sim' : 'Não')
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
          console.error('❌ [BriefingMaterialsModal] Erro ao buscar arquivos:', arquivosError)
        } else {
          console.log('📁 [BriefingMaterialsModal] Arquivos encontrados:', arquivosData?.length || 0)
          
          // Para tipo 'creative', filtrar apenas imagens e vídeos
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
        return briefing || arquivos.length > 0
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
          description: "O cliente ainda não enviou imagens ou vídeos."
        }
      default:
        return {
          title: "Nenhum material encontrado",
          description: "Este cliente ainda não enviou briefing ou materiais."
        }
    }
  }

  // Separar arquivos por autor
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
              {/* Briefing Section */}
              {(filterType === 'briefing' || filterType === 'all') && briefing && (
                <BriefingDisplay briefing={briefing} />
              )}

              {/* Manager Upload Section */}
              {(filterType === 'creative' || filterType === 'all') && (
                <ManagerFileUpload 
                  emailCliente={emailCliente} 
                  onUploadComplete={fetchClientData} 
                />
              )}

              {/* Files Section */}
              {(filterType === 'creative' || filterType === 'all') && (
                <div className="space-y-6">
                  {/* Arquivos do Cliente */}
                  <FileGrid
                    arquivos={arquivosCliente}
                    title="Materiais do Cliente"
                    titleColor="text-blue-700"
                    backgroundColor="bg-blue-50"
                    borderColor="border-blue-200"
                  />

                  {/* Criativos da Equipe */}
                  <FileGrid
                    arquivos={arquivosGestor}
                    title="Criativos da Equipe"
                    titleColor="text-purple-700"
                    backgroundColor="bg-purple-50"
                    borderColor="border-purple-200"
                  />
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
