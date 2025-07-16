import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Wand2, 
  Copy, 
  CheckCircle,
  RotateCcw,
  Image,
  Loader2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface GeneratedCopy {
  id: string
  headline: string
  subheadline: string
  copy: string
  cta: string
  style: string
  createdAt: Date
}

interface CopyGenerationAreaProps {
  pdfData: any
  onCopySelected: (copy: GeneratedCopy) => void
}

export function CopyGenerationArea({ pdfData, onCopySelected }: CopyGenerationAreaProps) {
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null)
  const { toast } = useToast()

  const generateNewCopy = async () => {
    setIsGenerating(true)
    try {
      // Simular geração de copy baseada no PDF
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newCopy: GeneratedCopy = {
        id: `copy-${Date.now()}`,
        headline: `${pdfData.nomeOferta}: ${getRandomHeadline()}`,
        subheadline: getRandomSubheadline(),
        copy: generateAgressiveCopy(pdfData),
        cta: pdfData.cta || getRandomCTA(),
        style: 'Agressiva e Persuasiva',
        createdAt: new Date()
      }

      setGeneratedCopies(prev => [newCopy, ...prev])
      
      toast({
        title: "Nova copy gerada!",
        description: "Copy agressiva criada com base no seu PDF.",
      })

    } catch (error) {
      toast({
        title: "Erro ao gerar copy",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectCopy = (copy: GeneratedCopy) => {
    setSelectedCopyId(copy.id)
    onCopySelected(copy)
    toast({
      title: "Copy selecionada!",
      description: "Agora você pode gerar a imagem para esta copy.",
    })
  }

  const getRandomHeadline = () => {
    const headlines = [
      "PARE DE PERDER TEMPO E DINHEIRO",
      "DESCUBRA O SEGREDO QUE MUDOU TUDO",
      "VOCÊ ESTÁ FAZENDO ISSO ERRADO",
      "MÉTODO REVOLUCIONÁRIO REVELADO",
      "O QUE NINGUÉM TE CONTA SOBRE"
    ]
    return headlines[Math.floor(Math.random() * headlines.length)]
  }

  const getRandomSubheadline = () => {
    const subheadlines = [
      "Método comprovado por milhares de pessoas",
      "Resultados garantidos em até 30 dias",
      "Sistema que funciona mesmo para iniciantes",
      "Estratégia exclusiva dos profissionais",
      "Transforme sua realidade hoje mesmo"
    ]
    return subheadlines[Math.floor(Math.random() * subheadlines.length)]
  }

  const generateAgressiveCopy = (data: any) => {
    const beneficios = data.beneficios || ['Transformação Real', 'Resultados Comprovados', 'Suporte Especializado'];
    const publico = data.publicoAlvo || 'empreendedores que querem crescer';
    const oferta = data.nomeOferta || 'solução premium';
    const proposta = data.propostaCentral || 'transformar seu negócio';
    
    // Usar informações REAIS extraídas do PDF
    return `${publico}! 

Você conhece ${oferta}?

É exatamente isso que vai ${proposta.toLowerCase()}.

🔥 BENEFÍCIOS REAIS:
${beneficios.map((b: string) => `✅ ${b}`).join('\n')}

📈 RESULTADOS COMPROVADOS:
• Baseado no planejamento estratégico documentado
• Metodologia testada e aprovada
• Processo estruturado passo a passo

⚡ POR QUE AGORA?
${proposta}

💰 Oportunidade limitada para quem quer sair da zona de conforto.

Não é para qualquer um. É para quem está REALMENTE decidido a mudar de patamar.

Você está preparado?`
  }

  const getRandomCTA = () => {
    const ctas = [
      "QUERO COMEÇAR AGORA",
      "GARANTIR MINHA VAGA",
      "ACESSAR MÉTODO",
      "TRANSFORMAR MINHA VIDA",
      "COMEÇAR HOJE MESMO"
    ]
    return ctas[Math.floor(Math.random() * ctas.length)]
  }

  return (
    <div className="space-y-6">
      {/* Generation Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Geração de Copy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Gere copies agressivas baseadas no seu PDF de planejamento
            </p>
            
            <Button 
              onClick={generateNewCopy}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-5 w-5 mr-2" />
              )}
              {generatedCopies.length === 0 ? 'Gerar Primeira Copy' : 'Gerar Nova Copy'}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="animate-pulse">
                    <FileText className="h-3 w-3 mr-1" />
                    Analisando PDF
                  </Badge>
                  <Badge variant="outline" className="animate-pulse">
                    <Wand2 className="h-3 w-3 mr-1" />
                    Copy Agressiva
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criando headline + copy + CTA personalizado...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Copies */}
      {generatedCopies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Copies Geradas ({generatedCopies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedCopies.map((copy) => (
                <Card 
                  key={copy.id}
                  className={`transition-all duration-200 ${
                    selectedCopyId === copy.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <Badge variant={selectedCopyId === copy.id ? "default" : "outline"}>
                          {selectedCopyId === copy.id ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {copy.style}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {copy.createdAt.toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Copy Content */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-red-600">
                          {copy.headline}
                        </h3>
                        <p className="font-semibold text-foreground">
                          {copy.subheadline}
                        </p>
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {copy.copy}
                        </div>
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 font-bold"
                          >
                            {copy.cta}
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant={selectedCopyId === copy.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectCopy(copy)}
                          className="flex-1"
                        >
                          {selectedCopyId === copy.id ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selecionada
                            </>
                          ) : (
                            <>
                              <Image className="h-3 w-3 mr-1" />
                              Gerar Imagem
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${copy.headline}\n\n${copy.subheadline}\n\n${copy.copy}\n\n${copy.cta}`
                            )
                            toast({
                              title: "Copy copiada!",
                              description: "Texto copiado para a área de transferência.",
                            })
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}