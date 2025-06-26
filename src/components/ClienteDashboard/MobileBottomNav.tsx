
import { Home, FileText, Upload, DollarSign, BarChart, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems = [
    {
      id: 'overview',
      label: 'Início',
      icon: Home
    },
    {
      id: 'briefing',
      label: 'Briefing',
      icon: FileText
    },
    {
      id: 'arquivos',
      label: 'Materiais',
      icon: Upload
    },
    {
      id: 'campanhas',
      label: 'Campanhas',
      icon: BarChart
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: DollarSign
    },
    {
      id: 'suporte',
      label: 'Suporte',
      icon: HelpCircle
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 mx-1",
              "active:scale-95 hover:bg-gray-50",
              activeTab === item.id
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            <item.icon className="w-5 h-5 mb-1 flex-shrink-0" />
            <span className="text-xs font-medium leading-tight text-center line-clamp-1 px-1">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
