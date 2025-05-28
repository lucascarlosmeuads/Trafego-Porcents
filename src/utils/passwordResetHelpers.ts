
export interface TokenData {
  access_token: string
  refresh_token: string
  type: string
}

export const extractTokensFromUrl = (): TokenData | null => {
  try {
    // Tentar extrair do hash primeiro (#access_token=...&type=recovery)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessTokenFromHash = hashParams.get('access_token')
    const refreshTokenFromHash = hashParams.get('refresh_token')
    const typeFromHash = hashParams.get('type')

    if (accessTokenFromHash && typeFromHash === 'recovery') {
      console.log('🔑 [PasswordReset] Tokens encontrados no hash')
      return {
        access_token: accessTokenFromHash,
        refresh_token: refreshTokenFromHash || '',
        type: typeFromHash
      }
    }

    // Tentar extrair da query string (?access_token=...&type=recovery)
    const queryParams = new URLSearchParams(window.location.search)
    const accessTokenFromQuery = queryParams.get('access_token')
    const refreshTokenFromQuery = queryParams.get('refresh_token')
    const typeFromQuery = queryParams.get('type')

    if (accessTokenFromQuery && typeFromQuery === 'recovery') {
      console.log('🔑 [PasswordReset] Tokens encontrados na query string')
      return {
        access_token: accessTokenFromQuery,
        refresh_token: refreshTokenFromQuery || '',
        type: typeFromQuery
      }
    }

    return null
  } catch (error) {
    console.error('❌ [PasswordReset] Erro ao extrair tokens:', error)
    return null
  }
}

export const clearTokensFromUrl = () => {
  // Limpar hash e query string da URL sem recarregar
  const cleanUrl = window.location.origin + window.location.pathname
  window.history.replaceState(null, '', cleanUrl)
}

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'A senha deve ter pelo menos 6 caracteres'
    }
  }

  return {
    isValid: true,
    message: 'Senha válida'
  }
}
