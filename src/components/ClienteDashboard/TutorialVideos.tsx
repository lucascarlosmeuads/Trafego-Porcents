
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, FileVideo } from 'lucide-react'

export function TutorialVideos() {
  const tutorialVideos = [
    {
      id: 1,
      title: "Como Preencher o Briefing",
      description: "Aprenda a preencher corretamente o formulário de briefing para garantir os melhores resultados da sua campanha.",
      thumbnail: "/placeholder.svg",
      videoUrl: "" // URL será definida posteriormente
    },
    {
      id: 2,
      title: "Enviando Materiais de Qualidade",
      description: "Dicas importantes sobre como enviar fotos e vídeos do seu produto para criar materiais publicitários eficazes.",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 3,
      title: "Registrando Suas Vendas",
      description: "Como registrar corretamente suas vendas no sistema para acompanhar o desempenho da campanha.",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    },
    {
      id: 4,
      title: "Acompanhando o Progresso",
      description: "Entenda como funciona o funil de status e como acompanhar o progresso da sua campanha em tempo real.",
      thumbnail: "/placeholder.svg",
      videoUrl: ""
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            Como Usar o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Assista aos vídeos tutoriais para aprender a usar todas as funcionalidades do sistema 
            e maximizar os resultados da sua campanha de tráfego.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorialVideos.map((video) => (
              <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Vídeo em breve</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">📹 Vídeos em Produção</h3>
            <p className="text-sm text-blue-700">
              Os vídeos tutoriais estão sendo produzidos e estarão disponíveis em breve. 
              Você será notificado quando eles estiverem prontos!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
