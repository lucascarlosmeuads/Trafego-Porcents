export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      arquivos_cliente: {
        Row: {
          author_type: string
          caminho_arquivo: string
          created_at: string
          email_cliente: string
          id: string
          nome_arquivo: string
          tamanho_arquivo: number | null
          tipo_arquivo: string
        }
        Insert: {
          author_type?: string
          caminho_arquivo: string
          created_at?: string
          email_cliente: string
          id?: string
          nome_arquivo: string
          tamanho_arquivo?: number | null
          tipo_arquivo: string
        }
        Update: {
          author_type?: string
          caminho_arquivo?: string
          created_at?: string
          email_cliente?: string
          id?: string
          nome_arquivo?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string
        }
        Relationships: []
      }
      briefings_cliente: {
        Row: {
          comissao_aceita: string | null
          created_at: string
          descricao_resumida: string | null
          diferencial: string | null
          email_cliente: string
          id: string
          investimento_diario: number | null
          liberar_edicao: boolean | null
          nome_produto: string
          observacoes_finais: string | null
          publico_alvo: string | null
          updated_at: string
        }
        Insert: {
          comissao_aceita?: string | null
          created_at?: string
          descricao_resumida?: string | null
          diferencial?: string | null
          email_cliente: string
          id?: string
          investimento_diario?: number | null
          liberar_edicao?: boolean | null
          nome_produto: string
          observacoes_finais?: string | null
          publico_alvo?: string | null
          updated_at?: string
        }
        Update: {
          comissao_aceita?: string | null
          created_at?: string
          descricao_resumida?: string | null
          diferencial?: string | null
          email_cliente?: string
          id?: string
          investimento_diario?: number | null
          liberar_edicao?: boolean | null
          nome_produto?: string
          observacoes_finais?: string | null
          publico_alvo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_mensagens: {
        Row: {
          cliente_id: string
          conteudo: string
          created_at: string
          email_cliente: string
          email_gestor: string
          id: string
          lida: boolean | null
          remetente: string
          status_campanha: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          conteudo: string
          created_at?: string
          email_cliente: string
          email_gestor: string
          id?: string
          lida?: boolean | null
          remetente: string
          status_campanha?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          conteudo?: string
          created_at?: string
          email_cliente?: string
          email_gestor?: string
          id?: string
          lida?: boolean | null
          remetente?: string
          status_campanha?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_user_creation_log: {
        Row: {
          created_at: string | null
          email_cliente: string
          id: string
          operation_type: string
          result_message: string | null
        }
        Insert: {
          created_at?: string | null
          email_cliente: string
          id?: string
          operation_type: string
          result_message?: string | null
        }
        Update: {
          created_at?: string | null
          email_cliente?: string
          id?: string
          operation_type?: string
          result_message?: string | null
        }
        Relationships: []
      }
      comentarios_cliente: {
        Row: {
          autor: string
          cliente_id: number
          comentario: string
          created_at: string | null
          id: string
          lido: boolean | null
          updated_at: string | null
        }
        Insert: {
          autor: string
          cliente_id: number
          comentario: string
          created_at?: string | null
          id?: string
          lido?: boolean | null
          updated_at?: string | null
        }
        Update: {
          autor?: string
          cliente_id?: number
          comentario?: string
          created_at?: string | null
          id?: string
          lido?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "todos_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      gestores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          pode_adicionar_cliente: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          pode_adicionar_cliente?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          pode_adicionar_cliente?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      solicitacoes_saque: {
        Row: {
          cliente_id: number
          created_at: string
          data_solicitacao: string
          email_gestor: string
          id: string
          nome_gestor: string
          processado_em: string | null
          status_saque: string
          updated_at: string
          valor_comissao: number
        }
        Insert: {
          cliente_id: number
          created_at?: string
          data_solicitacao?: string
          email_gestor: string
          id?: string
          nome_gestor: string
          processado_em?: string | null
          status_saque?: string
          updated_at?: string
          valor_comissao: number
        }
        Update: {
          cliente_id?: number
          created_at?: string
          data_solicitacao?: string
          email_gestor?: string
          id?: string
          nome_gestor?: string
          processado_em?: string | null
          status_saque?: string
          updated_at?: string
          valor_comissao?: number
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_saque_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "todos_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      todos_clientes: {
        Row: {
          comissao: string | null
          comissao_paga: boolean | null
          created_at: string
          created_at_br: string | null
          data_agendamento: string | null
          data_limite: string | null
          data_subida_campanha: string | null
          data_venda: string | null
          descricao_problema: string | null
          email_cliente: string | null
          email_gestor: string | null
          id: number
          link_briefing: string | null
          link_criativo: string | null
          link_grupo: string | null
          link_site: string | null
          nome_cliente: string | null
          numero_bm: string | null
          saque_solicitado: boolean | null
          site_pago: boolean | null
          site_status: string | null
          status_campanha: string | null
          status_envio: string | null
          telefone: string | null
          valor_comissao: number | null
          vendedor: string | null
        }
        Insert: {
          comissao?: string | null
          comissao_paga?: boolean | null
          created_at?: string
          created_at_br?: string | null
          data_agendamento?: string | null
          data_limite?: string | null
          data_subida_campanha?: string | null
          data_venda?: string | null
          descricao_problema?: string | null
          email_cliente?: string | null
          email_gestor?: string | null
          id?: number
          link_briefing?: string | null
          link_criativo?: string | null
          link_grupo?: string | null
          link_site?: string | null
          nome_cliente?: string | null
          numero_bm?: string | null
          saque_solicitado?: boolean | null
          site_pago?: boolean | null
          site_status?: string | null
          status_campanha?: string | null
          status_envio?: string | null
          telefone?: string | null
          valor_comissao?: number | null
          vendedor?: string | null
        }
        Update: {
          comissao?: string | null
          comissao_paga?: boolean | null
          created_at?: string
          created_at_br?: string | null
          data_agendamento?: string | null
          data_limite?: string | null
          data_subida_campanha?: string | null
          data_venda?: string | null
          descricao_problema?: string | null
          email_cliente?: string | null
          email_gestor?: string | null
          id?: number
          link_briefing?: string | null
          link_criativo?: string | null
          link_grupo?: string | null
          link_site?: string | null
          nome_cliente?: string | null
          numero_bm?: string | null
          saque_solicitado?: boolean | null
          site_pago?: boolean | null
          site_status?: string | null
          status_campanha?: string | null
          status_envio?: string | null
          telefone?: string | null
          valor_comissao?: number | null
          vendedor?: string | null
        }
        Relationships: []
      }
      vendas_cliente: {
        Row: {
          created_at: string
          data_venda: string
          email_cliente: string
          id: string
          observacoes: string | null
          produto_vendido: string
          updated_at: string
          valor_venda: number
        }
        Insert: {
          created_at?: string
          data_venda: string
          email_cliente: string
          id?: string
          observacoes?: string | null
          produto_vendido: string
          updated_at?: string
          valor_venda: number
        }
        Update: {
          created_at?: string
          data_venda?: string
          email_cliente?: string
          id?: string
          observacoes?: string | null
          produto_vendido?: string
          updated_at?: string
          valor_venda?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      email_gestor_enum:
        | "jose@trafegoporcents.com"
        | "falcao@trafegoporcents.com"
        | "rullian@trafegoporcents.com"
        | "danielribeiro@trafegoporcents.com"
        | "danielmoreira@trafegoporcents.com"
        | "carol@trafegoporcents.com"
        | "guilherme@trafegoporcents.com"
        | "emily@trafegoporcents.com"
        | "leandrodrumzique@trafegoporcents.com"
        | "kimberlly@trafegoporcents.com"
        | "junior@trafegoporcents.com"
        | "kely@trafegoporcents.com"
        | "jefferson@trafegoporcents.com"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      email_gestor_enum: [
        "jose@trafegoporcents.com",
        "falcao@trafegoporcents.com",
        "rullian@trafegoporcents.com",
        "danielribeiro@trafegoporcents.com",
        "danielmoreira@trafegoporcents.com",
        "carol@trafegoporcents.com",
        "guilherme@trafegoporcents.com",
        "emily@trafegoporcents.com",
        "leandrodrumzique@trafegoporcents.com",
        "kimberlly@trafegoporcents.com",
        "junior@trafegoporcents.com",
        "kely@trafegoporcents.com",
        "jefferson@trafegoporcents.com",
      ],
    },
  },
} as const
