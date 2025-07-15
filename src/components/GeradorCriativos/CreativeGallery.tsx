import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Edit3, 
  RotateCcw, 
  CheckCircle,
  Image,
  Video,
  ExternalLink
} from 'lucide-react'

interface Creative {
  id: string
  type: 'image' | 'video'
  thumbnail: string
  title: string
  style: string
  status: 'generating' | 'ready' | 'error'
  url?: string
}

interface CreativeGalleryProps {
  creatives: Creative[]
}

export function CreativeGallery({ creatives }: CreativeGalleryProps) {
  const images = creatives.filter(c => c.type === 'image')
  const videos = creatives.filter(c => c.type === 'video')

  const handleDownload = (creative: Creative) => {
    if (creative.url) {
      // Aqui implementaria o download real
      console.log('Download criativo:', creative.id)
    }
  }

  const handleEdit = (creative: Creative) => {
    // Aqui abriria editor ou enviaria para Canva
    console.log('Editar criativo:', creative.id)
  }

  const handleRegenerate = (creative: Creative) => {
    // Aqui regeneraria o criativo
    console.log('Regenerar criativo:', creative.id)
  }

  const handleApprove = (creative: Creative) => {
    // Aqui marcaria como aprovado
    console.log('Aprovar criativo:', creative.id)
  }

  const CreativeCard = ({ creative }: { creative: Creative }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardContent className="p-4">
        {/* Preview Image/Video */}
        <div className="relative mb-4 rounded-lg overflow-hidden bg-muted aspect-video">
          <img 
            src={creative.thumbnail} 
            alt={creative.title}
            className="w-full h-full object-cover"
          />
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={creative.type === 'image' ? 'default' : 'secondary'}>
              {creative.type === 'image' ? (
                <Image className="h-3 w-3 mr-1" />
              ) : (
                <Video className="h-3 w-3 mr-1" />
              )}
              {creative.type === 'image' ? 'Imagem' : 'Vídeo'}
            </Badge>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Pronto
            </Badge>
          </div>

          {/* Preview Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
            <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-all duration-200">
              <ExternalLink className="h-4 w-4 mr-1" />
              Visualizar
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-sm text-foreground">{creative.title}</h3>
          <p className="text-xs text-muted-foreground">{creative.style}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDownload(creative)}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Baixar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(creative)}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRegenerate(creative)}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Regenerar
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleApprove(creative)}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Criativos de Imagem</h3>
            <Badge variant="secondary">{images.length}/3</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((creative) => (
              <CreativeCard key={creative.id} creative={creative} />
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Criativos de Vídeo</h3>
            <Badge variant="secondary">{videos.length}/3</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((creative) => (
              <CreativeCard key={creative.id} creative={creative} />
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="border-t pt-6">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Baixar Todos ({creatives.length})
          </Button>
          
          <Button variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Regenerar Todos
          </Button>
          
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar Todos
          </Button>
        </div>
      </div>
    </div>
  )
}