
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
    console.log('🔍 [TermosProtection] URL atual:', window.location.pathname)
    
    if (!loading && !podeUsarSistema && !termosRejeitados) {
      console.log('🔄 [TermosProtection] Redirecionando para /termos')
      
      // Verificar se já não está na página de termos para evitar loop
      if (window.location.pathname !== '/termos') {
        try {
          navigate('/termos')
          
          // Fallback se a navegação não funcionar
          setTimeout(() => {
            if (window.location.pathname !== '/termos') {
              console.log('🔄 [TermosProtection] Fallback: usando window.location')
              window.location.href = '/termos'
            }
          }, 100)
        } catch (error) {
          console.error('❌ [TermosProtection] Erro na navegação:', error)
          window.location.href = '/termos'
        }
      }
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
