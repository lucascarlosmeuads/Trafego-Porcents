
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissaoSistema } from '@/hooks/usePermissaoSistema'
import { useTermosAceitos } from '@/hooks/useTermosAceitos'
import { TermosRejeitadosScreen } from './TermosRejeitadosScreen'

interface TermosProtectionProps {
  children: React.ReactNode
}

export function TermosProtection({ children }: TermosProtectionProps) {
  const navigate = useNavigate()
  const { podeUsarSistema, termosRejeitados, loading } = usePermissaoSistema()
  const { marcarTermosAceitos, marcarTermosRejeitados } = useTermosAceitos()

  // Redirecionar para página de termos se necessário
  useEffect(() => {
    console.log('🔍 [TermosProtection] Estado:', { loading, podeUsarSistema, termosRejeitados })
    
    if (!loading && !podeUsarSistema && !termosRejeitados) {
      console.log('🔄 [TermosProtection] Redirecionando para /termos')
      navigate('/termos')
    }
  }, [loading, podeUsarSistema, termosRejeitados, navigate])

  // Mostrar loading enquanto verifica os termos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Se rejeitou os termos, mostrar tela de encerramento
  if (termosRejeitados) {
    return <TermosRejeitadosScreen />
  }

  // Se não pode usar o sistema, será redirecionado para /termos
  if (!podeUsarSistema) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-400">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Se pode usar o sistema, mostrar o conteúdo normal
  return <>{children}</>
}
