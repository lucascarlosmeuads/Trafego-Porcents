
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-gradient-to-t from-blue-50 to-transparent scale-105' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
