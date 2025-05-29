import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/lib/supabase'

interface UseManagerDataResult {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  updateCliente: (id: string, field: string, value: string | boolean | number) => Promise<boolean>
  addCliente: (clienteData: any) => Promise<{ success: boolean; isNewClient: boolean; clientData: any; senhaDefinida: boolean }>
  refetch: () => void
  currentManager: string | null
}

export function useManagerData(
  userEmail: string, 
  isAdminUser: boolean, 
  selectedManager?: string,
  filterType?: 'sites-pendentes' | 'sites-finalizados'
) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentManager, setCurrentManager] = useState<string | null>(null)

  const updateCliente = async (id: string, field: string, value: string | boolean | number) => {
    console.log(`🚀 [useManagerData] === ATUALIZAÇÃO INICIADA ===`)
    console.log(`🆔 ID: ${id} | Campo: ${field} | Valor: ${value}`)
    console.log(`👤 Email: ${userEmail} | Admin: ${isAdminUser}`)

    if (!id || id.trim() === '') {
      console.error('❌ [useManagerData] ID inválido:', id)
      return false
    }

    if (!userEmail || !field) {
      console.error('❌ [useManagerData] Parâmetros obrigatórios em falta')
      return false
    }

    try {
      const numericId = parseInt(id)
      
      if (isNaN(numericId) || numericId <= 0) {
        console.error('❌ [useManagerData] ID inválido após conversão:', { original: id, converted: numericId })
        return false
      }

      let updateQuery = supabase
        .from('todos_clientes')
        .update({ [field]: value })
        .eq('id', numericId)

      const { data: updateData, error: updateError } = await updateQuery.select()

      if (updateError) {
        console.error('❌ [useManagerData] ERRO NO UPDATE:', updateError)
        return false
      }

      console.log('✅ [useManagerData] UPDATE EXECUTADO COM SUCESSO!')
      console.log('✅ [useManagerData] Dados retornados:', updateData)
      
      if (!updateData || updateData.length === 0) {
        console.error('❌ [useManagerData] Nenhum registro atualizado')
        return false
      }
      
      console.log('🎉 [useManagerData] === ATUALIZAÇÃO CONCLUÍDA COM SUCESSO ===')
      
      return true
    } catch (err) {
      console.error('💥 [useManagerData] ERRO CRÍTICO:', err)
      return false
    }
  }

  const addCliente = async (clienteData: any) => {
    if (!userEmail) {
      console.error('❌ [useManagerData] Email do usuário não fornecido')
      return { success: false, isNewClient: false, clientData: null, senhaDefinida: false }
    }

    try {
      console.log('🚀 [useManagerData] === INICIANDO ADIÇÃO DE CLIENTE ===')
      console.log('📥 Dados recebidos:', clienteData)
      console.log('👤 User Email:', userEmail)
      console.log('🔒 IsAdmin:', isAdminUser)
      
      const emailGestorFinal = isAdminUser ? (clienteData.email_gestor || userEmail) : userEmail
      
      // Step 1: Check if client already exists in todos_clientes
      console.log('🔍 [useManagerData] Verificando se cliente já existe...')
      const { data: existingCliente, error: checkError } = await supabase
        .from('todos_clientes')
        .select('id, nome_cliente')
        .eq('email_cliente', clienteData.email_cliente)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [useManagerData] Erro ao verificar cliente existente:', checkError)
        throw new Error(`Erro ao verificar cliente: ${checkError.message}`)
      }

      let clienteJaExistia = false
      let finalClientData = clienteData
      let senhaDefinida = false

      if (existingCliente) {
        console.log('⚠️ [useManagerData] Cliente já existe, fazendo update dos dados...')
        clienteJaExistia = true
        
        // Para clientes existentes, NÃO forçar "Cliente Novo" - manter status atual ou usar o fornecido
        const { data: updatedData, error: updateError } = await supabase
          .from('todos_clientes')
          .update({
            nome_cliente: String(clienteData.nome_cliente || ''),
            telefone: String(clienteData.telefone || ''),
            data_venda: clienteData.data_venda || null,
            vendedor: String(clienteData.vendedor || ''),
            status_campanha: String(clienteData.status_campanha || 'Cliente Novo'), // Manter o status fornecido
            email_gestor: String(emailGestorFinal)
          })
          .eq('id', existingCliente.id)
          .select()
          .single()

        if (updateError) {
          console.error('❌ [useManagerData] Erro ao atualizar cliente existente:', updateError)
          throw new Error(`Erro ao atualizar cliente: ${updateError.message}`)
        }

        finalClientData = { ...clienteData, ...updatedData }
        console.log('✅ [useManagerData] Cliente existente atualizado com sucesso')
      } else {
        // Step 2: Create new client record - SEMPRE usar "Cliente Novo" como status padrão
        const novoCliente = {
          nome_cliente: String(clienteData.nome_cliente || ''),
          telefone: String(clienteData.telefone || ''),
          email_cliente: String(clienteData.email_cliente || ''),
          data_venda: clienteData.data_venda || null,
          vendedor: String(clienteData.vendedor || ''),
          status_campanha: 'Cliente Novo', // ✅ SEMPRE "Cliente Novo" para novos clientes
          email_gestor: String(emailGestorFinal),
          comissao_paga: false,
          valor_comissao: 60.00,
          site_status: 'pendente',
          data_limite: '',
          link_grupo: '',
          link_briefing: '',
          link_criativo: '',
          link_site: '',
          numero_bm: ''
        }

        console.log('📤 [useManagerData] Enviando para Supabase...')
        const { data, error } = await supabase
          .from('todos_clientes')
          .insert([novoCliente])
          .select()
          .single()

        if (error) {
          console.error('❌ [useManagerData] Erro ao inserir cliente:', error)
          throw new Error(`Erro ao adicionar cliente: ${error.message}`)
        }

        finalClientData = { ...clienteData, ...data }
        console.log('✅ [useManagerData] Cliente adicionado com sucesso:', data)

        // Step 3: Create user account with default password for new clients
        console.log('🔐 [useManagerData] Criando conta de usuário com senha padrão...')
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: clienteData.email_cliente,
            password: 'parceriadesucesso',
            options: {
              data: {
                full_name: clienteData.nome_cliente,
                role: 'cliente'
              }
            }
          })

          if (authError) {
            console.error('⚠️ [useManagerData] Erro ao criar conta de usuário:', authError)
            // Não falhar a operação se a conta já existir
            if (!authError.message.includes('already registered')) {
              console.error('❌ [useManagerData] Erro crítico na criação da conta:', authError)
            }
          } else {
            console.log('✅ [useManagerData] Conta de usuário criada com sucesso')
            senhaDefinida = true
          }
        } catch (authErr) {
          console.error('⚠️ [useManagerData] Erro na criação da conta (catch):', authErr)
          // Continuar mesmo se houver erro na criação da conta
        }
      }
      
      // SEMPRE retornar dados estruturados para garantir que o modal funcione
      console.log('🎯 [useManagerData] Retornando dados estruturados:', {
        success: true,
        isNewClient: !clienteJaExistia,
        clientData: finalClientData,
        senhaDefinida
      })
      
      return { 
        success: true, 
        isNewClient: !clienteJaExistia, 
        clientData: finalClientData,
        senhaDefinida
      }
    } catch (error) {
      console.error('💥 [useManagerData] === ERRO GERAL ===')
      console.error('💥 Erro capturado no catch:', error)
      return { success: false, isNewClient: false, clientData: null, senhaDefinida: false }
    }
  }

  const fetchClientes = useCallback(async () => {
    if (!userEmail) {
      console.log('⚠️ [useManagerData] Email não fornecido')
      setLoading(false)
      return
    }

    console.log('🔄 [useManagerData] === INICIANDO BUSCA ===')
    console.log('📧 User Email:', userEmail)
    console.log('👑 Is Admin:', isAdminUser)
    console.log('👤 Selected Manager:', selectedManager)
    console.log('🔍 Filter Type:', filterType)

    try {
      setLoading(true)
      setError(null)

      // Verificar se é criador de sites
      const isSitesUser = userEmail.toLowerCase().includes('criador') || 
                         userEmail.toLowerCase().includes('site') || 
                         userEmail.toLowerCase().includes('webdesign') ||
                         userEmail.toLowerCase().includes('sites') ||
                         userEmail.toLowerCase().includes('web') ||
                         userEmail.toLowerCase().includes('design') ||
                         userEmail.toLowerCase().includes('developer') ||
                         userEmail.toLowerCase().includes('dev')

      console.log('🌐 [useManagerData] É criador de sites:', isSitesUser)

      let query = supabase.from('todos_clientes').select('*')

      // LÓGICA ESPECÍFICA PARA CRIADORES DE SITES
      if (isSitesUser) {
        console.log('🌐 [useManagerData] === MODO CRIADOR DE SITES ===')
        
        if (filterType === 'sites-pendentes') {
          console.log('📋 [useManagerData] Buscando sites pendentes...')
          query = query.eq('site_status', 'aguardando_link')
        } else if (filterType === 'sites-finalizados') {
          console.log('✅ [useManagerData] Buscando sites finalizados...')
          // CORREÇÃO: Apenas verificar se site_status = 'finalizado'
          // Não mais exigir que link_site esteja preenchido
          query = query.eq('site_status', 'finalizado')
        } else {
          // Se não especificou filtro, buscar todos os sites aguardando ou finalizados
          query = query.in('site_status', ['aguardando_link', 'finalizado'])
        }
      } else {
        // LÓGICA PARA GESTORES/ADMINS (manter como estava)
        if (filterType === 'sites-pendentes') {
          query = query.eq('site_status', 'aguardando_link')
        } else if (filterType === 'sites-finalizados') {
          query = query.eq('site_status', 'finalizado')
        } else if (!isAdminUser) {
          query = query.eq('email_gestor', userEmail)
        } else if (selectedManager && selectedManager !== 'all') {
          query = query.eq('email_gestor', selectedManager)
        }
      }

      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('❌ [useManagerData] Erro na busca:', fetchError)
        throw fetchError
      }

      const clientesData = data || []
      console.log(`✅ [useManagerData] ${clientesData.length} clientes encontrados`)
      
      if (isSitesUser) {
        console.log('🌐 [useManagerData] Primeiros 3 clientes (sites):', clientesData.slice(0, 3).map(c => ({
          id: c.id,
          nome: c.nome_cliente,
          site_status: c.site_status,
          link_site: c.link_site ? 'Preenchido' : 'Vazio'
        })))
      }

      setClientes(clientesData)
      
      if (selectedManager) {
        setCurrentManager(selectedManager)
      } else if (isSitesUser) {
        setCurrentManager('Criador de Sites')
      } else {
        setCurrentManager(userEmail)
      }

    } catch (err) {
      console.error('💥 [useManagerData] Erro crítico:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [userEmail, isAdminUser, selectedManager, filterType])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    updateCliente,
    addCliente,
    refetch: fetchClientes,
    currentManager
  }
}
