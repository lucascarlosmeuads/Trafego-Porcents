
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import type { SacSolicitacao } from '@/hooks/useSacData'

interface SacFiltersProps {
  solicitacoes: SacSolicitacao[]
  onFilterChange: (filtered: SacSolicitacao[]) => void
  defaultStatusFilter?: 'ativos' | 'concluidos' | 'todos'
}

export function SacFilters({ solicitacoes, onFilterChange, defaultStatusFilter = 'ativos' }: SacFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoProblema, setTipoProblema] = useState<string>('all')
  const [gestor, setGestor] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter)

  // Extrair tipos únicos de problema
  const tiposProblema = Array.from(
    new Set(solicitacoes.map(s => s.tipo_problema).filter(Boolean))
  ).sort()

  // Extrair gestores únicos
  const gestores = Array.from(
    new Set(solicitacoes.map(s => s.nome_gestor).filter(Boolean))
  ).sort()

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...solicitacoes]

    // Filtro de status (novo)
    if (statusFilter === 'ativos') {
      filtered = filtered.filter(s => s.status === 'aberto' || s.status === 'em_andamento')
    } else if (statusFilter === 'concluidos') {
      filtered = filtered.filter(s => s.status === 'concluido')
    }
    // Se statusFilter === 'todos', não filtra por status

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.nome.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.descricao.toLowerCase().includes(term) ||
        s.whatsapp.includes(term)
      )
    }

    // Filtro por tipo de problema
    if (tipoProblema !== 'all') {
      filtered = filtered.filter(s => s.tipo_problema === tipoProblema)
    }

    // Filtro por gestor
    if (gestor !== 'all') {
      filtered = filtered.filter(s => s.nome_gestor === gestor)
    }

    onFilterChange(filtered)
  }, [searchTerm, tipoProblema, gestor, statusFilter, solicitacoes, onFilterChange])

  const clearFilters = () => {
    setSearchTerm('')
    setTipoProblema('all')
    setGestor('all')
    setStatusFilter(defaultStatusFilter)
  }

  const hasActiveFilters = searchTerm || tipoProblema !== 'all' || gestor !== 'all' || statusFilter !== defaultStatusFilter

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email, descrição ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativos">Ativos</SelectItem>
              <SelectItem value="concluidos">Concluídos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por tipo de problema */}
          <Select value={tipoProblema} onValueChange={setTipoProblema}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Tipo de Problema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tiposProblema.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por gestor */}
          <Select value={gestor} onValueChange={setGestor}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Gestor Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os gestores</SelectItem>
              {gestores.map((g) => (
                <SelectItem key={g} value={g || ''}>
                  {g || 'Sem gestor'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>Filtros ativos</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
