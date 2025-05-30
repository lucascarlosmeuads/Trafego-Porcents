
// Função para verificar se o usuário é criador de sites - OTIMIZADA
export const isSitesUser = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim()
  console.log('🌐 [clienteValidation] Verificando criador de sites:', normalizedEmail)
  
  const isSites = normalizedEmail === 'criadordesite@trafegoporcents.com' ||
         normalizedEmail.includes('criador') || 
         normalizedEmail.includes('site') || 
         normalizedEmail.includes('webdesign') ||
         normalizedEmail.includes('sites') ||
         normalizedEmail.includes('web') ||
         normalizedEmail.includes('design') ||
         normalizedEmail.includes('developer') ||
         normalizedEmail.includes('dev')
  
  console.log('🌐 [clienteValidation] É criador de sites:', isSites)
  return isSites
}

// Generate random password for new clients
export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Senha padrão para novos clientes
export const SENHA_PADRAO_CLIENTE = 'parceriadesucesso'
