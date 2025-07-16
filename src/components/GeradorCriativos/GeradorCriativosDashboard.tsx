import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { usePlanejamentoEstrategicoBusca } from '@/hooks/usePlanejamentoEstrategicoBusca'
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
  Loader2,
  Copy,
  BookOpen,
  Zap
} from 'lucide-react'
import { PDFUploadArea } from './PDFUploadArea'
import { DataPreviewCards } from './DataPreviewCards'
import { CopyGenerationArea } from './CopyGenerationArea'
import { ImageGenerationArea } from './ImageGenerationArea'

interface PDFData {
  nomeOferta: string
  propostaCentral: string
  publicoAlvo: string
  headlinePrincipal: string
  cta: string
  tomVoz: string
  beneficios: string[]
  tipoMidia: string[]
  copiesProntas?: {
    linha1: {
      titulos: string[]
      descricoes: string[]
    }
    linha2: {
      titulos: string[]
      descricoes: string[]
    }
  }
}

interface GeneratedCopy {
  id: string
  headline: string
  subheadline: string
  copy: string
  cta: string
  style: string
  createdAt: Date
}

export function GeradorCriativosDashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<PDFData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [selectedCopy, setSelectedCopy] = useState<GeneratedCopy | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'copy' | 'image'>('upload')
  const [showPdfUpload, setShowPdfUpload] = useState(false)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const userEmail = user?.email || 'admin@trafegoporcents.com'
  
  // Hook para buscar planejamento estratégico existente
  const { 
    planejamento, 
    copiesExtraidas, 
    hasExistingPlan, 
    isLoading: isLoadingPlan,
    buscarPlanejamento 
  } = usePlanejamentoEstrategicoBusca()

  // Verificar se existe planejamento ao carregar
  useEffect(() => {
    if (userEmail) {
      console.log('🔍 Verificando planejamento para:', userEmail)
      buscarPlanejamento(userEmail)
    }
  }, [userEmail])

  // Se encontrou planejamento, ir direto para copy
  useEffect(() => {
    if (hasExistingPlan && copiesExtraidas.length > 0 && !showPdfUpload) {
      setCurrentStep('copy')
      toast({
        title: "Planejamento encontrado!",
        description: `${copiesExtraidas.length} copies prontas extraídas do seu planejamento estratégico.`,
      })
    }
  }, [hasExistingPlan, copiesExtraidas, showPdfUpload])

  const handlePDFAnalysis = async (extractedText: string, fileName: string, file: File) => {
    try {
      setUploadedFile(file)
      setIsAnalyzing(true)

      console.log('🧠 [Dashboard] Iniciando análise direta do texto extraído:', fileName)
      console.log('📝 [Dashboard] Texto extraído:', extractedText.substring(0, 200) + '...')

      // Chamar edge function para análise do texto
      const { data: analysisResponse, error: analysisError } = await supabase.functions
        .invoke('pdf-analyzer', {
          body: {
            extractedText: extractedText,
            fileName: fileName,
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
      setCurrentStep('copy')
      
      toast({
        title: "PDF analisado com sucesso!",
        description: "Agora você pode gerar copies baseadas no seu PDF.",
      })

    } catch (error: any) {
      console.error('❌ [Dashboard] Erro na análise:', error)
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopySelected = (copy: GeneratedCopy) => {
    setSelectedCopy(copy)
    setCurrentStep('image')
    toast({
      title: "Copy selecionada!",
      description: "Agora você pode gerar a imagem para esta copy.",
    })
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
          Upload do PDF → Gere copies → Crie imagens com incongruência criativa
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-8">
            <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-primary' : currentStep === 'copy' || currentStep === 'image' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'upload' ? 'bg-primary text-primary-foreground' : currentStep === 'copy' || currentStep === 'image' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                {currentStep === 'copy' || currentStep === 'image' ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="font-medium">Upload PDF</span>
            </div>
            
            <div className="w-8 h-0.5 bg-muted"></div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'copy' ? 'text-primary' : currentStep === 'image' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'copy' ? 'bg-primary text-primary-foreground' : currentStep === 'image' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                {currentStep === 'image' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium">Gerar Copy</span>
            </div>
            
            <div className="w-8 h-0.5 bg-muted"></div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'image' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'image' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
              <span className="font-medium">Gerar Imagem</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planejamento Estratégico Encontrado */}
      {currentStep === 'upload' && isLoadingPlan && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verificando planejamento estratégico existente...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planejamento Encontrado */}
      {currentStep === 'upload' && hasExistingPlan && !isLoadingPlan && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BookOpen className="h-5 w-5" />
              Planejamento Estratégico Encontrado!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <Zap className="h-3 w-3 mr-1" />
                  {copiesExtraidas.length} Copies Prontas
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Extraídas do seu planejamento
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Encontramos um planejamento estratégico salvo com copies prontas para você. 
                Clique em "Usar Copies do Planejamento" ou faça upload de um novo PDF.
              </p>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('copy')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Usar Copies do Planejamento
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowPdfUpload(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Novo PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Upload Area */}
      {currentStep === 'upload' && (!hasExistingPlan || showPdfUpload) && !isLoadingPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload do PDF de Planejamento
            </CardTitle>
            {showPdfUpload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPdfUpload(false)}
                className="w-fit"
              >
                ← Voltar para Planejamento
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <PDFUploadArea 
              onPDFAnalysis={handlePDFAnalysis}
              isAnalyzing={isAnalyzing}
              uploadedFile={uploadedFile}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Copy Generation */}
      {currentStep === 'copy' && (
        <>
          {/* Mostrar dados do PDF se houver */}
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
              </CardContent>
            </Card>
          )}

          {/* Mostrar planejamento estratégico se houver */}
          {hasExistingPlan && !pdfData && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  Copies do Planejamento Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mb-3">
                    <Zap className="h-3 w-3 mr-1" />
                    Extraídas automaticamente do seu planejamento
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    As copies abaixo foram extraídas do seu planejamento estratégico salvo. 
                    Selecione uma para gerar a imagem correspondente.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <CopyGenerationArea 
            pdfData={pdfData}
            onCopySelected={handleCopySelected}
            copiesExistentes={hasExistingPlan && !pdfData ? copiesExtraidas : undefined}
          />
        </>
      )}

      {/* Step 3: Image Generation */}
      {currentStep === 'image' && (
        <ImageGenerationArea 
          selectedCopy={selectedCopy}
          analysisId={analysisId}
          userEmail={userEmail}
        />
      )}

      {/* Navigation */}
      {currentStep !== 'upload' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => {
                  if (currentStep === 'image') setCurrentStep('copy')
                  else if (currentStep === 'copy') setCurrentStep('upload')
                }}
              >
                ← Voltar
              </Button>
              
              {currentStep === 'copy' && selectedCopy && (
                <Button onClick={() => setCurrentStep('image')}>
                  Continuar para Imagem →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}