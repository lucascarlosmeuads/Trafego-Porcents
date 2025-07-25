import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  MessageSquare, 
  Users, 
  Type, 
  MousePointer, 
  Volume2, 
  Star,
  Image
} from 'lucide-react'

interface PDFData {
  nomeOferta: string
  propostaCentral: string
  publicoAlvo: string
  headlinePrincipal: string
  cta: string
  tomVoz: string
  beneficios: string[]
  tipoMidia: string[]
}

interface DataPreviewCardsProps {
  data: PDFData
}

export function DataPreviewCards({ data }: DataPreviewCardsProps) {
  const dataCards = [
    {
      icon: Target,
      title: 'Nome da Oferta',
      value: data.nomeOferta,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      icon: MessageSquare,
      title: 'Proposta Central',
      value: data.propostaCentral,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      icon: Users,
      title: 'Público-Alvo',
      value: data.publicoAlvo,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      icon: Type,
      title: 'Headline Principal',
      value: data.headlinePrincipal,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    },
    {
      icon: MousePointer,
      title: 'Call to Action',
      value: data.cta,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    {
      icon: Volume2,
      title: 'Tom de Voz',
      value: data.tomVoz,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      borderColor: 'border-teal-200'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataCards.map((card, index) => (
          <Card key={index} className={`${card.borderColor} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefícios e Tipo de Mídia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Benefícios */}
        <Card className="border-yellow-200 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              Benefícios do Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data.beneficios || []).map((beneficio, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="mr-2 mb-2 bg-yellow-50 text-yellow-800 border-yellow-200"
                >
                  {beneficio}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Mídia */}
        <Card className="border-indigo-200 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Image className="h-4 w-4 text-indigo-600" />
              </div>
              Tipos de Mídia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data.tipoMidia || []).map((tipo, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="mr-2 mb-2 bg-indigo-50 text-indigo-800 border-indigo-200"
                >
                  {tipo}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}