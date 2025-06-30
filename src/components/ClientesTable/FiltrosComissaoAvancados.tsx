
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cliente } from '@/lib/supabase'
import { Filter, X, Star, DollarSign } from 'lucide-react'

export interface FiltroComissao {
  status: 'todos' | 'pagos' | 'pendentes' | 'ultimos_pagos'
  valorMin?: number
  valorMax?: number
  gestor?: string
}

interface FiltrosComissaoAvancadosProps {
  clientes: Cliente[]
  filtros: FiltroComissao
  onFiltrosChange: (filtros: FiltroComissao) => void
  gestores?: Array<{ email: string, nome: string }>
}

export function FiltrosComissaoAvancados({
  clientes,
  filtros,
  onFiltrosChange,
  gestores = []
}: FiltrosComissaoAvancadosProps) {
  const [valorMinInput, setValorMinInput] = useState(filtros.valorMin?.toString() || '')
  const [valorMaxInput, setValorMaxInput] = useState(filtros.valorMax?.toString() || '')

  const handleStatusChange = (status: string) => {
    onFiltrosChange({
      ...filtros,
      status: status as FiltroComissao['status']
    })
  }

  const handleGestorChange = (gestor: string) => {
    onFiltrosChange({
      ...filtros,
      gestor: gestor === 'todos' ? undefined : gestor
    })
  }

  const handleValorMinChange = (valor: string) => {
    setValorMinInput(valor)
    const num = parseFloat(valor)
    onFiltrosChange({
      ...filtros,
      valorMin: isNaN(num) ? undefined : num
    })
  }

  const handleValorMaxChange = (valor: string) => {
    setValorMaxInput(valor)
    const num = parseFloat(valor)
    onFiltrosChange({
      ...filtros,
      valorMax: isNaN(num) ? undefined : num
    })
  }

  const limparFiltros = () => {
    setValorMinInput('')
    setValorMaxInput('')
    onFiltrosChange({
      status: 'todos'
    })
  }

  const contarPorStatus = () => {
    const pagos = clientes.filter(c => c.comissao === 'Pago').length
    const pendentes = clientes.filter(c => c.comissao !== 'Pago').length
    const ultimosPagos = clientes.filter(c => c.eh_ultimo_pago).length
    
    return { pagos, pendentes, ultimosPagos }
  }

  const { pagos, pendentes, ultimosPagos } = contarPorStatus()

  const temFiltrosAtivos = filtros.status !== 'todos' || 
                          filtros.valorMin !== undefined || 
                          filtros.valorMax !== undefined || 
                          filtros.gestor !== undefined

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Comissão
            </CardTitle>
            <CardDescription>
              Filtre por status, valor e gestor responsável
            </CardDescription>
          </div>
          {temFiltrosAtivos && (
            <Button variant="outline" size="sm" onClick={limparFiltros}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros por Status com contadores */}
        <div className="space-y-2">
          <Label>Status da Comissão</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtros.status === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('todos')}
            >
              Todos
              <Badge variant="secondary" className="ml-2">
                {clientes.length}
              </Badge>
            </Button>
            
            <Button
              variant={filtros.status === 'pendentes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('pendentes')}
              className="gap-1"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              Pendentes
              <Badge variant="secondary" className="ml-2">
                {pendentes}
              </Badge>
            </Button>
            
            <Button
              variant={filtros.status === 'pagos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('pagos')}
              className="gap-1"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Pagos
              <Badge variant="secondary" className="ml-2">
                {pagos}
              </Badge>
            </Button>
            
            <Button
              variant={filtros.status === 'ultimos_pagos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('ultimos_pagos')}
              className="gap-1"
            >
              <Star className="h-3 w-3 text-yellow-500" />
              Últimos Pagos
              <Badge variant="secondary" className="ml-2">
                {ultimosPagos}
              </Badge>
            </Button>
          </div>
        </div>

        {/* Filtros por Valor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valor-min">Valor Mínimo (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="valor-min"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={valorMinInput}
                onChange={(e) => handleValorMinChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="valor-max">Valor Máximo (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="valor-max"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000.00"
                value={valorMaxInput}
                onChange={(e) => handleValorMaxChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Filtro por Gestor */}
        {gestores.length > 0 && (
          <div className="space-y-2">
            <Label>Gestor Responsável</Label>
            <Select 
              value={filtros.gestor || 'todos'} 
              onValueChange={handleGestorChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Gestores</SelectItem>
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.email} value={gestor.email}>
                    {gestor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Indicador de filtros ativos */}
        {temFiltrosAtivos && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {filtros.status !== 'todos' && (
              <Badge variant="outline">
                Status: {filtros.status.replace('_', ' ')}
              </Badge>
            )}
            {filtros.valorMin !== undefined && (
              <Badge variant="outline">
                Min: R$ {filtros.valorMin.toFixed(2)}
              </Badge>
            )}
            {filtros.valorMax !== undefined && (
              <Badge variant="outline">
                Max: R$ {filtros.valorMax.toFixed(2)}
              </Badge>
            )}
            {filtros.gestor && (
              <Badge variant="outline">
                Gestor: {gestores.find(g => g.email === filtros.gestor)?.nome || filtros.gestor}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
