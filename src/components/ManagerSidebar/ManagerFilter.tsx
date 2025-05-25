
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface ManagerFilterProps {
  selectedManager: string | null
  activeTab: string
  onManagerSelect: (manager: string | null) => void
  onTabChange: (tab: string) => void
}

export function ManagerFilter({ 
  selectedManager, 
  activeTab, 
  onManagerSelect, 
  onTabChange 
}: ManagerFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleManagerSelect = (email: string | null) => {
    onTabChange('clientes')
    onManagerSelect(email)
  }

  return (
    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <CollapsibleTrigger className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between text-card-foreground hover:bg-muted">
        <span className="font-medium">Filtrar por Gestor</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        <button
          onClick={() => handleManagerSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            selectedManager === null && activeTab === 'clientes'
              ? 'bg-primary text-primary-foreground'
              : 'text-card-foreground hover:bg-muted'
          }`}
        >
          Todos os Gestores
        </button>
      </CollapsibleContent>
    </Collapsible>
  )
}
