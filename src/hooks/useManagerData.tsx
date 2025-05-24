import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export interface Cliente {
  id: string
  data_venda: string | null
  nome_cliente: string | null
  telefone: string | null
  email_cliente: string | null
  vendedor: string | null
  email_gestor: string | null
  status_campanha: string | null
  data_limite: string | null
  link_grupo: string | null
  link_briefing: string | null
  link_criativo: string | null
  link_site: string | null
  numero_bm: string | null
  comissao_paga: boolean | null
  valor_comissao: number | null
  created_at: string | null
  data_subida_campanha: string | null
  data_agendamento: string | null
  comissao: string | null
  status_envio: string | null
  site_status?: string | null
}

export function useManagerData(emailToUse: string, isAdmin: boolean, selectedManager?: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    console.log(`🔄 === FETCH CLIENTES ===`)
    console.log(`📧 Email para busca: "${emailToUse}"`)
    console.log(`👤 Selected Manager: "${selectedManager}"`)
    console.log(`🛡️ Is Admin: ${isAdmin}`)
    
    if (!emailToUse) {
      console.log('❌ Email não fornecido, abortando busca')
      setError('Email não fornecido')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let tableName = ''
      let managerName = ''

      // Para admin: usar selectedManager para determinar qual tabela buscar
      if (isAdmin && selectedManager) {
        if (selectedManager === 'Andreza') {
          tableName = 'clientes_andreza'
          managerName = 'Andreza'
        } else if (selectedManager === 'Lucas Falcão') {
          tableName = 'clientes_lucas_falcao'
          managerName = 'Lucas Falcão'
        } else {
          console.log('❌ Manager selecionado não reconhecido:', selectedManager)
          setError('Gestor selecionado não encontrado')
          setLoading(false)
          return
        }
      } else {
        // Para gestor: usar o email do usuário
        if (emailToUse === 'andreza@mktfy.com.br') {
          tableName = 'clientes_andreza'
          managerName = 'Andreza'
        } else if (emailToUse === 'lucas@mktfy.com.br') {
          tableName = 'clientes_lucas_falcao'
          managerName = 'Lucas Falcão'
        } else {
          console.log('❌ Email não reconhecido para busca na tabela')
          setError('Gestor não encontrado')
          setLoading(false)
          return
        }
      }

      console.log(`🗂️ Buscando na tabela: "${tableName}"`)
      setCurrentManager(managerName)

      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Erro ao buscar clientes:', fetchError)
        setError(`Erro ao carregar clientes: ${fetchError.message}`)
        return
      }

      console.log(`✅ Clientes encontrados: ${data?.length || 0}`)
      if (data && data.length > 0) {
        console.log(`📊 Primeiro cliente:`, data[0])
      }

      setClientes(data || [])
    } catch (err) {
      console.error('❌ Erro inesperado:', err)
      setError('Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [emailToUse, selectedManager, isAdmin])

  const updateCliente = async (clienteId: string, field: string, value: any): Promise<boolean> => {
    console.log(`🔄 === UPDATE CLIENTE ===`)
    console.log(`🆔 Cliente ID: "${clienteId}"`)
    console.log(`🔧 Campo: "${field}"`)
    console.log(`💾 Valor: "${value}"`)

    if (!emailToUse && !selectedManager) {
      console.error('❌ Email nem manager fornecido para update')
      return false
    }

    // Determine the table name
    let tableName = ''
    if (isAdmin && selectedManager) {
      if (selectedManager === 'Andreza') {
        tableName = 'clientes_andreza'
      } else if (selectedManager === 'Lucas Falcão') {
        tableName = 'clientes_lucas_falcao'
      } else {
        console.error('❌ Manager selecionado não reconhecido para update:', selectedManager)
        return false
      }
    } else {
      if (emailToUse === 'andreza@mktfy.com.br') {
        tableName = 'clientes_andreza'
      } else if (emailToUse === 'lucas@mktfy.com.br') {
        tableName = 'clientes_lucas_falcao'
      } else {
        console.error('❌ Email não reconhecido para update:', emailToUse)
        return false
      }
    }

    try {
      // Handle site status updates
      if (field === 'site_status' || value === 'aguardando_link' || value === 'nao_precisa') {
        let updateData: any = {}
        
        if (value === 'aguardando_link') {
          updateData.site_status = 'aguardando_link'
        } else if (value === 'nao_precisa') {
          updateData.site_status = 'nao_precisa'
        } else if (value === 'finalizado') {
          updateData.site_status = 'finalizado'
        }
        
        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', clienteId)

        if (error) {
          console.error('❌ Erro no update do site status:', error)
          return false
        }
      } else if (field === 'link_site') {
        // When updating link_site, also update site_status to finalizado
        const { error } = await supabase
          .from(tableName)
          .update({ 
            link_site: value,
            site_status: 'finalizado'
          })
          .eq('id', clienteId)

        if (error) {
          console.error('❌ Erro no update do link_site:', error)
          return false
        }
      } else {
        // Regular field update
        const { error } = await supabase
          .from(tableName)
          .update({ [field]: value })
          .eq('id', clienteId)

        if (error) {
          console.error('❌ Erro no update:', error)
          return false
        }
      }

      console.log('✅ Update realizado com sucesso')
      
      // Refresh the data
      await fetchClientes()
      return true
    } catch (error) {
      console.error('❌ Erro inesperado no update:', error)
      return false
    }
  }

  const addCliente = async (clienteData: Partial<Cliente>): Promise<boolean> => {
    console.log(`🔄 === ADD CLIENTE ===`)
    console.log(`📧 Email gestor: "${emailToUse}"`)
    console.log(`👤 Selected Manager: "${selectedManager}"`)
    console.log(`📊 Dados do cliente:`, clienteData)

    if (!emailToUse && !selectedManager) {
      console.error('❌ Email nem manager fornecido para adicionar cliente')
      toast({
        title: "Erro",
        description: "Email do gestor não encontrado",
        variant: "destructive",
      })
      return false
    }

    // Determine the table name and email for insertion
    let tableName = ''
    let emailGestor = emailToUse
    
    if (isAdmin && selectedManager) {
      if (selectedManager === 'Andreza') {
        tableName = 'clientes_andreza'
        emailGestor = 'andreza@mktfy.com.br'
      } else if (selectedManager === 'Lucas Falcão') {
        tableName = 'clientes_lucas_falcao'
        emailGestor = 'lucas@mktfy.com.br'
      } else {
        console.error('❌ Manager selecionado não reconhecido para adicionar cliente:', selectedManager)
        toast({
          title: "Erro",
          description: "Gestor selecionado não autorizado a adicionar clientes",
          variant: "destructive",
        })
        return false
      }
    } else {
      if (emailToUse === 'andreza@mktfy.com.br') {
        tableName = 'clientes_andreza'
      } else if (emailToUse === 'lucas@mktfy.com.br') {
        tableName = 'clientes_lucas_falcao'
      } else {
        console.error('❌ Email não reconhecido para adicionar cliente:', emailToUse)
        toast({
          title: "Erro",
          description: "Gestor não autorizado a adicionar clientes",
          variant: "destructive",
        })
        return false
      }
    }

    try {
      const dataToInsert = {
        ...clienteData,
        email_gestor: emailGestor,
        created_at: new Date().toISOString(),
        site_status: 'pendente' // Default site status
      }

      console.log(`🗂️ Inserindo na tabela: "${tableName}"`)
      console.log(`📊 Dados finais:`, dataToInsert)

      const { data, error } = await supabase
        .from(tableName)
        .insert([dataToInsert])
        .select()

      if (error) {
        console.error('❌ Erro ao inserir cliente:', error)
        toast({
          title: "Erro",
          description: `Falha ao adicionar cliente: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      console.log('✅ Cliente adicionado com sucesso:', data)
      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
      })

      // Refresh the data
      await fetchClientes()
      return true
    } catch (error) {
      console.error('❌ Erro inesperado ao adicionar cliente:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao adicionar cliente",
        variant: "destructive",
      })
      return false
    }
  }

  const refetch = useCallback(() => {
    fetchClientes()
  }, [fetchClientes])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    updateCliente,
    addCliente,
    refetch,
    currentManager
  }
}
