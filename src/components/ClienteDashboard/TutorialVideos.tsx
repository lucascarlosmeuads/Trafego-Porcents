
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, FileVideo, ExternalLink } from 'lucide-react'

export function TutorialVideos() {
  const tutorialVideos = [
    {
      id: 1,
      title: "Tutorial 1 - Configuração Inicial",
      description: "Aprenda os primeiros passos para configurar sua campanha de tráfego pago.",
      videoId: "EQZyJ3xFKII",
      videoUrl: "https://www.youtube.com/watch?v=EQZyJ3xFKII"
    },
    {
      id: 2,
      title: "Tutorial 2 - Business Manager",
      description: "Como configurar e usar o Business Manager do Facebook para suas campanhas.",
      videoId: "iTAUcJfvN3M",
      videoUrl: "https://www.youtube.com/watch?v=iTAUcJfvN3M"
    },
    {
      id: 3,
      title: "Tutorial 3 - Criação de Campanhas",
      description: "Passo a passo para criar campanhas eficazes e otimizadas.",
      videoId: "zJBZydYUzPo",
      videoUrl: "https://www.youtube.com/watch?v=zJBZydYUzPo"
    },
    {
      id: 4,
      title: "Tutorial 4 - Análise de Métricas",
      description: "Como interpretar e usar as métricas para otimizar suas campanhas.",
      videoId: "ISq5qu2rUdc",
      videoUrl: "https://www.youtube.com/watch?v=ISq5qu2rUdc"
    },
    {
      id: 5,
      title: "Tutorial 5 - Otimização Avançada",
      description: "Técnicas avançadas para maximizar o retorno das suas campanhas.",
      videoId: "j-uDyO5fd0s",
      videoUrl: "https://www.youtube.com/watch?v=j-uDyO5fd0s"
    }
  ]

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            Tutoriais em Vídeo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Assista aos vídeos tutoriais para aprender a usar todas as funcionalidades do sistema 
            e maximizar os resultados da sua campanha de tráfego.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorialVideos.map((video) => (
              <Card 
                key={video.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleVideoClick(video.videoUrl)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-3 group">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback para thumbnail de menor qualidade se a maxres não estiver disponível
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <ExternalLink className="w-3 h-3" />
                      Assistir no YouTube
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">📢 Recado Importante</h3>
            <p className="text-sm text-green-700 leading-relaxed">
              Fazer esses passos garante que sua campanha vá ao ar de forma mais rápida! 
              Essas não são as configurações principais, mas são <strong>pré-configurações importantes</strong> que 
              agilizam toda a parte da configuração avançada. Como somos parceiros, precisamos da sua 
              colaboração nessas etapas para otimizar o processo e acelerar os resultados do seu negócio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
