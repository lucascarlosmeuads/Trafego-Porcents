
import { Calendar, AlertTriangle, ExternalLink } from 'lucide-react'
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from '@/components/ui/table'

export function TableHeader() {
  return (
    <ShadcnTableHeader>
      <TableRow className="border-border hover:bg-muted/20 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
        <TableHead className="w-16 text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-300">#</span>
            <span>ID</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[100px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Data Venda</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[200px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Nome Cliente</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[120px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span>Telefone</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[150px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">@</span>
            <span>Email Gestor</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[180px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Status Campanha</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[120px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>Data Limite</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-400" />
            <span>Materiais</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[80px] hidden lg:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-orange-400" />
            <span>Site</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[120px] hidden xl:table-cell text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 border-r border-slate-600/50 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span>Número BM</span>
          </div>
        </TableHead>
        <TableHead className="min-w-[100px] text-white font-bold text-sm tracking-wide uppercase bg-gradient-to-b from-slate-600 to-slate-700 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-green-400">R$</span>
            <span>Comissão</span>
          </div>
        </TableHead>
      </TableRow>
    </ShadcnTableHeader>
  )
}
