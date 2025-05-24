
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientesTable } from './ClientesTable'
import { AdicionarClienteModal } from './AdicionarClienteModal'
import { UserPlus } from 'lucide-react'

export function GestorDashboard() {
  const { user, currentManagerName } = useAuth()
  const [podeAdicionarCliente, setPodeAdicionarCliente] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verificarPermissoes()
  }, [user])

  const verificarPermissoes = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('gestores')
        .select('pode_adicionar_cliente, ativo')
        .eq('email', user.email)
        .single()

      if (error) {
        console.log('Gestor não encontrado na tabela gestores')
        setPodeAdicionarCliente(false)
      } else {
        setPodeAdicionarCliente(data.pode_adicionar_cliente && data.ativo)
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
      setPodeAdicionarCliente(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClienteAdicionado = () => {
    // Força atualização da tabela de clientes
    window.location.reload()
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Verificando permissões...</div>
  }

  return (
    <div className="space-y-6">
      {podeAdicionarCliente && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Gerenciar Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-start">
              <AdicionarClienteModal onClienteAdicionado={handleClienteAdicionado} />
            </div>
          </CardContent>
        </Card>
      )}
      
      <ClientesTable selectedManager={currentManagerName} />
    </div>
  )
}
