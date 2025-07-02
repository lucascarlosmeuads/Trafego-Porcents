import {
  TableHead,
  TableRow,
  TableHeaderCell
} from '@/components/ui/table'

interface TableHeaderProps {
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (field: string) => void
  showComissaoAvancada?: boolean
  showComissaoSimples?: boolean
}

export function TableHeader({ 
  sortField, 
  sortDirection, 
  onSort,
  showComissaoAvancada = false,
  showComissaoSimples = false 
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
          field="vendedor" 
          label="Vendedor" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="email_gestor" 
          label="Gestor" 
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

        <TableHeaderCell 
          field="site_status" 
          label="Site" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="data_venda" 
          label="Data Venda" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="created_at" 
          label="Criado em" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
        
        <TableHeaderCell 
          field="data_limite" 
          label="Data Limite" 
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
        />
      </TableRow>
    </TableHead>
  )
}
