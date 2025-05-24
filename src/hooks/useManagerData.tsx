
import { useState, useEffect } from 'react'
import { supabase, type Cliente } from '@/lib/supabase'

export function useManagerData(selectedManager: string) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getTableName = (managerName: string) => {
    // Mapear nomes dos gerentes para as novas tabelas
    const tableMapping: { [key: string]: string } = {
      'Lucas Falcão': 'clientes_lucas_falcao',
      'Andreza': 'clientes_andreza'
    }
    
    return tableMapping[managerName] || 'clientes_andreza'
  }

  const fetchClientes = async () => {
    if (!selectedManager) return

    setLoading(true)
    setError(null)

    try {
      const tableName = getTableName(selectedManager)
      console.log('Buscando dados da tabela:', tableName)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        setError(`Erro ao carregar dados de ${selectedManager}: ${error.message}`)
        setClientes([])
      } else {
        console.log(`Dados encontrados para ${selectedManager}:`, data)
        
        // Mapear os dados para o formato esperado
        const clientesFormatados = (data || []).map((item: any) => ({
          id: item.id?.toString() || '',
          data_venda: item.data_venda || '',
          nome_cliente: item.nome_cliente || '',
          telefone: item.telefone || '',
          email_cliente: item.email_cliente || '',
          nome_vendedor: item.vendedor || '',
          email_gestor_responsavel: item.email_gestor || '',
          email_gestor: item.email_gestor || '',
          status_campanha: item.status_campanha || '',
          data_limite: item.data_limite || '',
          data_subida_campanha: item.data_subida_campanha || '',
          link_grupo: item.link_grupo || '',
          link_reuniao_1: item.link_briefing || '',
          link_reuniao_2: item.link_criativo || '',
          link_reuniao_3: item.link_site || '',
          bm_identificacao: item.numero_bm || '',
          created_at: item.created_at || '',
          comissao: item.comissao || ''
        }))
        
        console.log(`Clientes formatados para ${selectedManager}:`, clientesFormatados)
        setClientes(clientesFormatados)
      }
    } catch (err) {
      console.error('Erro:', err)
      setError(`Erro ao carregar dados de ${selectedManager}`)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const updateCliente = async (id: string, field: string, value: string) => {
    if (!selectedManager) return false

    try {
      const tableName = getTableName(selectedManager)
      
      // Mapear campos da interface para campos do banco
      const fieldMapping: { [key: string]: string } = {
        'nome_vendedor': 'vendedor',
        'email_gestor_responsavel': 'email_gestor',
        'link_reuniao_1': 'link_briefing',
        'link_reuniao_2': 'link_criativo',
        'link_reuniao_3': 'link_site',
        'bm_identificacao': 'numero_bm'
      }

      const dbField = fieldMapping[field] || field
      
      console.log(`Atualizando ${tableName} - ID: ${id}, Campo: ${dbField}, Valor: ${value}`)
      
      const { error } = await supabase
        .from(tableName)
        .update({ [dbField]: value })
        .eq('id', parseInt(id))

      if (error) {
        console.error('Erro ao atualizar cliente:', error)
        return false
      }

      // Atualizar o estado local
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id 
            ? { ...cliente, [field]: value }
            : cliente
        )
      )

      console.log('Cliente atualizado com sucesso')
      return true
    } catch (err) {
      console.error('Erro:', err)
      return false
    }
  }

  // Configurar listener de realtime para atualizações automáticas
  useEffect(() => {
    if (!selectedManager) return

    const tableName = getTableName(selectedManager)
    console.log('Configurando realtime para tabela:', tableName)

    // Buscar dados iniciais
    fetchClientes()

    // Configurar canal de realtime
    const channel = supabase
      .channel(`realtime-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log('Mudança detectada na tabela:', payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('Novo cliente inserido:', payload.new)
            // Adicionar novo cliente ao estado
            const novoCliente = {
              id: payload.new.id?.toString() || '',
              data_venda: payload.new.data_venda || '',
              nome_cliente: payload.new.nome_cliente || '',
              telefone: payload.new.telefone || '',
              email_cliente: payload.new.email_cliente || '',
              nome_vendedor: payload.new.vendedor || '',
              email_gestor_responsavel: payload.new.email_gestor || '',
              email_gestor: payload.new.email_gestor || '',
              status_campanha: payload.new.status_campanha || '',
              data_limite: payload.new.data_limite || '',
              data_subida_campanha: payload.new.data_subida_campanha || '',
              link_grupo: payload.new.link_grupo || '',
              link_reuniao_1: payload.new.link_briefing || '',
              link_reuniao_2: payload.new.link_criativo || '',
              link_reuniao_3: payload.new.link_site || '',
              bm_identificacao: payload.new.numero_bm || '',
              created_at: payload.new.created_at || '',
              comissao: payload.new.comissao || ''
            }
            
            setClientes(prev => [novoCliente, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            console.log('Cliente atualizado:', payload.new)
            // Atualizar cliente existente
            const clienteAtualizado = {
              id: payload.new.id?.toString() || '',
              data_venda: payload.new.data_venda || '',
              nome_cliente: payload.new.nome_cliente || '',
              telefone: payload.new.telefone || '',
              email_cliente: payload.new.email_cliente || '',
              nome_vendedor: payload.new.vendedor || '',
              email_gestor_responsavel: payload.new.email_gestor || '',
              email_gestor: payload.new.email_gestor || '',
              status_campanha: payload.new.status_campanha || '',
              data_limite: payload.new.data_limite || '',
              data_subida_campanha: payload.new.data_subida_campanha || '',
              link_grupo: payload.new.link_grupo || '',
              link_reuniao_1: payload.new.link_briefing || '',
              link_reuniao_2: payload.new.link_criativo || '',
              link_reuniao_3: payload.new.link_site || '',
              bm_identificacao: payload.new.numero_bm || '',
              created_at: payload.new.created_at || '',
              comissao: payload.new.comissao || ''
            }
            
            setClientes(prev => 
              prev.map(cliente => 
                cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente
              )
            )
          } else if (payload.eventType === 'DELETE') {
            console.log('Cliente removido:', payload.old)
            // Remover cliente do estado
            setClientes(prev => 
              prev.filter(cliente => cliente.id !== payload.old.id?.toString())
            )
          }
        }
      )
      .subscribe((status) => {
        console.log(`Status do realtime para ${tableName}:`, status)
      })

    // Cleanup do canal quando o componente desmontar ou gerente mudar
    return () => {
      console.log('Removendo canal de realtime para:', tableName)
      supabase.removeChannel(channel)
    }
  }, [selectedManager])

  return {
    clientes,
    loading,
    error,
    updateCliente,
    refetch: fetchClientes
  }
}
