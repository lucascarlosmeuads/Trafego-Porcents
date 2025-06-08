
import { useState, useEffect } from 'react'
import { MetaAdsPasswordPrompt } from './MetaAdsPasswordPrompt'
import { MetaAdsForm } from './MetaAdsForm'
import { MetaAdsReport } from './MetaAdsReport'
import { useMetaAds } from '@/hooks/useMetaAds'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface MetaAdsInterfaceProps {
  onBack?: () => void
}

export function MetaAdsInterface({ onBack }: MetaAdsInterfaceProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const { report, loadConfig } = useMetaAds()

  useEffect(() => {
    // Verificar se já está autenticado na sessão
    const isAuth = sessionStorage.getItem('meta_ads_authenticated') === 'true'
    setIsAuthenticated(isAuth)
    
    if (isAuth) {
      loadConfig()
    } else {
      setShowPasswordPrompt(true)
    }
  }, [loadConfig])

  const handlePasswordCorrect = () => {
    setIsAuthenticated(true)
    setShowPasswordPrompt(false)
    sessionStorage.setItem('meta_ads_authenticated', 'true')
    loadConfig()
  }

  const handlePasswordClose = () => {
    setShowPasswordPrompt(false)
    if (onBack) {
      onBack()
    }
  }

  const handleReportGenerated = () => {
    // Força scroll para o relatório após geração
    setTimeout(() => {
      const reportElement = document.querySelector('[data-meta-ads-report]')
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  if (!isAuthenticated) {
    return (
      <MetaAdsPasswordPrompt
        isOpen={showPasswordPrompt}
        onPasswordCorrect={handlePasswordCorrect}
        onClose={handlePasswordClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Meta Ads Manager</h1>
          <p className="text-gray-600">
            Configure sua API e visualize os relatórios de suas campanhas Meta
          </p>
        </div>

        <MetaAdsForm onReportGenerated={handleReportGenerated} />

        {report && (
          <div data-meta-ads-report>
            <MetaAdsReport report={report} />
          </div>
        )}
      </div>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
