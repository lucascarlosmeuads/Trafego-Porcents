
import {
  TableHead,
  TableRow
} from '@/components/ui/table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TableHeaderProps {
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (field: string) => void
  showComissaoAvancada?: boolean
  showComissaoSimples?: boolean
  isAdmin?: boolean
  showEmailGestor?: boolean
}

function TableHeaderCell({ 
  field, 
  label, 
  sortField, 
  sortDirection, 
  onSort 
}: {
  field: string
  label: string
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (field: string) => void
}) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(field)}
        className="h-auto p-0 font-semibold text-white hover:text-gray-300"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )
}

export function TableHeader({ 
  sortField, 
  sortDirection, 
  onSort,
  showComissaoAvancada = false,
  showComissaoSimples = false,
  isAdmin = false,
  showEmailGestor = false
}: TableHeaderProps) {
  return (
    <TableHead className="w-full">
      <TableRow>
        <TableHeaderCell 
          field="nome_cliente" 
          label="Cliente" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="email_cliente" 
          label="Email" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="telefone" 
          label="Telefone" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="valor_venda_inicial" 
          label="Valor Venda" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="status_campanha" 
          label="Status" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />

        {showComissaoAvancada && (
          <>
            <TableHeaderCell 
              field="comissao" 
              label="Comissão" 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <TableHeaderCell 
              field="saque_solicitado" 
              label="Saque" 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </>
        )}

        {showComissaoSimples && (
          <TableHeaderCell 
            field="comissao" 
            label="Comissão" 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
        )}

        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHead>
  )
}
