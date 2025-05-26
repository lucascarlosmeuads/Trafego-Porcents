
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

interface TableHeaderProps {
  showBriefingColumn: boolean
}

export function TableHeader({ showBriefingColumn }: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border/50">
        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="h-8 p-0 font-medium">
            ID
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </th>
        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground min-w-[200px]">
          <Button variant="ghost" size="sm" className="h-8 p-0 font-medium">
            Cliente
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </th>
        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground min-w-[120px]">
          <Button variant="ghost" size="sm" className="h-8 p-0 font-medium">
            Status
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </th>
        {showBriefingColumn && (
          <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground min-w-[120px]">
            Briefing
          </th>
        )}
        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground min-w-[120px]">
          <Button variant="ghost" size="sm" className="h-8 p-0 font-medium">
            Vendedor
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </th>
        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground min-w-[100px]">
          <Button variant="ghost" size="sm" className="h-8 p-0 font-medium">
            Comissão
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </th>
        <th className="text-center py-3 px-2 font-medium text-sm text-muted-foreground min-w-[100px]">
          Ações
        </th>
      </tr>
    </thead>
  )
}
