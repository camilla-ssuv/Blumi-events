export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          external_company_id: string
          nome: string
          cor_primaria: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          external_company_id: string
          nome: string
          cor_primaria?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          external_company_id?: string
          nome?: string
          cor_primaria?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          email: string
          role: string
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          email: string
          role: string
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          email?: string
          role?: string
          ativo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      participantes: {
        Row: {
          id: string
          nome: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          slug: string
          tipo: 'simples' | 'feira'
          visibilidade: 'aberto' | 'convite'
          status: 'rascunho' | 'publicado' | 'encerrado'
          descricao: string | null
          cidade: string | null
          endereco: string | null
          vagas_total: number | null
          codigo_convite: string | null
          data_inicio: string | null
          data_fim: string | null
          emitir_certificados: boolean
          certificado_titulo: string | null
          certificado_carga_horaria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          slug: string
          tipo: 'simples' | 'feira'
          visibilidade?: 'aberto' | 'convite'
          status?: 'rascunho' | 'publicado' | 'encerrado'
          descricao?: string | null
          cidade?: string | null
          endereco?: string | null
          vagas_total?: number | null
          codigo_convite?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          emitir_certificados?: boolean
          certificado_titulo?: string | null
          certificado_carga_horaria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          slug?: string
          tipo?: 'simples' | 'feira'
          visibilidade?: 'aberto' | 'convite'
          status?: 'rascunho' | 'publicado' | 'encerrado'
          descricao?: string | null
          cidade?: string | null
          endereco?: string | null
          vagas_total?: number | null
          codigo_convite?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          emitir_certificados?: boolean
          certificado_titulo?: string | null
          certificado_carga_horaria?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subeventos: {
        Row: {
          id: string
          evento_id: string
          nome: string
          descricao: string | null
          modo_inscricao: 'inscricao' | 'checkin_livre'
          inscricao_automatica: boolean
          data_inicio: string | null
          data_fim: string | null
          local: string | null
          vagas_total: number | null
          tipo_tag: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          nome: string
          descricao?: string | null
          modo_inscricao?: 'inscricao' | 'checkin_livre'
          inscricao_automatica?: boolean
          data_inicio?: string | null
          data_fim?: string | null
          local?: string | null
          vagas_total?: number | null
          tipo_tag?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          nome?: string
          descricao?: string | null
          modo_inscricao?: 'inscricao' | 'checkin_livre'
          inscricao_automatica?: boolean
          data_inicio?: string | null
          data_fim?: string | null
          local?: string | null
          vagas_total?: number | null
          tipo_tag?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipos_ingresso: {
        Row: {
          id: string
          evento_id: string
          nome: string
          descricao: string | null
          vagas: number | null
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          nome: string
          descricao?: string | null
          vagas?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          nome?: string
          descricao?: string | null
          vagas?: number | null
          created_at?: string
        }
        Relationships: []
      }
      perguntas_triagem: {
        Row: {
          id: string
          evento_id: string
          enunciado: string
          tipo: 'texto' | 'escolha_unica' | 'multipla_escolha'
          opcoes: string[] | null
          obrigatoria: boolean
          ordem: number
          condicao_pergunta_id: string | null
          condicao_valor: string | null
          created_at: string
        }
        Insert: {
          id?: string
          evento_id: string
          enunciado: string
          tipo: 'texto' | 'escolha_unica' | 'multipla_escolha'
          opcoes?: string[] | null
          obrigatoria?: boolean
          ordem?: number
          condicao_pergunta_id?: string | null
          condicao_valor?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          evento_id?: string
          enunciado?: string
          tipo?: 'texto' | 'escolha_unica' | 'multipla_escolha'
          opcoes?: string[] | null
          obrigatoria?: boolean
          ordem?: number
          condicao_pergunta_id?: string | null
          condicao_valor?: string | null
          created_at?: string
        }
        Relationships: []
      }
      inscricoes: {
        Row: {
          id: string
          participante_id: string
          evento_id: string
          subevento_id: string | null
          tipo_ingresso_id: string | null
          status: 'confirmada' | 'cancelada' | 'pendente'
          qr_token: string
          created_at: string
        }
        Insert: {
          id?: string
          participante_id: string
          evento_id: string
          subevento_id?: string | null
          tipo_ingresso_id?: string | null
          status?: 'confirmada' | 'cancelada' | 'pendente'
          qr_token?: string
          created_at?: string
        }
        Update: {
          id?: string
          participante_id?: string
          evento_id?: string
          subevento_id?: string | null
          tipo_ingresso_id?: string | null
          status?: 'confirmada' | 'cancelada' | 'pendente'
          qr_token?: string
          created_at?: string
        }
        Relationships: []
      }
      respostas_triagem: {
        Row: {
          id: string
          inscricao_id: string
          pergunta_id: string
          resposta: string | null
          opcoes: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          inscricao_id: string
          pergunta_id: string
          resposta?: string | null
          opcoes?: string[] | null
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      checkins: {
        Row: {
          id: string
          inscricao_id: string
          cancelado: boolean
          cancelado_por: string | null
          cancelado_em: string | null
          motivo_cancel: string | null
          origem: 'camera' | 'usb' | 'manual' | 'correcao_admin'
          feito_por: string | null
          dispositivo_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inscricao_id: string
          cancelado?: boolean
          cancelado_por?: string | null
          cancelado_em?: string | null
          motivo_cancel?: string | null
          origem?: 'camera' | 'usb' | 'manual' | 'correcao_admin'
          feito_por?: string | null
          dispositivo_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inscricao_id?: string
          cancelado?: boolean
          cancelado_por?: string | null
          cancelado_em?: string | null
          motivo_cancel?: string | null
          origem?: 'camera' | 'usb' | 'manual' | 'correcao_admin'
          feito_por?: string | null
          dispositivo_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dispositivos: {
        Row: {
          id: string
          tenant_id: string
          evento_id: string
          subevento_id: string | null
          nome: string
          tipo: 'fixo' | 'movel'
          ativo: boolean
          codigo_sessao: string
          codigo_expira_em: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          evento_id: string
          subevento_id?: string | null
          nome: string
          tipo: 'fixo' | 'movel'
          ativo?: boolean
          codigo_sessao: string
          codigo_expira_em: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          evento_id?: string
          subevento_id?: string | null
          nome?: string
          tipo?: 'fixo' | 'movel'
          ativo?: boolean
          codigo_sessao?: string
          codigo_expira_em?: string
          created_at?: string
        }
        Relationships: []
      }
      visitas_subevento: {
        Row: {
          id: string
          subevento_id: string
          inscricao_id: string
          dispositivo_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subevento_id: string
          inscricao_id: string
          dispositivo_id?: string | null
          created_at?: string
        }
        Update: never
        Relationships: []
      }
      links_expositor: {
        Row: {
          id: string
          subevento_id: string
          token: string
          ativo: boolean
          views: number
          created_at: string
        }
        Insert: {
          id?: string
          subevento_id: string
          token?: string
          ativo?: boolean
          views?: number
          created_at?: string
        }
        Update: {
          id?: string
          subevento_id?: string
          token?: string
          ativo?: boolean
          views?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Aliases convenientes para os tipos de Row
export type Tenant          = Database['public']['Tables']['tenants']['Row']
export type Evento          = Database['public']['Tables']['eventos']['Row']
export type Subevento       = Database['public']['Tables']['subeventos']['Row']
export type Inscricao       = Database['public']['Tables']['inscricoes']['Row']
export type Participante    = Database['public']['Tables']['participantes']['Row']
export type Checkin         = Database['public']['Tables']['checkins']['Row']
export type Dispositivo     = Database['public']['Tables']['dispositivos']['Row']
export type TipoIngresso    = Database['public']['Tables']['tipos_ingresso']['Row']
export type PerguntaTriagem = Database['public']['Tables']['perguntas_triagem']['Row']
export type RespostaTriagemRow = Database['public']['Tables']['respostas_triagem']['Row']
export type VisitaSubevento = Database['public']['Tables']['visitas_subevento']['Row']
export type LinkExpositorRow = Database['public']['Tables']['links_expositor']['Row']

// Query result types — join shapes returned by common queries

export type InscricaoCheckinRow = {
  id: string
  status: string
  evento_id: string
  participantes: Pick<Participante, 'nome' | 'email'> | null
  eventos: Pick<Evento, 'nome'> | null
  subeventos: Pick<Subevento, 'nome'> | null
  checkins: Pick<Checkin, 'id' | 'cancelado'>[]
}

export type InscricaoAdminRow = {
  id: string
  created_at: string
  qr_token: string
  status: string
  participantes: Pick<Participante, 'nome' | 'email'> | null
  tipos_ingresso: Pick<TipoIngresso, 'nome'> | null
  checkins: Pick<Checkin, 'id' | 'cancelado' | 'created_at'>[]
}

export type InscricaoCsvRow = {
  id: string
  created_at: string
  participantes: Pick<Participante, 'nome' | 'email'> | null
  tipos_ingresso: Pick<TipoIngresso, 'nome'> | null
  checkins: Pick<Checkin, 'created_at' | 'cancelado'>[]
  respostas_triagem: Pick<RespostaTriagemRow, 'pergunta_id' | 'resposta' | 'opcoes'>[]
}

export type InscricaoMinhaAreaRow = {
  id: string
  qr_token: string
  status: string
  created_at: string
  eventos: (Pick<Evento, 'id' | 'slug' | 'nome' | 'tipo' | 'data_inicio' | 'data_fim' | 'cidade' | 'emitir_certificados'> & {
    tenants: { nome: string; cor_primaria: string | null } | null
  }) | null
  subeventos: Pick<Subevento, 'id' | 'nome' | 'data_inicio'> | null
  checkins: Pick<Checkin, 'id' | 'cancelado' | 'created_at'>[] | null
}

export type InscricaoCertificadoRow = {
  id: string
  qr_token: string
  participantes: Pick<Participante, 'nome' | 'email'> | null
  eventos: (Pick<Evento, 'id' | 'nome' | 'data_inicio' | 'data_fim' | 'cidade' | 'emitir_certificados' | 'certificado_titulo' | 'certificado_carga_horaria'> & {
    tenants: Pick<Tenant, 'nome' | 'cor_primaria'> | null
  }) | null
  checkins: Pick<Checkin, 'id' | 'cancelado' | 'created_at'>[]
}

export type DispositivoComJoins = Pick<Dispositivo, 'id' | 'nome' | 'tipo' | 'ativo' | 'codigo_expira_em'> & {
  eventos: Pick<Evento, 'id' | 'nome' | 'slug'> | null
  subeventos: Pick<Subevento, 'id' | 'nome' | 'modo_inscricao'> | null
}

export type SubeventoDashboard = Pick<Subevento, 'id' | 'nome' | 'modo_inscricao' | 'tipo_tag' | 'local' | 'data_inicio'> & {
  eventos: (Pick<Evento, 'id' | 'nome' | 'data_inicio'> & {
    tenants: { nome: string; cor_primaria?: string | null } | null
  }) | null
}

export type EventoCatalogoRow = Pick<Evento, 'id' | 'slug' | 'nome' | 'tipo' | 'visibilidade' | 'status' | 'data_inicio' | 'data_fim' | 'cidade' | 'vagas_total'> & {
  tenants: Pick<Tenant, 'nome' | 'cor_primaria' | 'logo_url'> | null
}
