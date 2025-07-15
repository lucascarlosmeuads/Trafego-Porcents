
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingFallback } from '@/components/LoadingFallback'
import { useSacGestorReport } from '@/hooks/useSacGestorReport'
import { AlertCircle, Users, TrendingUp, Clock, RefreshCw, Download } from 'lucide-react'

export function SacGestorReport() {
  const { stats, loading, error, refetch } = useSacGestorReport()

  if (loading) {
    return <LoadingFallback />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar relatório</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const getPriorityLevel = (totalSacs: number, abertos: number) => {
    if (abertos >= 5 || totalSacs >= 15) return 'high'
    if (abertos >= 3 || totalSacs >= 10) return 'medium'
    return 'low'
  }

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Alta Demanda'
      case 'medium': return 'Demanda Moderada'
      default: return 'Demanda Baixa'
    }
  }

  // Calcular métricas gerais
  const totalGestores = stats.length
  const totalSacs = stats.reduce((acc, s) => acc + s.total_sacs, 0)
  const totalAbertos = stats.reduce((acc, s) => acc + s.sacs_abertos, 0)
  const gestoresComProblemas = stats.filter(s => getPriorityLevel(s.total_sacs, s.sacs_abertos) === 'high').length

  const exportToCsv = () => {
    const headers = ['Gestor', 'Email', 'Total SACs', 'Abertos', 'Em Andamento', 'Concluídos', 'Taxa Conclusão (%)', 'Tempo Médio (h)']
    const csvContent = [
      headers.join(','),
      ...stats.map(stat => [
        `"${stat.nome_gestor}"`,
        stat.email_gestor,
        stat.total_sacs,
        stat.sacs_abertos,
        stat.sacs_em_andamento,
        stat.sacs_concluidos,
        stat.taxa_conclusao,
        stat.tempo_medio_resolucao_horas || 'N/A'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-sac-gestores-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatório SAC por Gestor</h1>
          <p className="text-gray-600 mt-2">
            Identifique quais gestores estão com mais demanda no atendimento SAC
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Gestores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGestores}</div>
            <CardDescription>Com SACs atribuídos</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de SACs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSacs}</div>
            <CardDescription>Todos os períodos</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SACs Abertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalAbertos}</div>
            <CardDescription>Aguardando atendimento</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestores c/ Alta Demanda</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gestoresComProblemas}</div>
            <CardDescription>Precisam de atenção</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Gestores */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Gestor</CardTitle>
          <CardDescription>
            Gestores ordenados por total de SACs (maior demanda primeiro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gestor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Total SACs</TableHead>
                <TableHead className="text-center">Abertos</TableHead>
                <TableHead className="text-center">Em Andamento</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Taxa Conclusão</TableHead>
                <TableHead className="text-center">Tempo Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => {
                const priorityLevel = getPriorityLevel(stat.total_sacs, stat.sacs_abertos)
                return (
                  <TableRow key={stat.email_gestor}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{stat.nome_gestor}</div>
                        <div className="text-sm text-gray-500">{stat.email_gestor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(priorityLevel)}>
                        {getPriorityLabel(priorityLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {stat.total_sacs}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stat.sacs_abertos > 0 ? 'destructive' : 'outline'}>
                        {stat.sacs_abertos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stat.sacs_em_andamento > 0 ? 'secondary' : 'outline'}>
                        {stat.sacs_em_andamento}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stat.sacs_concluidos > 0 ? 'default' : 'outline'}>
                        {stat.sacs_concluidos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${
                        stat.taxa_conclusao >= 80 ? 'text-green-600' :
                        stat.taxa_conclusao >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stat.taxa_conclusao}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.tempo_medio_resolucao_horas ? (
                        <span className={`font-medium ${
                          stat.tempo_medio_resolucao_horas <= 24 ? 'text-green-600' :
                          stat.tempo_medio_resolucao_horas <= 48 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stat.tempo_medio_resolucao_horas}h
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {stats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum gestor com SACs encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SacGestorReport
