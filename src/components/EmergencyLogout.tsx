
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export function EmergencyLogout() {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleEmergencyLogout = async () => {
    if (isLoading) return // Evitar cliques duplos
    
    setIsLoading(true)
    console.log('🚨 [EmergencyLogout] Logout de emergência iniciado')
    
    try {
      // Limpeza imediata do localStorage
      console.log('🧹 [EmergencyLogout] Limpando localStorage')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('🗑️ [EmergencyLogout] Removendo chave:', key)
          localStorage.removeItem(key)
        }
      })
      
      // Chamar função de logout
      console.log('🚪 [EmergencyLogout] Chamando signOut()')
      await signOut()
      
    } catch (error) {
      console.error('❌ [EmergencyLogout] Erro no logout:', error)
    } finally {
      // Em qualquer caso, forçar redirecionamento
      console.log('🔄 [EmergencyLogout] Forçando redirecionamento')
      window.location.href = '/'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <Button
        onClick={handleEmergencyLogout}
        disabled={isLoading}
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-red-500 font-semibold"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isLoading ? 'Saindo...' : 'Logout'}
      </Button>
    </div>
  )
}
