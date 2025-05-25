
interface GestorMenuProps {
  selectedManager: string | null
  activeTab: string
  onManagerSelect: (manager: string | null) => void
}

export function GestorMenu({ selectedManager, activeTab, onManagerSelect }: GestorMenuProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onManagerSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
          selectedManager === null && activeTab === 'clientes'
            ? 'bg-primary text-primary-foreground'
            : 'text-card-foreground hover:bg-muted'
        }`}
      >
        Todos os Gestores
      </button>
    </div>
  )
}
