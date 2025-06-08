
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function AdminRelatoriosHeader() {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Sistema
            </Button>
            
            <div className="h-6 w-px bg-gray-700" />
            
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Meta Ads Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Painel Administrativo Ativo
          </div>
        </div>
      </div>
    </div>
  )
}
