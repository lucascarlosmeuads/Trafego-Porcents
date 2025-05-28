export interface TokenData {
  access_token: string
  refresh_token: string
  type: string
}

export const extractTokensFromUrl = (): TokenData | null => {
  try {
    console.log('🔍 [TokenExtraction] Iniciando extração de tokens...')
    
    // Verificar se window.location está disponível
    if (typeof window === 'undefined' || !window.location) {
      console.error('❌ [TokenExtraction] window.location não disponível')
      return null
    }

    // Log da URL completa para debug
    const fullUrl = window.location.href
    const hash = window.location.hash
    const search = window.location.search
    
    console.log('🔍 [TokenExtraction] URL completa:', fullUrl)
    console.log('🔍 [TokenExtraction] Hash fragment:', hash)
    console.log('🔍 [TokenExtraction] Query string:', search)

    // Tentar extrair do hash primeiro (#access_token=...&type=recovery)
    if (hash && hash.length > 1) {
      console.log('🔍 [TokenExtraction] Processando hash fragment...')
      const hashParams = new URLSearchParams(hash.substring(1))
      
      // Log de todos os parâmetros do hash
      const hashEntries = Array.from(hashParams.entries())
      console.log('🔍 [TokenExtraction] Parâmetros encontrados no hash:', hashEntries)
      
      const accessTokenFromHash = hashParams.get('access_token')
      const refreshTokenFromHash = hashParams.get('refresh_token')
      const typeFromHash = hashParams.get('type')

      console.log('🔍 [TokenExtraction] access_token do hash:', accessTokenFromHash ? `${accessTokenFromHash.substring(0, 20)}...` : 'null')
      console.log('🔍 [TokenExtraction] refresh_token do hash:', refreshTokenFromHash ? `${refreshTokenFromHash.substring(0, 20)}...` : 'null')
      console.log('🔍 [TokenExtraction] type do hash:', typeFromHash)

      if (accessTokenFromHash && typeFromHash === 'recovery') {
        console.log('✅ [TokenExtraction] Tokens válidos encontrados no hash fragment!')
        const tokenData = {
          access_token: accessTokenFromHash,
          refresh_token: refreshTokenFromHash || '',
          type: typeFromHash
        }
        console.log('🔍 [TokenExtraction] Dados extraídos:', {
          access_token: `${accessTokenFromHash.substring(0, 20)}...`,
          refresh_token: refreshTokenFromHash ? `${refreshTokenFromHash.substring(0, 20)}...` : 'vazio',
          type: typeFromHash
        })
        return tokenData
      } else {
        console.log('⚠️ [TokenExtraction] Tokens do hash não são válidos para recovery')
        console.log('🔍 [TokenExtraction] Verificação - accessToken existe:', !!accessTokenFromHash)
        console.log('🔍 [TokenExtraction] Verificação - type é recovery:', typeFromHash === 'recovery')
      }
    } else {
      console.log('🔍 [TokenExtraction] Nenhum hash fragment encontrado')
    }

    // Tentar extrair da query string (?access_token=...&type=recovery)
    if (search && search.length > 1) {
      console.log('🔍 [TokenExtraction] Processando query string...')
      const queryParams = new URLSearchParams(search)
      
      // Log de todos os parâmetros da query string
      const queryEntries = Array.from(queryParams.entries())
      console.log('🔍 [TokenExtraction] Parâmetros encontrados na query:', queryEntries)
      
      const accessTokenFromQuery = queryParams.get('access_token')
      const refreshTokenFromQuery = queryParams.get('refresh_token')
      const typeFromQuery = queryParams.get('type')

      console.log('🔍 [TokenExtraction] access_token da query:', accessTokenFromQuery ? `${accessTokenFromQuery.substring(0, 20)}...` : 'null')
      console.log('🔍 [TokenExtraction] refresh_token da query:', refreshTokenFromQuery ? `${refreshTokenFromQuery.substring(0, 20)}...` : 'null')
      console.log('🔍 [TokenExtraction] type da query:', typeFromQuery)

      if (accessTokenFromQuery && typeFromQuery === 'recovery') {
        console.log('✅ [TokenExtraction] Tokens válidos encontrados na query string!')
        const tokenData = {
          access_token: accessTokenFromQuery,
          refresh_token: refreshTokenFromQuery || '',
          type: typeFromQuery
        }
        console.log('🔍 [TokenExtraction] Dados extraídos:', {
          access_token: `${accessTokenFromQuery.substring(0, 20)}...`,
          refresh_token: refreshTokenFromQuery ? `${refreshTokenFromQuery.substring(0, 20)}...` : 'vazio',
          type: typeFromQuery
        })
        return tokenData
      } else {
        console.log('⚠️ [TokenExtraction] Tokens da query não são válidos para recovery')
        console.log('🔍 [TokenExtraction] Verificação - accessToken existe:', !!accessTokenFromQuery)
        console.log('🔍 [TokenExtraction] Verificação - type é recovery:', typeFromQuery === 'recovery')
      }
    } else {
      console.log('🔍 [TokenExtraction] Nenhuma query string encontrada')
    }

    console.log('❌ [TokenExtraction] Nenhum token de recovery válido encontrado')
    return null
  } catch (error) {
    console.error('💥 [TokenExtraction] Erro inesperado ao extrair tokens:', error)
    console.error('🔍 [TokenExtraction] Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível')
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
