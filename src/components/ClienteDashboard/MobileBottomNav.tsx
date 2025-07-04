
import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FileText, 
  Upload, 
  Headphones, 
  DollarSign,
  Globe,
  BarChart3,
  CheckSquare,
  MessageCircle 
} from 'lucide-react'

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const navItems = [
    { id: 'overview', icon: Home, label: 'Início' },
    { id: 'briefing', icon: FileText, label: 'Form' },
    { id: 'arquivos', icon: Upload, label: 'Upload' },
    { id: 'comissao', icon: DollarSign, label: 'Comissão' },
    { id: 'steps', icon: CheckSquare, label: 'Passos' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50 mobile-safe-nav">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
