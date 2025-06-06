import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play, FileVideo, ArrowLeft, Users, AlertCircle, Mail, Key } from 'lucide-react'
import { useState } from 'react'

interface TutorialVideosProps {
  onBack?: () => void
}

export function TutorialVideos({ onBack }: TutorialVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const tutorialVideos = [
    {
      id: 1,
      title: "Tutorial 1",
      description: "Aprenda os primeiros passos para configurar sua campanha de tráfego pago.",
      videoId: "EQZyJ3xFKII",
      videoUrl: "https://www.youtube.com/watch?v=EQZyJ3xFKII"
    },
    {
      id: 2,
      title: "Tutorial 2",
      description: "Como configurar e usar o Business Manager do Facebook para suas campanhas.",
      videoId: "iTAUcJfvN3M",
      videoUrl: "https://www.youtube.com/watch?v=iTAUcJfvN3M"
    },
    {
      id: 3,
      title: "Tutorial 3",
      description: "Passo a passo para criar campanhas eficazes e otimizadas.",
      videoId: "zJBZydYUzPo",
      videoUrl: "https://www.youtube.com/watch?v=zJBZydYUzPo"
    },
    {
      id: 4,
      title: "Tutorial 4",
      description: "Como interpretar e usar as métricas para otimizar suas campanhas.",
      videoId: "ISq5qu2rUdc",
      videoUrl: "https://www.youtube.com/watch?v=ISq5qu2rUdc"
    },
    {
      id: 5,
      title: "Tutorial 5",
      description: "Técnicas avançadas para maximizar o retorno das suas campanhas.",
      videoId: "j-uDyO5fd0s",
      videoUrl: "https://www.youtube.com/watch?v=j-uDyO5fd0s"
    }
  ]

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      {/* Aviso simplificado sobre Liberação para Anúncios no Facebook */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                📢 IMPORTANTE: Para Fazer Anúncios no Facebook
              </h3>
              
              <div className="space-y-4 text-sm text-orange-700">
                <p className="font-medium text-base">
                  Para conseguirmos fazer seus anúncios no Facebook, você precisa escolher <strong>UMA das 2 opções abaixo:</strong>
                </p>
                
                {/* Opção 1 */}
                <div className="bg-white/50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">OPÇÃO 1: Dar Permissão por Email</span>
                  </div>
                  <p className="ml-8 text-gray-700">
                    Você nos passa <strong>apenas o seu email</strong> e nós pedimos permissão pro Facebook para fazer anúncios na sua conta.
                  </p>
                </div>

                {/* Opção 2 */}
                <div className="bg-white/50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
                    <Key className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">OPÇÃO 2: Passar Login e Senha</span>
                  </div>
                  <p className="ml-8 text-gray-700">
                    Você nos passa <strong>seu email e senha do Facebook</strong> para que possamos acessar e fazer os anúncios.
                  </p>
                </div>

                <p className="font-medium text-orange-800">
                  ⚠️ <strong>IMPORTANTE:</strong> Só peça isso no grupo onde seu gestor está presente. Não use outros canais!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                onClick={() => handleVideoClick(video)}
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
                      <Play className="w-3 h-3" />
                      Assistir Vídeo
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
              agilizam toda a parte da configuração avançada. <strong>Nós faremos as configurações avançadas</strong>, 
              mas essa parte das pré-configurações (como liberar a Business Manager, etc.) é sua responsabilidade. 
              Como somos parceiros, precisamos da sua colaboração nessas etapas para otimizar o processo e acelerar 
              os resultados do seu negócio. <strong>Qualquer dúvida, é só chamar seu gestor responsável no chat!</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal do Player de Vídeo */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-semibold">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {selectedVideo && (
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              {selectedVideo?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
