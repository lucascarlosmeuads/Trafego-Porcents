import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Edit3, 
  RotateCcw, 
  CheckCircle,
  Wand2,
  ExternalLink,
  Copy
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AnuncioCompletoProps {
  creative: {
    id: string
    thumbnail: string
    title: string
    headline?: string
    subheadline?: string
    copy?: string
    cta?: string
    url?: string
  }
  onRegenerate?: (id: string) => void
}

export function AnuncioCompleto({ creative, onRegenerate }: AnuncioCompletoProps) {
  const { toast } = useToast()

  const handleDownload = () => {
    if (creative.url) {
      // Implementar download da imagem
      const link = document.createElement('a')
      link.href = creative.url
      link.download = `criativo-${creative.id}.jpg`
      link.click()
    }
  }

  const handleCopyText = () => {
    const textoCompleto = `${creative.headline}\n\n${creative.subheadline}\n\n${creative.copy}\n\n${creative.cta}`
    navigator.clipboard.writeText(textoCompleto)
    toast({
      title: "Copy copiada!",
      description: "Texto do anúncio copiado para a área de transferência",
    })
  }

  const handleEdit = () => {
    // Abrir em editor ou Canva
    console.log('Editar criativo:', creative.id)
  }

  const handleApprove = () => {
    toast({
      title: "Criativo aprovado!",
      description: "Anúncio marcado como aprovado",
    })
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Wand2 className="h-3 w-3 mr-1" />
              Anúncio Completo
            </Badge>
            <Badge variant="outline">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Pronto
            </Badge>
          </div>
        </div>

        {/* Layout do Anúncio */}
        <div className="space-y-4">
          {/* Headline Principal */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {creative.headline}
            </h2>
          </div>

          {/* Imagem Central */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-square max-w-md mx-auto">
            <img 
              src={creative.thumbnail} 
              alt="Criativo gerado"
              className="w-full h-full object-cover"
            />
            
            {/* Preview Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={() => window.open(creative.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Original
              </Button>
            </div>
          </div>

          {/* Subheadline */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">
              {creative.subheadline}
            </h3>
          </div>

          {/* Copy Agressiva */}
          <div className="text-center space-y-2 px-4">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {creative.copy}
            </div>
            
            {/* CTA Final */}
            <div className="pt-2">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
              >
                {creative.cta}
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Baixar Imagem
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyText}
            className="text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copiar Copy
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEdit}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onRegenerate?.(creative.id)}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Regenerar
          </Button>
        </div>

        {/* Approve Button */}
        <div className="mt-3">
          <Button 
            size="sm"
            onClick={handleApprove}
            className="w-full bg-green-600 hover:bg-green-700 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovar Anúncio Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}