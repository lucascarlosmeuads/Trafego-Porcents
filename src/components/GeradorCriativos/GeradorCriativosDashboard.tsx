import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  Wand2, 
  Image, 
  Video, 
  Download, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface DadosExtraidos {
  nome_oferta: string
  proposta_central: string
  publico_alvo: string
  headline_principal: string
  cta: string
  tom_voz: string
  beneficios: string[]
  tipo_midia: string[]
}

interface Criativo {
  id: string
  tipo_criativo: string
  nome_arquivo_pdf: string
  arquivo_url?: string
  thumbnail_url?: string
  estilo_visual: string
  status: string
  prompt_usado?: string
  dados_geracao?: any
}

export function GeradorCriativosDashboard() {
  const { user } = useAuth()
  const [etapa, setEtapa] = useState<'upload' | 'analise' | 'preview' | 'gerando' | 'resultado'>('upload')
  const [progresso, setProgresso] = useState(0)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [dadosExtraidos, setDadosExtraidos] = useState<DadosExtraidos | null>(null)
  const [criativos, setCriativos] = useState<Criativo[]>([])
  const [pdfAnalysisId, setPdfAnalysisId] = useState<string>('')
  const [generationId, setGenerationId] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      toast.success('PDF carregado com sucesso!')
    } else {
      toast.error('Por favor, selecione apenas arquivos PDF.')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const analisarPDF = async () => {
    if (!pdfFile || !user) return

    setEtapa('analise')
    setProgresso(20)

    try {
      // Simular upload do PDF (aqui você integraria com o storage do Supabase)
      const nomeArquivo = `${Date.now()}_${pdfFile.name}`
      const caminhoArquivo = `uploads/pdfs/${nomeArquivo}`

      // Criar registro de análise
      const { data: pdfAnalysis, error: insertError } = await supabase
        .from('pdf_analysis')
        .insert({
          email_gestor: user.email!,
          nome_arquivo: pdfFile.name,
          caminho_arquivo: caminhoArquivo,
          status: 'analisando'
        })
        .select()
        .single()

      if (insertError) {
        throw new Error('Erro ao criar análise: ' + insertError.message)
      }

      setPdfAnalysisId(pdfAnalysis.id)
      setProgresso(50)

      // Chamar edge function para análise
      const { data, error } = await supabase.functions.invoke('pdf-analyzer', {
        body: { pdf_analysis_id: pdfAnalysis.id }
      })

      if (error) {
        throw new Error('Erro na análise: ' + error.message)
      }

      setDadosExtraidos(data.dados_extraidos)
      setProgresso(100)
      setEtapa('preview')
      toast.success('PDF analisado com sucesso!')

    } catch (error: any) {
      console.error('Erro na análise:', error)
      toast.error('Erro ao analisar PDF: ' + error.message)
      setEtapa('upload')
      setProgresso(0)
    }
  }

  const iniciarGeracao = async () => {
    if (!pdfAnalysisId || !user) return

    setEtapa('gerando')
    setProgresso(0)

    try {
      // Criar sessão de geração
      const { data: generation, error: insertError } = await supabase
        .from('creative_generations')
        .insert({
          pdf_analysis_id: pdfAnalysisId,
          email_gestor: user.email!,
          status: 'iniciando',
          configuracao: {
            tipos_criativo: ['imagem', 'video'],
            quantidade_imagens: 3,
            quantidade_videos: 3
          }
        })
        .select()
        .single()

      if (insertError) {
        throw new Error('Erro ao criar sessão: ' + insertError.message)
      }

      setGenerationId(generation.id)

      // Simular progresso
      const intervalos = [20, 40, 60, 80, 95, 100]
      for (let i = 0; i < intervalos.length; i++) {
        setTimeout(() => {
          setProgresso(intervalos[i])
        }, (i + 1) * 2000)
      }

      // Chamar edge function para geração
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('creative-generator', {
            body: { generation_id: generation.id }
          })

          if (error) {
            throw new Error('Erro na geração: ' + error.message)
          }

          // Buscar criativos gerados
          const { data: criativosData, error: fetchError } = await supabase
            .from('criativos_gerados')
            .select('*')
            .eq('generation_id', generation.id)
            .order('created_at', { ascending: true })

          if (fetchError) {
            throw new Error('Erro ao buscar criativos: ' + fetchError.message)
          }

          setCriativos(criativosData as Criativo[])
          setEtapa('resultado')
          toast.success('Criativos gerados com sucesso!')

        } catch (error: any) {
          console.error('Erro na geração:', error)
          toast.error('Erro ao gerar criativos: ' + error.message)
          setEtapa('preview')
        }
      }, 12000) // 12 segundos para simular o processamento

    } catch (error: any) {
      console.error('Erro ao iniciar geração:', error)
      toast.error('Erro ao iniciar geração: ' + error.message)
      setEtapa('preview')
    }
  }

  const baixarCriativo = (criativo: Criativo) => {
    if (criativo.arquivo_url) {
      const link = document.createElement('a')
      link.href = criativo.arquivo_url
      link.download = criativo.nome_arquivo_pdf
      link.click()
      toast.success('Download iniciado!')
    }
  }

  const reiniciarProcesso = () => {
    setEtapa('upload')
    setProgresso(0)
    setPdfFile(null)
    setDadosExtraidos(null)
    setCriativos([])
    setPdfAnalysisId('')
    setGenerationId('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Wand2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gerador de Criativos IA</h1>
          <p className="text-muted-foreground">
            Crie 6 criativos automaticamente a partir do seu planejamento em PDF
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso</span>
                <span>{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-3" />
            </div>
            <Badge variant={etapa === 'resultado' ? 'default' : 'secondary'}>
              {etapa === 'upload' && 'Aguardando Upload'}
              {etapa === 'analise' && 'Analisando PDF'}
              {etapa === 'preview' && 'Revisão'}
              {etapa === 'gerando' && 'Gerando Criativos'}
              {etapa === 'resultado' && 'Concluído'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upload PDF */}
      {etapa === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>1. Upload do Planejamento</span>
            </CardTitle>
            <CardDescription>
              Envie o PDF com o planejamento da sua campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {pdfFile ? (
                <div>
                  <p className="text-lg font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button onClick={analisarPDF} className="mt-4">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Analisar PDF
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o PDF aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise em andamento */}
      {etapa === 'analise' && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-xl font-semibold mb-2">Analisando PDF</h3>
            <p className="text-muted-foreground">
              Nossa IA está extraindo as informações do seu planejamento...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview dos dados extraídos */}
      {etapa === 'preview' && dadosExtraidos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>2. Dados Extraídos</span>
            </CardTitle>
            <CardDescription>
              Revise as informações extraídas do PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da Oferta</label>
                <p className="text-muted-foreground">{dadosExtraidos.nome_oferta}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Público-Alvo</label>
                <p className="text-muted-foreground">{dadosExtraidos.publico_alvo}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Proposta Central</label>
                <p className="text-muted-foreground">{dadosExtraidos.proposta_central}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Headline Principal</label>
                <p className="text-muted-foreground">{dadosExtraidos.headline_principal}</p>
              </div>
              <div>
                <label className="text-sm font-medium">CTA</label>
                <p className="text-muted-foreground">{dadosExtraidos.cta}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={iniciarGeracao} className="flex-1">
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar Criativos
              </Button>
              <Button variant="outline" onClick={reiniciarProcesso}>
                Reiniciar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geração em andamento */}
      {etapa === 'gerando' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Wand2 className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
            <h3 className="text-xl font-semibold mb-2">Gerando Criativos</h3>
            <p className="text-muted-foreground mb-4">
              Criando 3 imagens e 3 roteiros de vídeo personalizados...
            </p>
            <div className="text-sm text-muted-foreground">
              Isso pode levar alguns minutos
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {etapa === 'resultado' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>3. Criativos Gerados</span>
              </CardTitle>
              <CardDescription>
                Seus {criativos.length} criativos estão prontos!
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Grid de criativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criativos.map((criativo, index) => (
              <Card key={criativo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {criativo.tipo_criativo === 'imagem' ? (
                      <Image className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Video className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm font-medium">
                      {criativo.tipo_criativo === 'imagem' ? 'Imagem' : 'Vídeo'} {Math.floor(index / 3) + 1}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {criativo.estilo_visual}
                    </Badge>
                  </div>

                  {criativo.tipo_criativo === 'imagem' && criativo.arquivo_url && (
                    <div className="mb-3">
                      <img 
                        src={criativo.arquivo_url} 
                        alt={`Criativo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {criativo.tipo_criativo === 'video' && (
                    <div className="mb-3 bg-muted rounded-lg p-8 text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Roteiro de 30s</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => baixarCriativo(criativo)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <Button onClick={reiniciarProcesso} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novos Criativos
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}