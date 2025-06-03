
import { 
  Home, 
  FileText, 
  Upload, 
  TrendingUp, 
  Headphones 
} from 'lucide-react'

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems = [
    { id: 'overview', label: 'Início', icon: Home },
    { id: 'briefing', label: 'Form', icon: FileText },
    { id: 'arquivos', label: 'Files', icon: Upload },
    { id: 'vendas', label: 'Vendas', icon: TrendingUp },
    { id: 'suporte', label: 'Suporte', icon: Headphones },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-teal-400 bg-teal-900/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
