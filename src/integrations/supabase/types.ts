export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      backup_comissoes_antigas: {
        Row: {
          comissao: string | null
          comissao_paga: boolean | null
          created_at: string | null
          id: number | null
          nome_cliente: string | null
          valor_comissao: number | null
        }
        Insert: {
          comissao?: string | null
          comissao_paga?: boolean | null
          created_at?: string | null
          id?: number | null
          nome_cliente?: string | null
          valor_comissao?: number | null
        }
        Update: {
          comissao?: string | null
          comissao_paga?: boolean | null
          created_at?: string | null
          id?: number | null
          nome_cliente?: string | null
          valor_comissao?: number | null
        }
        Relationships: []
      }
      briefings_cliente: {
        Row: {
          abrangencia_atendimento: string | null
          comissao_aceita: string | null
          cores_desejadas: string | null
          cores_proibidas: string | null
          created_at: string
          criativos_prontos: boolean | null
          descricao_resumida: string | null
          diferencial: string | null
          direcionamento_campanha: string | null
          email_cliente: string
          estilo_visual: string | null
          etapa_atual: number | null
          fonte_especifica: string | null
          forma_pagamento: string | null
          formulario_completo: boolean | null
          id: string
          investimento_diario: number | null
          liberar_edicao: boolean | null
          localizacao_divulgacao: string | null
          nome_marca: string | null
          nome_produto: string
          observacoes_finais: string | null
          planejamento_estrategico: string | null
          possui_facebook: boolean | null
          possui_instagram: boolean | null
          publico_alvo: string | null
          quer_site: boolean | null
          resumo_conversa_vendedor: string | null
          tipo_fonte: string | null
          tipo_prestacao_servico: string | null
          tipos_imagens_preferidas: string[] | null
          updated_at: string
          utiliza_whatsapp_business: boolean | null
          videos_prontos: boolean | null
        }
        Insert: {
          abrangencia_atendimento?: string | null
          comissao_aceita?: string | null
          cores_desejadas?: string | null
          cores_proibidas?: string | null
          created_at?: string
          criativos_prontos?: boolean | null
          descricao_resumida?: string | null
          diferencial?: string | null
          direcionamento_campanha?: string | null
          email_cliente: string
          estilo_visual?: string | null
          etapa_atual?: number | null
          fonte_especifica?: string | null
          forma_pagamento?: string | null
          formulario_completo?: boolean | null
          id?: string
          investimento_diario?: number | null
          liberar_edicao?: boolean | null
          localizacao_divulgacao?: string | null
          nome_marca?: string | null
          nome_produto: string
          observacoes_finais?: string | null
          planejamento_estrategico?: string | null
          possui_facebook?: boolean | null
          possui_instagram?: boolean | null
          publico_alvo?: string | null
          quer_site?: boolean | null
          resumo_conversa_vendedor?: string | null
          tipo_fonte?: string | null
          tipo_prestacao_servico?: string | null
          tipos_imagens_preferidas?: string[] | null
          updated_at?: string
          utiliza_whatsapp_business?: boolean | null
          videos_prontos?: boolean | null
        }
        Update: {
          abrangencia_atendimento?: string | null
          comissao_aceita?: string | null
          cores_desejadas?: string | null
          cores_proibidas?: string | null
          created_at?: string
          criativos_prontos?: boolean | null
          descricao_resumida?: string | null
          diferencial?: string | null
          direcionamento_campanha?: string | null
          email_cliente?: string
          estilo_visual?: string | null
          etapa_atual?: number | null
          fonte_especifica?: string | null
          forma_pagamento?: string | null
          formulario_completo?: boolean | null
          id?: string
          investimento_diario?: number | null
          liberar_edicao?: boolean | null
          localizacao_divulgacao?: string | null
          nome_marca?: string | null
          nome_produto?: string
          observacoes_finais?: string | null
          planejamento_estrategico?: string | null
          possui_facebook?: boolean | null
          possui_instagram?: boolean | null
          publico_alvo?: string | null
          quer_site?: boolean | null
          resumo_conversa_vendedor?: string | null
          tipo_fonte?: string | null
          tipo_prestacao_servico?: string | null
          tipos_imagens_preferidas?: string[] | null
          updated_at?: string
          utiliza_whatsapp_business?: boolean | null
          videos_prontos?: boolean | null
        }
        Relationships: []
      }
      chat_atendentes: {
        Row: {
          ativo: boolean | null
          cliente_id: string
          created_at: string | null
          designado_em: string | null
          email_atendente: string
          email_cliente: string
          id: string
          pode_atender: boolean | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id: string
          created_at?: string | null
          designado_em?: string | null
          email_atendente: string
          email_cliente: string
          id?: string
          pode_atender?: boolean | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string
          created_at?: string | null
          designado_em?: string | null
          email_atendente?: string
          email_cliente?: string
          id?: string
          pode_atender?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_mensagens: {
        Row: {
          atendente_atual: string | null
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
          transferido_para: string | null
          updated_at: string
        }
        Insert: {
          atendente_atual?: string | null
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
          transferido_para?: string | null
          updated_at?: string
        }
        Update: {
          atendente_atual?: string | null
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
          transferido_para?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_transferencias: {
        Row: {
          atendente_anterior: string
          atendente_novo: string
          email_cliente: string
          id: string
          motivo: string | null
          transferido_em: string | null
          transferido_por: string
        }
        Insert: {
          atendente_anterior: string
          atendente_novo: string
          email_cliente: string
          id?: string
          motivo?: string | null
          transferido_em?: string | null
          transferido_por: string
        }
        Update: {
          atendente_anterior?: string
          atendente_novo?: string
          email_cliente?: string
          id?: string
          motivo?: string | null
          transferido_em?: string | null
          transferido_por?: string
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
      cliente_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          data_aceite_termos: string | null
          data_rejeicao_termos: string | null
          email_cliente: string
          id: string
          nome_display: string | null
          termos_aceitos: boolean | null
          termos_rejeitados: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          data_aceite_termos?: string | null
          data_rejeicao_termos?: string | null
          email_cliente: string
          id?: string
          nome_display?: string | null
          termos_aceitos?: boolean | null
          termos_rejeitados?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          data_aceite_termos?: string | null
          data_rejeicao_termos?: string | null
          email_cliente?: string
          id?: string
          nome_display?: string | null
          termos_aceitos?: boolean | null
          termos_rejeitados?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      cliente_progresso: {
        Row: {
          completado: boolean
          created_at: string
          data_completado: string | null
          email_cliente: string
          id: string
          passo_id: number
          updated_at: string
        }
        Insert: {
          completado?: boolean
          created_at?: string
          data_completado?: string | null
          email_cliente: string
          id?: string
          passo_id: number
          updated_at?: string
        }
        Update: {
          completado?: boolean
          created_at?: string
          data_completado?: string | null
          email_cliente?: string
          id?: string
          passo_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      clientes_antigos: {
        Row: {
          comissao: string
          created_at: string
          data_venda: string
          descricao_problema: string | null
          email_cliente: string
          email_gestor: string
          id: string
          link_briefing: string | null
          link_criativo: string | null
          link_site: string | null
          nome_cliente: string
          numero_bm: string | null
          site_pago: boolean
          site_status: string
          telefone: string
          updated_at: string
          valor_comissao: number
          vendedor: string
        }
        Insert: {
          comissao?: string
          created_at?: string
          data_venda: string
          descricao_problema?: string | null
          email_cliente: string
          email_gestor: string
          id?: string
          link_briefing?: string | null
          link_criativo?: string | null
          link_site?: string | null
          nome_cliente: string
          numero_bm?: string | null
          site_pago?: boolean
          site_status?: string
          telefone: string
          updated_at?: string
          valor_comissao?: number
          vendedor: string
        }
        Update: {
          comissao?: string
          created_at?: string
          data_venda?: string
          descricao_problema?: string | null
          email_cliente?: string
          email_gestor?: string
          id?: string
          link_briefing?: string | null
          link_criativo?: string | null
          link_site?: string | null
          nome_cliente?: string
          numero_bm?: string | null
          site_pago?: boolean
          site_status?: string
          telefone?: string
          updated_at?: string
          valor_comissao?: number
          vendedor?: string
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
      creative_generations: {
        Row: {
          configuracao: Json
          created_at: string
          criativos_concluidos: number
          custo_total: number | null
          email_gestor: string
          id: string
          pdf_analysis_id: string
          status: string
          tempo_total: number | null
          tipo_sessao: string
          total_criativos: number
          updated_at: string
        }
        Insert: {
          configuracao?: Json
          created_at?: string
          criativos_concluidos?: number
          custo_total?: number | null
          email_gestor: string
          id?: string
          pdf_analysis_id: string
          status?: string
          tempo_total?: number | null
          tipo_sessao?: string
          total_criativos?: number
          updated_at?: string
        }
        Update: {
          configuracao?: Json
          created_at?: string
          criativos_concluidos?: number
          custo_total?: number | null
          email_gestor?: string
          id?: string
          pdf_analysis_id?: string
          status?: string
          tempo_total?: number | null
          tipo_sessao?: string
          total_criativos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_generations_pdf_analysis_id_fkey"
            columns: ["pdf_analysis_id"]
            isOneToOne: false
            referencedRelation: "pdf_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      criativos_gerados: {
        Row: {
          api_utilizada: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          arquivo_url: string | null
          caminho_pdf: string
          cliente_id: number | null
          copy_id: string | null
          created_at: string
          criativos: Json
          custo_processamento: number | null
          dados_extraidos: Json
          dados_geracao: Json | null
          duracao_video: number | null
          email_cliente: string
          email_gestor: string
          estilo_visual: string | null
          generation_id: string | null
          id: string
          nome_arquivo_pdf: string
          observacoes: string | null
          processado_em: string | null
          prompt_usado: string | null
          resolucao: string | null
          status: string
          thumbnail_url: string | null
          tipo_criativo: string | null
          updated_at: string
        }
        Insert: {
          api_utilizada?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          arquivo_url?: string | null
          caminho_pdf: string
          cliente_id?: number | null
          copy_id?: string | null
          created_at?: string
          criativos?: Json
          custo_processamento?: number | null
          dados_extraidos?: Json
          dados_geracao?: Json | null
          duracao_video?: number | null
          email_cliente: string
          email_gestor: string
          estilo_visual?: string | null
          generation_id?: string | null
          id?: string
          nome_arquivo_pdf: string
          observacoes?: string | null
          processado_em?: string | null
          prompt_usado?: string | null
          resolucao?: string | null
          status?: string
          thumbnail_url?: string | null
          tipo_criativo?: string | null
          updated_at?: string
        }
        Update: {
          api_utilizada?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          arquivo_url?: string | null
          caminho_pdf?: string
          cliente_id?: number | null
          copy_id?: string | null
          created_at?: string
          criativos?: Json
          custo_processamento?: number | null
          dados_extraidos?: Json
          dados_geracao?: Json | null
          duracao_video?: number | null
          email_cliente?: string
          email_gestor?: string
          estilo_visual?: string | null
          generation_id?: string | null
          id?: string
          nome_arquivo_pdf?: string
          observacoes?: string | null
          processado_em?: string | null
          prompt_usado?: string | null
          resolucao?: string | null
          status?: string
          thumbnail_url?: string | null
          tipo_criativo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "criativos_gerados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "todos_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criativos_gerados_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "creative_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      formularios_parceria: {
        Row: {
          completo: boolean
          created_at: string
          email_usuario: string | null
          id: string
          planejamento_estrategico: string | null
          respostas: Json
          tipo_negocio: string
          updated_at: string
        }
        Insert: {
          completo?: boolean
          created_at?: string
          email_usuario?: string | null
          id?: string
          planejamento_estrategico?: string | null
          respostas?: Json
          tipo_negocio: string
          updated_at?: string
        }
        Update: {
          completo?: boolean
          created_at?: string
          email_usuario?: string | null
          id?: string
          planejamento_estrategico?: string | null
          respostas?: Json
          tipo_negocio?: string
          updated_at?: string
        }
        Relationships: []
      }
      gestores: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
      historico_pagamentos_comissao: {
        Row: {
          cliente_id: number
          created_at: string | null
          data_pagamento: string
          id: string
          observacoes: string | null
          pago_por: string
          updated_at: string | null
          valor_pago: number
        }
        Insert: {
          cliente_id: number
          created_at?: string | null
          data_pagamento?: string
          id?: string
          observacoes?: string | null
          pago_por: string
          updated_at?: string | null
          valor_pago: number
        }
        Update: {
          cliente_id?: number
          created_at?: string | null
          data_pagamento?: string
          id?: string
          observacoes?: string | null
          pago_por?: string
          updated_at?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_pagamentos_comissao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "todos_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ideias_negocio: {
        Row: {
          briefing_id: string | null
          categoria_negocio: string | null
          created_at: string
          descricao_projeto: string | null
          diferenciais: string | null
          dores_identificadas: string[] | null
          email_cliente: string
          id: string
          insights_ia: Json | null
          investimento_sugerido: number | null
          potencial_mercado: string | null
          produto_servico: string
          publico_alvo: string | null
          status_analise: string
          titulo_ideia: string | null
          updated_at: string
        }
        Insert: {
          briefing_id?: string | null
          categoria_negocio?: string | null
          created_at?: string
          descricao_projeto?: string | null
          diferenciais?: string | null
          dores_identificadas?: string[] | null
          email_cliente: string
          id?: string
          insights_ia?: Json | null
          investimento_sugerido?: number | null
          potencial_mercado?: string | null
          produto_servico: string
          publico_alvo?: string | null
          status_analise?: string
          titulo_ideia?: string | null
          updated_at?: string
        }
        Update: {
          briefing_id?: string | null
          categoria_negocio?: string | null
          created_at?: string
          descricao_projeto?: string | null
          diferenciais?: string | null
          dores_identificadas?: string[] | null
          email_cliente?: string
          id?: string
          insights_ia?: Json | null
          investimento_sugerido?: number | null
          potencial_mercado?: string | null
          produto_servico?: string
          publico_alvo?: string | null
          status_analise?: string
          titulo_ideia?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideias_negocio_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings_cliente"
            referencedColumns: ["id"]
          },
        ]
      }
      max_integration_config: {
        Row: {
          created_at: string
          gestor_email: string
          gestor_nome: string
          id: string
          integration_active: boolean
          updated_at: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          gestor_email: string
          gestor_nome: string
          id?: string
          integration_active?: boolean
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          gestor_email?: string
          gestor_nome?: string
          id?: string
          integration_active?: boolean
          updated_at?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      max_integration_logs: {
        Row: {
          cliente_criado_id: number | null
          created_at: string
          dados_originais: Json
          erro_detalhes: string | null
          gestor_atribuido: string | null
          id: string
          pedido_id: string | null
          processed_at: string
          status: string
        }
        Insert: {
          cliente_criado_id?: number | null
          created_at?: string
          dados_originais: Json
          erro_detalhes?: string | null
          gestor_atribuido?: string | null
          id?: string
          pedido_id?: string | null
          processed_at?: string
          status?: string
        }
        Update: {
          cliente_criado_id?: number | null
          created_at?: string
          dados_originais?: Json
          erro_detalhes?: string | null
          gestor_atribuido?: string | null
          id?: string
          pedido_id?: string | null
          processed_at?: string
          status?: string
        }
        Relationships: []
      }
      meta_ads_configs: {
        Row: {
          access_token: string
          ad_account_id: string
          api_id: string
          app_secret: string
          cliente_id: number | null
          created_at: string
          email_usuario: string
          id: string
          updated_at: string
        }
        Insert: {
          access_token: string
          ad_account_id: string
          api_id: string
          app_secret: string
          cliente_id?: number | null
          created_at?: string
          email_usuario: string
          id?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          ad_account_id?: string
          api_id?: string
          app_secret?: string
          cliente_id?: number | null
          created_at?: string
          email_usuario?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      meta_ads_reports: {
        Row: {
          ad_account_id: string
          clicks: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          ctr: number | null
          email_usuario: string
          id: string
          impressions: number | null
          report_date: string
          spend: number | null
        }
        Insert: {
          ad_account_id: string
          clicks?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          email_usuario: string
          id?: string
          impressions?: number | null
          report_date?: string
          spend?: number | null
        }
        Update: {
          ad_account_id?: string
          clicks?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          ctr?: number | null
          email_usuario?: string
          id?: string
          impressions?: number | null
          report_date?: string
          spend?: number | null
        }
        Relationships: []
      }
      pdf_analysis: {
        Row: {
          beneficios: string[] | null
          caminho_arquivo: string
          created_at: string
          cta: string | null
          custo_analise: number | null
          dados_extraidos: Json
          email_gestor: string
          headline_principal: string | null
          id: string
          nome_arquivo: string
          nome_oferta: string | null
          proposta_central: string | null
          publico_alvo: string | null
          status: string
          tempo_processamento: number | null
          tipo_midia: string[] | null
          tom_voz: string | null
          updated_at: string
        }
        Insert: {
          beneficios?: string[] | null
          caminho_arquivo: string
          created_at?: string
          cta?: string | null
          custo_analise?: number | null
          dados_extraidos?: Json
          email_gestor: string
          headline_principal?: string | null
          id?: string
          nome_arquivo: string
          nome_oferta?: string | null
          proposta_central?: string | null
          publico_alvo?: string | null
          status?: string
          tempo_processamento?: number | null
          tipo_midia?: string[] | null
          tom_voz?: string | null
          updated_at?: string
        }
        Update: {
          beneficios?: string[] | null
          caminho_arquivo?: string
          created_at?: string
          cta?: string | null
          custo_analise?: number | null
          dados_extraidos?: Json
          email_gestor?: string
          headline_principal?: string | null
          id?: string
          nome_arquivo?: string
          nome_oferta?: string | null
          proposta_central?: string | null
          publico_alvo?: string | null
          status?: string
          tempo_processamento?: number | null
          tipo_midia?: string[] | null
          tom_voz?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sac_clientes: {
        Row: {
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          data_envio: string
          descricao: string
          email: string
          email_gestor: string | null
          id: string
          nome: string
          nome_gestor: string | null
          status: string | null
          tipo_problema: string
          whatsapp: string
        }
        Insert: {
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          data_envio?: string
          descricao: string
          email: string
          email_gestor?: string | null
          id?: string
          nome: string
          nome_gestor?: string | null
          status?: string | null
          tipo_problema: string
          whatsapp: string
        }
        Update: {
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          data_envio?: string
          descricao?: string
          email?: string
          email_gestor?: string | null
          id?: string
          nome?: string
          nome_gestor?: string | null
          status?: string | null
          tipo_problema?: string
          whatsapp?: string
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
      solicitacoes_site: {
        Row: {
          created_at: string
          dados_preenchidos: boolean | null
          email_cliente: string
          email_gestor: string | null
          formulario_acessado_em: string | null
          id: string
          nome_cliente: string
          observacoes: string | null
          status: string
          telefone: string | null
          token_acesso: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dados_preenchidos?: boolean | null
          email_cliente: string
          email_gestor?: string | null
          formulario_acessado_em?: string | null
          id?: string
          nome_cliente: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          token_acesso?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dados_preenchidos?: boolean | null
          email_cliente?: string
          email_gestor?: string | null
          formulario_acessado_em?: string | null
          id?: string
          nome_cliente?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          token_acesso?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sugestoes_melhorias: {
        Row: {
          categoria: string
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          descricao: string
          gestor_email: string
          gestor_nome: string
          id: string
          prioridade: string
          respondido_em: string | null
          resposta_admin: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          descricao: string
          gestor_email: string
          gestor_nome: string
          id?: string
          prioridade?: string
          respondido_em?: string | null
          resposta_admin?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          descricao?: string
          gestor_email?: string
          gestor_nome?: string
          id?: string
          prioridade?: string
          respondido_em?: string | null
          resposta_admin?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates_criativos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          elementos_visuais: Json
          id: string
          layout_config: Json
          nome: string
          performance_score: number | null
          prompts_geracao: Json
          updated_at: string
          uso_contador: number | null
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          elementos_visuais?: Json
          id?: string
          layout_config?: Json
          nome: string
          performance_score?: number | null
          prompts_geracao?: Json
          updated_at?: string
          uso_contador?: number | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          elementos_visuais?: Json
          id?: string
          layout_config?: Json
          nome?: string
          performance_score?: number | null
          prompts_geracao?: Json
          updated_at?: string
          uso_contador?: number | null
        }
        Relationships: []
      }
      todos_clientes: {
        Row: {
          comissao: string | null
          comissao_confirmada: boolean | null
          comissao_paga: boolean | null
          cor_marcacao: string | null
          created_at: string
          created_at_br: string | null
          data_agendamento: string | null
          data_cadastro_desejada: string | null
          data_limite: string | null
          data_subida_campanha: string | null
          data_venda: string | null
          descricao_problema: string | null
          eh_ultimo_pago: boolean | null
          email_cliente: string | null
          email_gestor: string | null
          id: number
          link_briefing: string | null
          link_campanha: string | null
          link_criativo: string | null
          link_grupo: string | null
          link_site: string | null
          nome_cliente: string | null
          numero_bm: string | null
          origem_cadastro: string | null
          saque_solicitado: boolean | null
          site_descricao_personalizada: string | null
          site_pago: boolean | null
          site_status: string | null
          status_campanha: string | null
          status_envio: string | null
          telefone: string | null
          total_pago_comissao: number | null
          ultimo_pagamento_em: string | null
          ultimo_valor_pago: number | null
          valor_comissao: number | null
          valor_venda_inicial: number | null
          vendedor: string | null
        }
        Insert: {
          comissao?: string | null
          comissao_confirmada?: boolean | null
          comissao_paga?: boolean | null
          cor_marcacao?: string | null
          created_at?: string
          created_at_br?: string | null
          data_agendamento?: string | null
          data_cadastro_desejada?: string | null
          data_limite?: string | null
          data_subida_campanha?: string | null
          data_venda?: string | null
          descricao_problema?: string | null
          eh_ultimo_pago?: boolean | null
          email_cliente?: string | null
          email_gestor?: string | null
          id?: number
          link_briefing?: string | null
          link_campanha?: string | null
          link_criativo?: string | null
          link_grupo?: string | null
          link_site?: string | null
          nome_cliente?: string | null
          numero_bm?: string | null
          origem_cadastro?: string | null
          saque_solicitado?: boolean | null
          site_descricao_personalizada?: string | null
          site_pago?: boolean | null
          site_status?: string | null
          status_campanha?: string | null
          status_envio?: string | null
          telefone?: string | null
          total_pago_comissao?: number | null
          ultimo_pagamento_em?: string | null
          ultimo_valor_pago?: number | null
          valor_comissao?: number | null
          valor_venda_inicial?: number | null
          vendedor?: string | null
        }
        Update: {
          comissao?: string | null
          comissao_confirmada?: boolean | null
          comissao_paga?: boolean | null
          cor_marcacao?: string | null
          created_at?: string
          created_at_br?: string | null
          data_agendamento?: string | null
          data_cadastro_desejada?: string | null
          data_limite?: string | null
          data_subida_campanha?: string | null
          data_venda?: string | null
          descricao_problema?: string | null
          eh_ultimo_pago?: boolean | null
          email_cliente?: string | null
          email_gestor?: string | null
          id?: number
          link_briefing?: string | null
          link_campanha?: string | null
          link_criativo?: string | null
          link_grupo?: string | null
          link_site?: string | null
          nome_cliente?: string | null
          numero_bm?: string | null
          origem_cadastro?: string | null
          saque_solicitado?: boolean | null
          site_descricao_personalizada?: string | null
          site_pago?: boolean | null
          site_status?: string | null
          status_campanha?: string | null
          status_envio?: string | null
          telefone?: string | null
          total_pago_comissao?: number | null
          ultimo_pagamento_em?: string | null
          ultimo_valor_pago?: number | null
          valor_comissao?: number | null
          valor_venda_inicial?: number | null
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
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_gestor_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      save_gestor_meta_ads_config: {
        Args: {
          p_email_usuario: string
          p_api_id: string
          p_app_secret: string
          p_access_token: string
          p_ad_account_id: string
        }
        Returns: Json
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
