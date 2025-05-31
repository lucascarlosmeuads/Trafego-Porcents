
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { memo } from 'react'

interface AdminTableFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  gestorFilter: string
  onGestorFilterChange: (value: string) => void
  gestores: Array<{ email: string, nome: string }>
}

export const AdminTableFilters = memo(function AdminTableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  gestorFilter,
  onGestorFilterChange,
  gestores
}: AdminTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 rounded border border-border bg-background text-foreground"
        >
          <option value="">Todos os Status</option>
          <option value="Cliente Novo">Cliente Novo</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Pausado">Pausado</option>
        </select>
        
        <select
          value={gestorFilter}
          onChange={(e) => onGestorFilterChange(e.target.value)}
          className="px-3 py-2 rounded border border-border bg-background text-foreground"
        >
          <option value="">Todos os Gestores</option>
          {gestores.map(gestor => (
            <option key={gestor.email} value={gestor.email}>
              {gestor.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
})
