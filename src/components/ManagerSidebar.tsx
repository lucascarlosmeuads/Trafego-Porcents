
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, RefreshCw, UserCheck, AlertCircle, Database, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface ManagerData {
  email: string
  totalClientes: number
  clientesAtivos: number
  clientesProblema: number
}

interface ManagerSidebarProps {
  selectedManager: string
  onManagerChange: (manager: string) => void
  managersData: ManagerData[]
  onRefresh: () => void
  isLoading: boolean
}

export function ManagerSidebar({
  selectedManager,
  onManagerChange,
  managersData,
  onRefresh,
  isLoading
}: ManagerSidebarProps) {
  const [totalSystemClients, setTotalSystemClients] = useState<number>(0)
  const [loadingSystemTotal, setLoadingSystemTotal] = useState(false)
  const { toast } = useToast()

  const fetchSystemTotal = async () => {
    setLoadingSystemTotal(true)
    try {
      const { count, error } = await supabase
        .from('todos_clientes')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Erro ao buscar total do sistema:', error)
        return
      }

      setTotalSystemClients(count || 0)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoadingSystemTotal(false)
    }
  }

  useEffect(() => {
    fetchSystemTotal()
  }, [])

  const totalManagedClients = managersData.reduce((acc, manager) => acc + manager.totalClientes, 0)

  return (
    <Card className="w-80 h-fit bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Users className="w-5 h-5" />
          Gestores
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Seletor de Gestor */}
        <div>
          <Select value={selectedManager} onValueChange={onManagerChange}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Selecione um gestor..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="Todos os Clientes">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Todos os Clientes</span>
                </div>
              </SelectItem>
              {managersData
                .filter(manager => manager.totalClientes > 0)
                .map((manager) => (
                  <SelectItem key={manager.email} value={manager.email}>
                    <div className="flex items-center justify-between w-full">
                      <span>{manager.email}</span>
                      <Badge variant="secondary" className="ml-2">
                        {manager.totalClientes}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resumo do Sistema */}
        <div className="bg-muted/20 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4" />
            Resumo do Sistema
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-card rounded p-3 border">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Database className="w-3 h-3" />
                <span className="font-medium">Total Sistema</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {loadingSystemTotal ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  totalSystemClients.toLocaleString()
                )}
              </div>
            </div>
            
            <div className="bg-card rounded p-3 border">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <UserCheck className="w-3 h-3" />
                <span className="font-medium">Gerenciados</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {totalManagedClients.toLocaleString()}
              </div>
            </div>
          </div>

          {totalSystemClients > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Cobertura de Gestão:</span>
                <span className="font-medium">
                  {((totalManagedClients / totalSystemClients) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalManagedClients / totalSystemClients) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de Gestores */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {managersData
            .filter(manager => manager.totalClientes > 0)
            .sort((a, b) => b.totalClientes - a.totalClientes)
            .map((manager) => {
              const isSelected = selectedManager === manager.email
              const hasProblems = manager.clientesProblema > 0
              
              return (
                <div
                  key={manager.email}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                  onClick={() => onManagerChange(manager.email)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {manager.email}
                    </span>
                    {hasProblems && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{manager.totalClientes}</div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{manager.clientesAtivos}</div>
                      <div className="text-muted-foreground">Ativos</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${hasProblems ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {manager.clientesProblema}
                      </div>
                      <div className="text-muted-foreground">Problemas</div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {managersData.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum gestor encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
