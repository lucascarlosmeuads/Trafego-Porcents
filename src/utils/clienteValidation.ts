
// Utilitário para validação e logs de valor de comissão
export function validateAndLogCommissionValue(
  valor_comissao: any,
  source: string
): number {
  console.log(`💰 [${source}] === VALIDAÇÃO VALOR COMISSÃO ===`)
  console.log(`💰 [${source}] Valor recebido:`, valor_comissao, '(tipo:', typeof valor_comissao, ')')
  
  // Se não foi fornecido ou é null/undefined, usar padrão R$60
  if (valor_comissao === null || valor_comissao === undefined || valor_comissao === '') {
    console.log(`💰 [${source}] APLICANDO VALOR PADRÃO: R$60,00`)
    return 60.00
  }
  
  // Converter para número se necessário
  const valorNumerico = typeof valor_comissao === 'number' ? valor_comissao : parseFloat(valor_comissao)
  
  // Se conversão falhou, usar padrão
  if (isNaN(valorNumerico)) {
    console.log(`💰 [${source}] VALOR INVÁLIDO - APLICANDO PADRÃO: R$60,00`)
    return 60.00
  }
  
  // Se valor é 0 ou negativo, usar padrão
  if (valorNumerico <= 0) {
    console.log(`💰 [${source}] VALOR ZERO/NEGATIVO - APLICANDO PADRÃO: R$60,00`)
    return 60.00
  }
  
  console.log(`💰 [${source}] VALOR VÁLIDO MANTIDO: R$${valorNumerico.toFixed(2)}`)
  return valorNumerico
}

// Função para verificar se um email é de criador de sites
export function isSitesUser(email: string): boolean {
  const sitesEmails = [
    'sites@gpsagenciaweb.com.br',
    'sites@example.com'
  ]
  
  return sitesEmails.includes(email?.toLowerCase())
}

export function logClientCreation(clientData: any, source: string) {
  console.log(`🎯 [${source}] === CRIAÇÃO DE CLIENTE ===`)
  console.log(`📝 [${source}] Nome:`, clientData.nome_cliente)
  console.log(`📞 [${source}] Telefone:`, clientData.telefone)
  console.log(`📧 [${source}] Email:`, clientData.email_cliente)
  console.log(`💰 [${source}] Valor Comissão: R$${clientData.valor_comissao}`)
  console.log(`📊 [${source}] Status:`, clientData.status_campanha)
  console.log(`📅 [${source}] Data Venda:`, clientData.data_venda)
  console.log(`👨‍💼 [${source}] Gestor:`, clientData.email_gestor)
  console.log(`🛒 [${source}] Vendedor:`, clientData.vendedor)
  console.log(`🎯 [${source}] === FIM LOG CRIAÇÃO ===`)
}
