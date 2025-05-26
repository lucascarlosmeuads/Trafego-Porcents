
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useBriefingData } from '@/hooks/useBriefingData'
import { BriefingModal } from './ClientesTable/BriefingModal'

export function BriefingsPanel() {
  const { briefings, loading } = useBriefingData()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBriefings = briefings.filter(briefing =>
    briefing.nome_produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    briefing.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Carregando briefings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Briefings dos Clientes</h2>
          <p className="text-muted-foreground">
            Total de briefings preenchidos: {briefings.length}
          </p>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Pesquisar por produto ou email do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de briefings */}
      <div className="grid gap-4">
        {filteredBriefings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum briefing encontrado</h3>
              <p className="text-muted-foreground text-center">
                {briefings.length === 0 
                  ? 'Ainda não há briefings preenchidos pelos clientes.'
                  : 'Nenhum briefing corresponde aos critérios de pesquisa.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBriefings.map((briefing) => (
            <Card key={briefing.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{briefing.nome_produto}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{briefing.email_cliente}</span>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(briefing.created_at)}
                      </Badge>
                    </div>
                  </div>
                  <BriefingModal
                    emailCliente={briefing.email_cliente}
                    nomeCliente={briefing.nome_produto}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Ver Detalhes
                      </Button>
                    }
                  />
                </div>
              </CardHeader>
              
              {briefing.descricao_resumida && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {briefing.descricao_resumida}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
