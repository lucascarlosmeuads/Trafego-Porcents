
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, UserPlus, Search } from 'lucide-react'
import { STATUS_CAMPANHA } from '@/lib/supabase'

interface TableFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  onAddClient?: () => void
  onAddClientRow?: () => void
  isAdmin?: boolean
  isGestorDashboard?: boolean
  // Props específicas para ProblemasPanel
  siteStatusFilter?: string
  setSiteStatusFilter?: (status: string) => void
  showSiteStatusFilter?: boolean
  getStatusColor?: (status: string) => string
}

export function TableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onAddClient,
  onAddClientRow,
  isAdmin = false,
  isGestorDashboard = false,
  siteStatusFilter,
  setSiteStatusFilter,
  showSiteStatusFilter = false,
  getStatusColor
}: TableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {STATUS_CAMPANHA.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showSiteStatusFilter && setSiteStatusFilter && (
        <Select value={siteStatusFilter} onValueChange={setSiteStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status do site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
            <SelectItem value="revisao">Em Revisão</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      )}

      {onAddClient && onAddClientRow && (
        <div className="flex gap-2">
          <Button onClick={onAddClient} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Cliente
          </Button>
          
          {isAdmin && (
            <Button onClick={onAddClientRow} variant="outline" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Linha Rápida
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
