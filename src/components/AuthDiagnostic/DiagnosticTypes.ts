
export interface DiagnosticResult {
  email: string
  clienteExistsInDatabase: boolean
  clienteData?: {
    id: string
    nome_cliente: string
    email_cliente: string
  }
  duplicateClientes?: Array<{
    id: string
    nome_cliente: string
    email_cliente: string
  }>
  userExistsInAuth: boolean
  emailConfirmed: boolean
  canLogin: boolean
  issues: DiagnosticIssue[]
  corrections: DiagnosticCorrection[]
  clientMessage?: string
}

export interface DiagnosticIssue {
  type: 'missing_user' | 'wrong_password' | 'unconfirmed_email' | 'missing_client' | 'duplicate_clients' | 'unknown'
  severity: 'critical' | 'warning' | 'info'
  description: string
  solution: string
}

export interface DiagnosticCorrection {
  action: string
  status: 'pending' | 'success' | 'failed'
  message: string
  timestamp?: string
}

export interface DiagnosticProgress {
  step: string
  progress: number
  message: string
}
