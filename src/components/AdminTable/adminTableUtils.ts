
export const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Preenchimento do Formulário':
      return 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
    case 'Brief':
      return 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
    case 'Criativo':
      return 'bg-purple-500/20 text-purple-700 border border-purple-500/30'
    case 'Site':
      return 'bg-orange-500/20 text-orange-700 border border-orange-500/30'
    case 'Agendamento':
      return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30'
    case 'Configurando BM':
      return 'bg-cyan-500/20 text-cyan-700 border border-cyan-500/30'
    case 'Subindo Campanha':
      return 'bg-lime-500/20 text-lime-700 border border-lime-500/30'
    case 'Campanha no Ar':
      return 'bg-green-500/20 text-green-700 border border-green-500/30'
    case 'Otimização':
      return 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
    case 'Cliente Sumiu':
      return 'bg-slate-500/20 text-slate-700 border border-slate-500/30'
    case 'Reembolso':
      return 'bg-red-500/20 text-red-700 border border-red-500/30'
    default:
      return 'bg-muted text-muted-foreground border border-border'
  }
}
