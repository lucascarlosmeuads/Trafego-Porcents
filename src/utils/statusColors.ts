
import { type StatusCampanha } from '@/lib/supabase'

export const getModernStatusStyle = (status: string): string => {
  const modernStyles: Record<string, string> = {
    'Cliente Novo': 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-300 border border-slate-500/30 shadow-lg shadow-slate-500/20',
    'Formulário': 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30 shadow-lg shadow-gray-500/20',
    'Brief': 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20',
    'Criativo': 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/20',
    'Site': 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-500/20',
    'Agendamento': 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/20',
    'Configurando BM': 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20',
    'Subindo Campanha': 'bg-gradient-to-r from-lime-500/20 to-lime-600/20 text-lime-300 border border-lime-500/30 shadow-lg shadow-lime-500/20',
    'Otimização': 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/20',
    'Problema': 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/20',
    'Cliente Sumiu': 'bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-400 border border-slate-600/30 shadow-lg shadow-slate-600/20',
    'Reembolso': 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/20',
    'Saque Pendente': 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/20',
    'Campanha Anual': 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/20',
    'Urgente': 'bg-gradient-to-r from-red-600/30 to-red-700/30 text-red-200 border border-red-600/40 shadow-lg shadow-red-600/30',
    'Cliente Antigo': 'bg-gradient-to-r from-violet-500/20 to-violet-600/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/20'
  }
  return modernStyles[status] || 'bg-gradient-to-r from-muted/50 to-muted/70 text-muted-foreground border border-border shadow-lg'
}

// Versão para badges mais simples (sem gradiente)
export const getStatusBadgeClasses = (status: string): string => {
  const badgeStyles: Record<string, string> = {
    'Cliente Novo': 'bg-slate-600 text-white hover:bg-slate-700',
    'Formulário': 'bg-gray-600 text-white hover:bg-gray-700',
    'Brief': 'bg-blue-600 text-white hover:bg-blue-700',
    'Criativo': 'bg-purple-600 text-white hover:bg-purple-700',
    'Site': 'bg-orange-600 text-white hover:bg-orange-700',
    'Agendamento': 'bg-yellow-500 text-black hover:bg-yellow-600',
    'Configurando BM': 'bg-cyan-600 text-white hover:bg-cyan-700',
    'Subindo Campanha': 'bg-lime-600 text-white hover:bg-lime-700',
    'Otimização': 'bg-emerald-600 text-white hover:bg-emerald-700',
    'Problema': 'bg-red-600 text-white hover:bg-red-700',
    'Cliente Sumiu': 'bg-slate-700 text-white hover:bg-slate-800',
    'Reembolso': 'bg-rose-600 text-white hover:bg-rose-700',
    'Saque Pendente': 'bg-green-600 text-white hover:bg-green-700',
    'Campanha Anual': 'bg-indigo-600 text-white hover:bg-indigo-700',
    'Urgente': 'bg-red-700 text-white hover:bg-red-800',
    'Cliente Antigo': 'bg-violet-600 text-white hover:bg-violet-700'
  }
  return badgeStyles[status] || 'bg-gray-600 text-white hover:bg-gray-700'
}
