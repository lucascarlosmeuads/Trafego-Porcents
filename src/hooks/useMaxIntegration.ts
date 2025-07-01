
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface MaxIntegrationConfig {
  id: string
  gestor_email: string
  gestor_nome: string
  integration_active: boolean
  webhook_url: string | null
  webhook_secret: string | null
  created_at: string
  updated_at: string
}

export interface MaxIntegrationLog {
  id: string
  pedido_id: string | null
  status: string
  dados_originais: any
  cliente_criado_id: number | null
  gestor_atribuido: string | null
  erro_detalhes: string | null
  processed_at: string
  created_at: string
}

export function useMaxIntegration() {
  const [config, setConfig] = useState<MaxIntegrationConfig | null>(null)
  const [logs, setLogs] = useState<MaxIntegrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Buscar configuração atual
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('max_integration_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração Max:', error)
        throw error
      }

      setConfig(data)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar configuração da integração",
        variant: "destructive"
      })
    }
  }

  // Buscar logs recentes
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('max_integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro ao buscar logs Max:', error)
        throw error
      }

      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar logs da integração",
        variant: "destructive"
      })
    }
  }

  // Atualizar configuração
  const updateConfig = async (updates: Partial<MaxIntegrationConfig>) => {
    if (!config) return false

    setUpdating(true)
    try {
      const { data, error } = await supabase
        .from('max_integration_config')
        .update(updates)
        .eq('id', config.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração:', error)
        throw error
      }

      setConfig(data)
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso"
      })
      return true
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar configuração",
        variant: "destructive"
      })
      return false
    } finally {
      setUpdating(false)
    }
  }

  // Alterar gestor ativo
  const changeActiveGestor = async (gestorEmail: string, gestorNome: string) => {
    return await updateConfig({
      gestor_email: gestorEmail,
      gestor_nome: gestorNome
    })
  }

  // Ativar/desativar integração
  const toggleIntegration = async (active: boolean) => {
    return await updateConfig({
      integration_active: active
    })
  }

  // Testar webhook - CORRIGIDO para usar supabase.functions.invoke
  const testWebhook = async () => {
    console.log('🧪 [Max Integration] Iniciando teste do webhook...')
    
    try {
      const testData = {
        id: `test-${Date.now()}`,
        nome_cliente: 'Cliente Teste App Max',
        telefone: '(11) 99999-9999',
        email_cliente: 'teste@appmax.com',
        produto: 'Produto Teste',
        valor: 197.00,
        data_pedido: new Date().toISOString(),
        observacoes: 'Teste de integração automática do App Max'
      }

      console.log('📦 [Max Integration] Dados de teste:', testData)

      // Usar supabase.functions.invoke ao invés de fetch direto
      const { data, error } = await supabase.functions.invoke('max-webhook', {
        body: testData
      })

      console.log('📡 [Max Integration] Resposta do webhook:', { data, error })

      if (error) {
        console.error('❌ [Max Integration] Erro na invocação:', error)
        throw error
      }

      // Verificar se a resposta indica sucesso
      if (data?.success || data?.message?.includes('sucesso')) {
        toast({
          title: "Sucesso",
          description: "Teste do webhook realizado com sucesso! Verifique os logs para detalhes.",
        })
        
        // Recarregar logs após teste bem-sucedido
        setTimeout(() => {
          fetchLogs()
        }, 1000)
        
        return true
      } else {
        // Se não houve erro mas também não foi sucesso, pode ser duplicata ou outro caso
        const message = data?.message || 'Teste realizado, verifique os logs'
        toast({
          title: "Teste Realizado",
          description: message,
        })
        
        // Recarregar logs mesmo assim
        setTimeout(() => {
          fetchLogs()
        }, 1000)
        
        return true
      }
    } catch (error: any) {
      console.error('💥 [Max Integration] Erro no teste do webhook:', error)
      
      let errorMessage = 'Falha no teste do webhook'
      
      if (error.message) {
        errorMessage = `Erro: ${error.message}`
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        title: "Erro no Teste",
        description: errorMessage,
        variant: "destructive"
      })
      
      return false
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchConfig(), fetchLogs()])
      setLoading(false)
    }

    loadData()
  }, [])

  return {
    config,
    logs,
    loading,
    updating,
    updateConfig,
    changeActiveGestor,
    toggleIntegration,
    testWebhook,
    refetch: () => Promise.all([fetchConfig(), fetchLogs()])
  }
}
