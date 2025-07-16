
import { TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Folder, Upload, AtSign, User, Calendar, Phone, Building, Globe, Target, DollarSign, Palette } from 'lucide-react'

interface TableHeaderProps {
  isAdmin?: boolean
  showEmailGestor?: boolean
}

export function TableHeader({ isAdmin = false, showEmailGestor = false }: TableHeaderProps) {
  return (
    <TooltipProvider>
      <TableHeaderComponent>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-white font-semibold w-16 text-xs sticky left-0 bg-card z-10">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Calendar className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs sticky left-16 bg-card z-10">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Palette className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cor</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-24 text-xs sticky left-24 bg-card z-10">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Building className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cliente</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center text-xs font-bold">
                  🤖
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Origem</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-20 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Phone className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Telefone</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email Cliente</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          {(isAdmin || showEmailGestor) && (
            <TableHead className="text-white font-semibold w-8 text-xs">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center justify-center">
                    <AtSign className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Gestor</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
          )}
          <TableHead className="text-white font-semibold w-24 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Target className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status Campanha</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-20 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Globe className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Status Site</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-16 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Calendar className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data Limite</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Folder className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Materiais</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <Upload className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Site</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-8 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center text-xs font-bold">
                  BM
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Número BM</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead className="text-white font-semibold w-12 text-xs">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center justify-center">
                  <DollarSign className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comissão</p>
              </TooltipContent>
            </Tooltip>
          </TableHead>
        </TableRow>
      </TableHeaderComponent>
    </TooltipProvider>
  )
}
