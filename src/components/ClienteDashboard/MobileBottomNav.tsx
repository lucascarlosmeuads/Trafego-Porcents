
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
              activeTab === item.id
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
