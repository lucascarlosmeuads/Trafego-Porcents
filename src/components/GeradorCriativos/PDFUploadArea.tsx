import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import pdfs from 'pdf-parse'

interface PDFUploadAreaProps {
  onPDFAnalysis: (text: string, fileName: string, file: File) => void
  isAnalyzing: boolean
  uploadedFile: File | null
}

export function PDFUploadArea({ onPDFAnalysis, isAnalyzing, uploadedFile }: PDFUploadAreaProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      try {
        console.log('📄 [PDFUpload] Iniciando análise real do PDF:', file.name)
        
        // Ler o arquivo como ArrayBuffer para usar com pdf-parse
        const arrayBuffer = await file.arrayBuffer()
        
        console.log('🔍 [PDFUpload] Extraindo texto com pdf-parse...')
        
        // Usar pdf-parse para extrair texto real do PDF
        const data = await pdfs(new Uint8Array(arrayBuffer))
        const extractedText = data.text
        
        console.log('✅ [PDFUpload] Texto real extraído:', extractedText.length, 'caracteres')
        console.log('📄 [PDFUpload] Páginas:', data.numpages)
        
        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error('PDF não contém texto suficiente para análise. Verifique se o arquivo não é apenas imagens.')
        }
        
        // Enviar texto extraído e arquivo para análise
        onPDFAnalysis(extractedText, file.name, file)
        
      } catch (error: any) {
        console.error('❌ [PDFUpload] Erro ao extrair texto do PDF:', error)
        throw new Error(`Erro ao processar PDF: ${error.message}`)
      }
    }
  }, [onPDFAnalysis])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  })

  const hasRejectedFiles = fileRejections.length > 0

  if (uploadedFile && isAnalyzing) {
    return (
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900">Analisando PDF...</h3>
          <p className="text-blue-700 mt-2">{uploadedFile.name}</p>
          <p className="text-sm text-blue-600 mt-1">
            Extraindo dados do planejamento da campanha
          </p>
        </CardContent>
      </Card>
    )
  }

  if (uploadedFile && !isAnalyzing) {
    return (
      <Card className="border-2 border-green-300 bg-green-50/50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900">PDF Analisado com Sucesso!</h3>
          <p className="text-green-700 mt-2">{uploadedFile.name}</p>
          <p className="text-sm text-green-600 mt-1">
            Dados extraídos e prontos para gerar criativos
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const url = URL.createObjectURL(uploadedFile)
                const a = document.createElement('a')
                a.href = url
                a.download = uploadedFile.name
                document.body.appendChild(a)
                a.click()
                URL.revokeObjectURL(url)
                document.body.removeChild(a)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF Original
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()}
        className={`
          border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
          }
          ${hasRejectedFiles ? 'border-red-300 bg-red-50/50' : ''}
        `}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          
          {hasRejectedFiles ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900">Arquivo não suportado</h3>
              <p className="text-red-700 mt-2">
                Por favor, selecione apenas arquivos PDF
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary animate-bounce" />
                ) : (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isDragActive 
                  ? 'Solte o arquivo PDF aqui...' 
                  : 'Faça upload do PDF de planejamento'
                }
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Arraste e solte o arquivo PDF ou clique para selecionar
              </p>
              
              <div className="text-sm text-muted-foreground mb-4">
                <p>O PDF deve conter informações sobre:</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-left max-w-md mx-auto">
                  <span>• Nome da oferta</span>
                  <span>• Público-alvo</span>
                  <span>• Proposta central</span>
                  <span>• Headline principal</span>
                  <span>• CTA desejado</span>
                  <span>• Tom de voz</span>
                </div>
              </div>
            </>
          )}
          
          <Button 
            variant={hasRejectedFiles ? "destructive" : "default"}
            className="mt-4"
            disabled={isAnalyzing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {hasRejectedFiles ? 'Tentar Novamente' : 'Selecionar PDF'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}