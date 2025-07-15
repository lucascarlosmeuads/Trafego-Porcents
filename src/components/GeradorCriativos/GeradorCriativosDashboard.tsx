import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  type: 'image' | 'video'
  thumbnail: string
  title: string
  style: string
  status: 'generating' | 'ready' | 'error'
  url?: string
}

export function GeradorCriativosDashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [pdfData, setPdfData] = useState<PDFData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [creatives, setCreatives] = useState<Creative[]>([])

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsAnalyzing(true)
    
    // Simular análise do PDF (aqui conectaria com edge function)
    setTimeout(() => {
      setPdfData({
        nomeOferta: "Curso de Marketing Digital",
        propostaCentral: "Aprenda marketing digital do zero em 30 dias",
        publicoAlvo: "Empreendedores e pequenos empresários de 25-45 anos",
        headlinePrincipal: "Transforme Seu Negócio em 30 Dias",
        cta: "Quero Começar Agora",
        tomVoz: "Motivacional e direto",
        beneficios: ["Aumento de vendas", "Presença digital forte", "Estratégias comprovadas"],
        tipoMidia: ["Imagem", "Vídeo"]
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleGenerateCreatives = async () => {
    if (!pdfData) return
    
    setIsGenerating(true)
    
    // Simular geração de criativos
    setTimeout(() => {
      const mockCreatives: Creative[] = [
        {
          id: '1',
          type: 'image',
          thumbnail: '/placeholder.svg',
          title: 'Criativo Principal',
          style: 'Minimalista com CTA destacado',
          status: 'ready',
          url: '/placeholder.svg'
        },
        {
          id: '2',
          type: 'image',
          thumbnail: '/placeholder.svg',
          title: 'Variação Colorida',
          style: 'Cores vibrantes com elementos gráficos',
          status: 'ready',
          url: '/placeholder.svg'
        },
        {
          id: '3',
          type: 'image',
          thumbnail: '/placeholder.svg',
          title: 'Foco no Benefício',
          style: 'Destaque para resultados',
          status: 'ready',
          url: '/placeholder.svg'
        },
        {
          id: '4',
          type: 'video',
          thumbnail: '/placeholder.svg',
          title: 'Vídeo Apresentação',
          style: 'Animação com texto dinâmico',
          status: 'ready',
          url: '/placeholder.svg'
        },
        {
          id: '5',
          type: 'video',
          thumbnail: '/placeholder.svg',
          title: 'Vídeo Depoimento',
          style: 'Estilo testimonial',
          status: 'ready',
          url: '/placeholder.svg'
        },
        {
          id: '6',
          type: 'video',
          thumbnail: '/placeholder.svg',
          title: 'Vídeo Explicativo',
          style: 'Motion graphics educativo',
          status: 'ready',
          url: '/placeholder.svg'
        }
      ]
      
      setCreatives(mockCreatives)
      setIsGenerating(false)
    }, 3000)
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
            
            {!isGenerating && creatives.length === 0 && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={handleGenerateCreatives}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  Gerar Criativos Automaticamente
                </Button>
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
              <h3 className="text-xl font-semibold">Gerando Criativos com IA</h3>
              <p className="text-muted-foreground">
                Criando 3 imagens e 3 vídeos baseados no seu planejamento...
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="animate-pulse">
                  <Image className="h-3 w-3 mr-1" />
                  Imagens
                </Badge>
                <Badge variant="outline" className="animate-pulse">
                  <Video className="h-3 w-3 mr-1" />
                  Vídeos
                </Badge>
              </div>
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
              Criativos Gerados ({creatives.length}/6)
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