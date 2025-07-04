
import { BaseEntity } from './shared'

export interface Gestor extends BaseEntity {
  user_id?: string
  nome: string
  email: string
  pode_adicionar_cliente: boolean
  ativo: boolean
}
