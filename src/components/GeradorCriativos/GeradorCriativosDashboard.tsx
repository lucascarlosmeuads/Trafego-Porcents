import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { 
  Upload, 
  FileText, 
  Wand2, 
  Download, 
  Edit3, 
  RotateCcw, 
  CheckCircle,
  Image,
  Video,
  Loader2
} from 'lucide-react'
import { PDFUploadArea } from './PDFUploadArea'
import { DataPreviewCards } from './DataPreviewCards'
import { CreativeGallery } from './CreativeGallery'

interface PDFData {
  nomeOferta: string
  propostaCentral: string
  publicoAlvo: string
  headlinePrincipal: string
  cta: string
  tomVoz: string
  beneficios: string[]
  tipoMidia: string[]
}

interface Creative {
  id: string
  type: 'image' | 'video' | 'anuncio_completo'
  thumbnail: string
  title: string
  style: string
  status: 'generating' | 'ready' | 'error'
  url?: string
  headline?: string
  subheadline?: string
  copy?: string
  cta?: string
}

export function GeradorCriativosDashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<PDFData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const userEmail = user?.email || 'admin@trafegoporcents.com'

  const handleFileUpload = async (file: File) => {
    try {
      setUploadedFile(file)
      setIsAnalyzing(true)

      console.log('📤 [Dashboard] Iniciando upload do PDF:', file.name)

      // Upload do arquivo para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `pdfs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('cliente-arquivos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      console.log('✅ [Dashboard] Upload concluído, analisando com IA...')

      // Chamar edge function para análise
      const { data: analysisResponse, error: analysisError } = await supabase.functions
        .invoke('pdf-analyzer', {
          body: {
            filePath: filePath,
            emailGestor: userEmail
          }
        })

      if (analysisError) {
        throw new Error(`Erro na análise: ${analysisError.message}`)
      }

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Erro na análise do PDF')
      }

      console.log('🎯 [Dashboard] Análise concluída:', analysisResponse.dadosExtraidos)

      setPdfData(analysisResponse.dadosExtraidos)
      setAnalysisId(analysisResponse.analysisId)
      
      toast({
        title: "PDF analisado com sucesso!",
        description: "Dados extraídos e prontos para gerar criativos.",
      })

    } catch (error: any) {
      console.error('❌ [Dashboard] Erro no upload/análise:', error)
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateCreatives = async () => {
    if (!analysisId || !pdfData) return
    
    try {
      setIsGenerating(true)

      console.log('🎨 [Dashboard] Iniciando geração de criativo completo para análise:', analysisId)

      // Chamar edge function para geração de criativo
      const { data: generationResponse, error: generationError } = await supabase.functions
        .invoke('creative-generator', {
          body: {
            analysisId: analysisId,
            emailGestor: userEmail
          }
        })

      if (generationError) {
        throw new Error(`Erro na geração: ${generationError.message}`)
      }

      if (!generationResponse.success) {
        throw new Error(generationResponse.error || 'Erro na geração de criativos')
      }

      console.log('🎉 [Dashboard] Criativo completo gerado:', generationResponse.criativo)

      // Converter para o formato do componente
      const novoCreative: Creative = {
        id: `creative-${Date.now()}`,
        type: 'anuncio_completo' as any,
        thumbnail: generationResponse.criativo.imageUrl,
        title: generationResponse.criativo.titulo,
        style: 'Incongruência Criativa',
        status: 'ready' as const,
        url: generationResponse.criativo.imageUrl,
        headline: generationResponse.criativo.headline,
        subheadline: generationResponse.criativo.subheadline,
        copy: generationResponse.criativo.copy,
        cta: generationResponse.criativo.cta
      } as any

      // Adicionar ao array existente
      setCreatives(prev => [...prev, novoCreative])

      toast({
        title: "Criativo gerado com sucesso!",
        description: `Anúncio completo criado com incongruência criativa. Custo: R$ ${generationResponse.custo.toFixed(2)}`,
      })

    } catch (error: any) {
      console.error('❌ [Dashboard] Erro na geração:', error)
      toast({
        title: "Erro na geração",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wand2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Gerador de Criativos</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Upload do PDF de planejamento da campanha e gere criativos automáticos com IA
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload do PDF de Planejamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PDFUploadArea 
            onFileUpload={handleFileUpload}
            isAnalyzing={isAnalyzing}
            uploadedFile={uploadedFile}
          />
        </CardContent>
      </Card>

      {/* Data Preview */}
      {pdfData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados Extraídos do PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataPreviewCards data={pdfData} />
            
            {!isGenerating && (
              <div className="mt-6 text-center space-y-3">
                <Button 
                  onClick={handleGenerateCreatives}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  {creatives.length === 0 ? 'Gerar Primeiro Criativo' : 'Gerar Mais Um Criativo'}
                </Button>
                {creatives.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Cada criativo custa aproximadamente R$ 0,15 e demora ~15 segundos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Gerando Criativo com IA</h3>
              <p className="text-muted-foreground">
                Criando anúncio completo: Headline + Imagem + Copy agressiva...
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="animate-pulse">
                  <Wand2 className="h-3 w-3 mr-1" />
                  Incongruência Criativa
                </Badge>
                <Badge variant="outline" className="animate-pulse">
                  <Image className="h-3 w-3 mr-1" />
                  DALL-E 3
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Tempo estimado: ~15 segundos | Custo: ~R$ 0,15
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creative Gallery */}
      {creatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Criativos Gerados ({creatives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreativeGallery creatives={creatives} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}