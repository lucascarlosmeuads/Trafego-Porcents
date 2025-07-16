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
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface PDFUploadAreaProps {
  onPDFAnalysis: (text: string, fileName: string, file: File) => void
  isAnalyzing: boolean
  uploadedFile: File | null
}

export function PDFUploadArea({ onPDFAnalysis, isAnalyzing, uploadedFile }: PDFUploadAreaProps) {
  const { user } = useAuth()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      try {
        console.log('📄 [PDFUpload] SOLUÇÃO DEFINITIVA: Upload direto para Supabase + Edge Function')
        console.log('🚀 [PDFUpload] Iniciando upload:', file.name)
        
        // 1. Upload para Supabase Storage
        const timestamp = Date.now()
        const fileName = `${timestamp}-${file.name}`
        const filePath = `pdfs-analise/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cliente-arquivos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Erro no upload: ${uploadError.message}`)
        }

        console.log('✅ [PDFUpload] Upload concluído:', uploadData.path)
        
        // 2. Chamar Edge Function para análise
        console.log('🔍 [PDFUpload] Chamando edge function pdf-analyzer...')
        
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('pdf-analyzer', {
          body: {
            fileName: file.name,
            filePath: uploadData.path,
            emailGestor: user?.email,
            extractedText: null // Será processado pela edge function
          }
        })

        if (analysisError) {
          throw new Error(`Erro na análise: ${analysisError.message}`)
        }

        if (!analysisData.success) {
          throw new Error(analysisData.error || 'Erro desconhecido na análise')
        }

        console.log('✅ [PDFUpload] Análise concluída pela edge function:', analysisData.dadosExtraidos)
        
        // 3. Simular texto extraído para manter compatibilidade
        const simulatedText = `
        Nome da Oferta: ${analysisData.dadosExtraidos.nomeOferta}
        Proposta Central: ${analysisData.dadosExtraidos.propostaCentral}
        Público-Alvo: ${analysisData.dadosExtraidos.publicoAlvo}
        Benefícios: ${analysisData.dadosExtraidos.beneficios?.join(', ')}
        Headline: ${analysisData.dadosExtraidos.headlinePrincipal}
        CTA: ${analysisData.dadosExtraidos.cta}
        Tom de Voz: ${analysisData.dadosExtraidos.tomVoz}
        `
        
        // 4. Chamar callback com texto simulado
        onPDFAnalysis(simulatedText, file.name, file)
        
      } catch (error: any) {
        console.error('❌ [PDFUpload] Erro na solução definitiva:', error)
        alert(`Erro ao processar PDF: ${error.message}`)
      }
    } else {
      console.error('❌ [PDFUpload] Arquivo não é PDF válido:', file?.type)
      alert('Por favor, selecione apenas arquivos PDF válidos.')
    }
  }, [onPDFAnalysis, user?.email])

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
                  : 'Upload do Planejamento Estratégico'
                }
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Envie o PDF com as copies prontas dos criativos
              </p>
              
              <div className="text-sm text-muted-foreground mb-4">
                <p className="font-medium mb-2">O sistema vai extrair automaticamente:</p>
                <div className="grid grid-cols-1 gap-1 mt-2 text-left max-w-md mx-auto">
                  <span>📝 Títulos para anúncios (Linha 1 e Linha 2)</span>
                  <span>📋 Descrições dos criativos</span>
                  <span>🎯 Copies prontas para cada linha</span>
                  <span>✨ Headlines e CTAs dos criativos</span>
                  <span>🎨 Informações para geração de imagem</span>
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