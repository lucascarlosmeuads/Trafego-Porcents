
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useClienteOperations(userEmail: string, isAdmin: boolean, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false)

  const addCliente = async (clienteData: any) => {
    setLoading(true)
    console.log('🔵 [useClienteOperations] === INICIANDO CRIAÇÃO DE CLIENTE ===')
    console.log('🔵 [useClienteOperations] UserEmail:', userEmail)
    console.log('🔵 [useClienteOperations] IsAdmin:', isAdmin)
    console.log('🔵 [useClienteOperations] Cliente data:', clienteData)

    try {
      // Validações básicas
      if (!clienteData.nome_cliente?.trim()) {
        throw new Error('Nome do cliente é obrigatório')
      }

      if (!clienteData.telefone?.trim()) {
        throw new Error('Telefone é obrigatório')
      }

      // Para admin: email_gestor deve ser definido explicitamente
      // Para gestor: usar o próprio email
      const emailGestorFinal = isAdmin ? clienteData.email_gestor : userEmail
      
      if (!emailGestorFinal) {
        throw new Error('Email do gestor não definido')
      }

      // Preparar dados para inserção
      const dadosParaInserir = {
        nome_cliente: clienteData.nome_cliente.trim(),
        telefone: clienteData.telefone.trim(),
        email_cliente: clienteData.email_cliente?.trim() || null,
        vendedor: clienteData.vendedor?.trim() || userEmail,
        email_gestor: emailGestorFinal,
        status_campanha: clienteData.status_campanha || 'Cliente Novo',
        data_venda: clienteData.data_venda || new Date().toISOString().split('T')[0],
        valor_comissao: 60.00,
        comissao: 'Pendente',
        comissao_paga: false,
        site_status: 'pendente',
        site_pago: false
      }

      console.log('🔵 [useClienteOperations] Dados preparados para inserção:', dadosParaInserir)

      // Verificar se cliente já existe (por email ou nome+telefone)
      let clienteExistente = null
      if (dadosParaInserir.email_cliente) {
        const { data: existeEmail } = await supabase
          .from('todos_clientes')
          .select('id, nome_cliente, email_cliente')
          .eq('email_cliente', dadosParaInserir.email_cliente)
          .single()
        
        clienteExistente = existeEmail
      }

      if (!clienteExistente) {
        const { data: existeNomeTelefone } = await supabase
          .from('todos_clientes')
          .select('id, nome_cliente, telefone')
          .eq('nome_cliente', dadosParaInserir.nome_cliente)
          .eq('telefone', dadosParaInserir.telefone)
          .single()
        
        clienteExistente = existeNomeTelefone
      }

      if (clienteExistente) {
        console.log('⚠️ [useClienteOperations] Cliente já existe:', clienteExistente)
        toast({
          title: "Cliente já existe",
          description: `Cliente ${clienteExistente.nome_cliente} já está cadastrado`,
          variant: "destructive"
        })
        return { success: false, error: 'Cliente já existe' }
      }

      // Inserir novo cliente
      console.log('🔵 [useClienteOperations] Inserindo novo cliente...')
      const { data: novoCliente, error } = await supabase
        .from('todos_clientes')
        .insert([dadosParaInserir])
        .select()
        .single()

      if (error) {
        console.error('❌ [useClienteOperations] Erro ao inserir cliente:', error)
        throw new Error(`Erro ao inserir cliente: ${error.message}`)
      }

      console.log('✅ [useClienteOperations] Cliente criado com sucesso:', novoCliente)

      // Criar usuário de acesso se email foi fornecido
      let senhaDefinida = false
      if (dadosParaInserir.email_cliente) {
        try {
          console.log('🔐 [useClienteOperations] Criando usuário de acesso...')
          const { error: authError } = await supabase.auth.admin.createUser({
            email: dadosParaInserir.email_cliente,
            password: 'parceriadesucesso',
            email_confirm: true
          })

          if (authError) {
            console.warn('⚠️ [useClienteOperations] Erro ao criar usuário:', authError.message)
          } else {
            senhaDefinida = true
            console.log('✅ [useClienteOperations] Usuário criado com senha padrão')
          }
        } catch (authError) {
          console.warn('⚠️ [useClienteOperations] Falha na criação do usuário:', authError)
        }
      }

      toast({
        title: "✅ Sucesso",
        description: `Cliente ${novoCliente.nome_cliente} adicionado com sucesso!`
      })

      if (onSuccess) {
        onSuccess()
      }

      return {
        success: true,
        clientData: novoCliente,
        isNewClient: true,
        valorComissao: '60,00',
        senhaDefinida
      }

    } catch (error: any) {
      console.error('❌ [useClienteOperations] Erro na criação:', error)
      
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao adicionar cliente",
        variant: "destructive"
      })

      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return { addCliente, loading }
}
