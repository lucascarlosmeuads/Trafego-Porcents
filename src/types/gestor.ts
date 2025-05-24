
export interface Gestor {
  id: string
  user_id?: string
  nome: string
  email: string
  pode_adicionar_cliente: boolean
  ativo: boolean
  created_at: string
  updated_at: string
}
