
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp } from 'lucide-react'

interface CampanhaLinkCardProps {
  linkCampanha: string
}

export function CampanhaLinkCard({ linkCampanha }: CampanhaLinkCardProps) {
  const handleOpenCampanha = () => {
    window.open(linkCampanha, '_blank')
  }

  return (
    <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30 hover:border-pink-400/50 transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-pink-400" />
          Sua Campanha
        </CardTitle>
        <CardDescription className="text-gray-300">
          Acompanhe o desempenho da sua campanha em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleOpenCampanha}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex items-center gap-2 font-medium"
        >
          <ExternalLink className="h-4 w-4" />
          Acompanhe sua campanha aqui
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Clique para acessar os dados da sua campanha
        </p>
      </CardContent>
    </Card>
  )
}
