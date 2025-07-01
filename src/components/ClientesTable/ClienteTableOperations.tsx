
import { Dispatch, SetStateAction } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Cliente, StatusCampanha } from '@/lib/supabase'
import { formatCliente } from '@/utils/clienteFormatter'

export class ClienteTableOperations {
  constructor(
    private supabase: SupabaseClient,
    private toast: (options: any) => void,
    private setData: Dispatch<SetStateAction<Cliente[]>>
  ) {}

  copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    this.toast({
      title: "Copiado!",
      description: "ID do cliente copiado para a área de transferência.",
    })
  }

  deleteCliente = async (clienteId: string) => {
    try {
      const { error } = await this.supabase
        .from('todos_clientes')
        .delete()
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao deletar cliente:', error)
        this.toast({
          title: "Erro ao deletar cliente",
          description: "Ocorreu um erro ao deletar o cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      this.setData(data => data.filter(cliente => cliente.id !== clienteId))
      this.toast({
        title: "Cliente deletado",
        description: "O cliente foi deletado com sucesso.",
      })
    } catch (error) {
      console.error('Erro inesperado ao deletar cliente:', error)
      this.toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  duplicateCliente = async (clienteId: string) => {
    try {
      this.setData(currentData => {
        const clienteToDuplicate = currentData.find(cliente => cliente.id === clienteId)

        if (!clienteToDuplicate) {
          this.toast({
            title: "Cliente não encontrado",
            description: "O cliente a ser duplicado não foi encontrado.",
            variant: "destructive",
          })
          return currentData
        }

        // Remover o ID para que o Supabase gere um novo
        const { id, ...clienteData } = clienteToDuplicate

        this.supabase
          .from('todos_clientes')
          .insert([clienteData])
          .select()
          .then(({ data: duplicatedCliente, error }) => {
            if (error) {
              console.error('Erro ao duplicar cliente:', error)
              this.toast({
                title: "Erro ao duplicar cliente",
                description: "Ocorreu um erro ao duplicar o cliente. Por favor, tente novamente.",
                variant: "destructive",
              })
              return
            }

            if (duplicatedCliente && duplicatedCliente.length > 0) {
              this.setData(prevData => [...prevData, formatCliente(duplicatedCliente[0])])
              this.toast({
                title: "Cliente duplicado",
                description: "O cliente foi duplicado com sucesso.",
              })
            } else {
              this.toast({
                title: "Erro ao duplicar cliente",
                description: "Ocorreu um erro ao duplicar o cliente. Por favor, tente novamente.",
                variant: "destructive",
              })
            }
          })

        return currentData
      })
    } catch (error) {
      console.error('Erro inesperado ao duplicar cliente:', error)
      this.toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  updateClienteStatus = async (clienteId: string, newStatus: StatusCampanha) => {
    try {
      const { error } = await this.supabase
        .from('todos_clientes')
        .update({ status_campanha: newStatus })
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao atualizar status do cliente:', error)
        this.toast({
          title: "Erro ao atualizar status",
          description: "Ocorreu um erro ao atualizar o status do cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      this.setData(data => data.map(cliente =>
        cliente.id === clienteId ? { ...cliente, status_campanha: newStatus } : cliente
      ))

      this.toast({
        title: "Status atualizado",
        description: `Status do cliente atualizado para ${newStatus}.`,
      })
    } catch (error) {
      console.error('Erro inesperado ao atualizar status do cliente:', error)
      this.toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }
}
