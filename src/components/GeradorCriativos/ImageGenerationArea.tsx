import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Image, 
  Wand2, 
  Download, 
  CheckCircle,
  Loader2,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface GeneratedCopy {
  id: string
  headline: string
  subheadline: string
  copy: string
  cta: string
  style: string
  createdAt: Date
}

interface GeneratedAd {
  id: string
  imageUrl: string
  copy: GeneratedCopy
  style: string
  createdAt: Date
}

interface ImageGenerationAreaProps {
  selectedCopy: GeneratedCopy | null
  analysisId: string | null
  userEmail: string
}

export function ImageGenerationArea({ selectedCopy, analysisId, userEmail }: ImageGenerationAreaProps) {
  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateImage = async () => {
    if (!selectedCopy || !analysisId) return
    
    setIsGenerating(true)
    try {
      console.log('🎨 Gerando imagem para copy:', selectedCopy.id)

      // Chamar edge function para geração de imagem
      const { data: response, error } = await supabase.functions
        .invoke('dall-e-generator', {
          body: {
            analysisId: analysisId,
            emailGestor: userEmail,
            selectedCopy: selectedCopy
          }
        })

      if (error) {
        throw new Error(`Erro na geração: ${error.message}`)
      }

      if (!response.success) {
        throw new Error(response.error || 'Erro na geração de imagem')
      }

      const newAd: GeneratedAd = {
        id: `ad-${Date.now()}`,
        imageUrl: response.criativo.imageUrl,
        copy: selectedCopy,
        style: 'Incongruência Criativa',
        createdAt: new Date()
      }

      setGeneratedAds(prev => [newAd, ...prev])

      toast({
        title: "Anúncio completo gerado!",
        description: `Imagem criada com DALL-E 3. Custo: R$ ${response.custo.toFixed(2)}`,
      })

    } catch (error: any) {
      console.error('❌ Erro na geração:', error)
      toast({
        title: "Erro na geração",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAd = async (ad: GeneratedAd) => {
    try {
      const response = await fetch(ad.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anuncio-${ad.id}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download iniciado!",
        description: "O anúncio está sendo baixado.",
      })
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o anúncio.",
        variant: "destructive",
      })
    }
  }

  if (!selectedCopy) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Selecione uma Copy</h3>
              <p className="text-sm text-muted-foreground">
                Primeiro gere e selecione uma copy para poder criar a imagem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Copy Selected */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Copy Selecionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-red-600">{selectedCopy.headline}</h3>
            <p className="font-semibold">{selectedCopy.subheadline}</p>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {selectedCopy.copy}
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold">
              {selectedCopy.cta}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generation Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Geração de Imagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Gere uma imagem com incongruência criativa usando DALL-E 3
            </p>
            
            <Button 
              onClick={generateImage}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-5 w-5 mr-2" />
              )}
              Gerar Imagem
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="animate-pulse">
                    <Image className="h-3 w-3 mr-1" />
                    DALL-E 3
                  </Badge>
                  <Badge variant="outline" className="animate-pulse">
                    <Wand2 className="h-3 w-3 mr-1" />
                    Incongruência
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Criando imagem 1024x1024 HD (~15 segundos)...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Ads */}
      {generatedAds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Anúncios Gerados ({generatedAds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {generatedAds.map((ad) => (
                <Card key={ad.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Image */}
                      <div className="relative">
                        <img 
                          src={ad.imageUrl} 
                          alt="Anúncio gerado"
                          className="w-full h-64 md:h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-purple-600">
                            <Image className="h-3 w-3 mr-1" />
                            DALL-E 3
                          </Badge>
                        </div>
                      </div>

                      {/* Copy */}
                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-lg text-red-600">
                          {ad.copy.headline}
                        </h3>
                        <p className="font-semibold">
                          {ad.copy.subheadline}
                        </p>
                        <div className="text-sm text-muted-foreground whitespace-pre-line max-h-32 overflow-y-auto">
                          {ad.copy.copy}
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold">
                          {ad.copy.cta}
                        </Button>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAd(ad)}
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateImage()}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
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