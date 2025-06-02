
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Users, FileInput, FilePlus, AlertTriangle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { formatDate, cn } from "@/lib/utils"
import { StatusSelect } from './ClientesTable/StatusSelect'
import { SiteStatusSelect } from './ClientesTable/SiteStatusSelect'
import { TableFilters } from './ClientesTable/TableFilters'
import { InputWithCopy } from './InputWithCopy'

// Tipagem para os dados dos clientes
export interface Cliente {
  id: string
  created_at: string
  nome: string
  email: string
  telefone: string
  vendedor: string
  status_campanha: string
  site_status: string
  data_inicio: string | null
  data_final: string | null
  valor: number | null
  link_reuniao: string | null
  link_pasta: string | null
  descricao_problema: string | null
  briefing: string | null
  anotacoes_adicionais: string | null
  criativo_status: string | null
  bm_status: string | null
}

// Tipo para os status válidos de campanha
type StatusCampanha = "Cliente Novo" | "Formulário" | "Brief" | "Criativo" | "Site" | "Agendamento" | "Configurando BM" | "Subindo Campanha" | "Otimização" | "Problema" | "Cliente Sumiu" | "Reembolso" | "Saque Pendente" | "Campanha Anual" | "Urgente" | "Cliente Antigo"

interface ClientesTableProps {
  selectedManager?: string
}

const ResponsiveTableWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overflow-x-auto">
      {children}
    </div>
  )
}

export function ClientesTable({ selectedManager }: ClientesTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // Estados para os dados e filtros
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [siteStatusFilter, setSiteStatusFilter] = useState('all')
  const [creativoFilter, setCreativoFilter] = useState('all')
  const [bmFilter, setBmFilter] = useState('all')
  const [gestores, setGestores] = useState<string[]>([])
  const [transferindoCliente, setTransferindoCliente] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({})
  const [expandedBriefings, setExpandedBriefings] = useState<{ [key: string]: boolean }>({})

  // Estados para controlar a edição inline
  const [editingClienteId, setEditingClienteId] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<{ [key: string]: any }>({})

  // Função para buscar os clientes do Supabase
  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedManager && selectedManager !== 'todos') {
        query = query.eq('vendedor', selectedManager)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        toast({
          title: "Erro ao buscar clientes!",
          description: "Ocorreu um erro ao carregar os clientes. Por favor, tente novamente.",
          variant: "destructive",
        })
      }

      if (data) {
        setClientes(data)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedManager, toast])

  // Função para buscar os gestores (vendedores) do Supabase
  const fetchGestores = useCallback(async () => {
    try {
      const { data: gestoresData, error: gestoresError } = await supabase
        .from('users')
        .select('name')
        .eq('role', 'gestor')

      if (gestoresError) {
        console.error('Erro ao buscar gestores:', gestoresError)
        toast({
          title: "Erro ao buscar gestores!",
          description: "Ocorreu um erro ao carregar os gestores. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      if (gestoresData) {
        const gestoresNomes = gestoresData.map(gestor => gestor.name)
        setGestores(gestoresNomes)
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar gestores:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado ao carregar os gestores. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Carregar clientes e gestores ao montar o componente
  useEffect(() => {
    fetchClientes()
    fetchGestores()
  }, [fetchClientes, fetchGestores])

  // Função para aplicar os filtros
  const filteredClientes = clientes.filter(cliente => {
    const searchTermLower = searchTerm.toLowerCase()
    const nomeIncludes = cliente.nome.toLowerCase().includes(searchTermLower)
    const emailIncludes = cliente.email.toLowerCase().includes(searchTermLower)
    const telefoneIncludes = cliente.telefone.includes(searchTerm)
    const vendedorIncludes = cliente.vendedor.toLowerCase().includes(searchTermLower)

    const statusMatch = statusFilter === 'all' || cliente.status_campanha === statusFilter
    const siteStatusMatch = siteStatusFilter === 'all' || cliente.site_status === siteStatusFilter
    const creativoMatch = creativoFilter === 'all' || cliente.criativo_status === creativoFilter
    const bmMatch = bmFilter === 'all' || cliente.bm_status === bmFilter

    return (
      (nomeIncludes || emailIncludes || telefoneIncludes || vendedorIncludes) &&
      statusMatch &&
      siteStatusMatch &&
      creativoMatch &&
      bmMatch
    )
  })

  // Handlers para atualizar os valores editados
  const handleInputChange = (clienteId: string, field: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [clienteId]: {
        ...prev[clienteId],
        [field]: value,
      },
    }))
  }

  // Handler para salvar as alterações inline
  const handleSaveInlineEdit = async (clienteId: string) => {
    setLoading(true)
    try {
      const updates = editedValues[clienteId]
      if (!updates) {
        console.log('Nenhuma alteração para salvar.')
        return
      }

      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao atualizar cliente:', error)
        toast({
          title: "Erro ao atualizar cliente!",
          description: "Ocorreu um erro ao salvar as alterações. Por favor, tente novamente.",
          variant: "destructive",
        })
        return
      }

      // Atualiza o estado local com os novos valores
      setClientes(prevClientes =>
        prevClientes.map(cliente =>
          cliente.id === clienteId ? { ...cliente, ...updates } : cliente
        )
      )

      // Limpa os valores editados e sai do modo de edição
      setEditedValues(prev => {
        const { [clienteId]: omit, ...rest } = prev
        return rest
      })
      setEditingClienteId(null)

      toast({
        title: "Cliente atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error('Erro inesperado ao salvar cliente:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado ao salvar as alterações. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handler para cancelar a edição inline
  const handleCancelInlineEdit = (clienteId: string) => {
    setEditingClienteId(null)
    setEditedValues(prev => {
      const { [clienteId]: omit, ...rest } = prev
      return rest
    })
  }

  // Função para transferir um cliente para outro gestor
  const handleTransferirCliente = async (clienteId: string, novoGestor: string) => {
    setTransferindoCliente(clienteId)
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ vendedor: novoGestor })
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao transferir cliente:', error)
        toast({
          title: "Erro ao transferir cliente!",
          description: "Ocorreu um erro ao transferir o cliente. Por favor, tente novamente.",
          variant: "destructive",
        })
      } else {
        setClientes(clientes =>
          clientes.map(cliente =>
            cliente.id === clienteId ? { ...cliente, vendedor: novoGestor } : cliente
          )
        )
        toast({
          title: "Cliente transferido!",
          description: `Cliente transferido para ${novoGestor} com sucesso.`,
        })
      }
    } catch (error) {
      console.error('Erro inesperado ao transferir cliente:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado ao transferir o cliente. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setTransferindoCliente(null)
    }
  }

  // Função para atualizar o status do cliente
  const handleStatusChange = async (clienteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ status_campanha: newStatus })
        .eq('id', clienteId)

      if (error) {
        console.error('Erro ao atualizar status:', error)
        toast({
          title: "Erro ao atualizar status!",
          description: "Ocorreu um erro ao atualizar o status. Por favor, tente novamente.",
          variant: "destructive",
        })
      } else {
        setClientes(clientes =>
          clientes.map(cliente =>
            cliente.id === clienteId ? { ...cliente, status_campanha: newStatus } : cliente
          )
        )
        toast({
          title: "Status atualizado!",
          description: "O status do cliente foi atualizado com sucesso.",
        })
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar status:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado ao atualizar o status. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  // Função para importar vendas via CSV
  const handleImportSales = async (file: File | null) => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado!",
        description: "Por favor, selecione um arquivo CSV para importar.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    try {
      const text = await file.text()
      const results = text.split('\n').map(row => row.split(','))

      // Mapear os dados do CSV para o formato do banco de dados
      const salesData = results.map(row => ({
        nome: row[0],
        email: row[1],
        telefone: row[2],
        vendedor: row[3],
        status_campanha: row[4],
        site_status: row[5],
        data_inicio: row[6] || null,
        data_final: row[7] || null,
        valor: row[8] ? parseFloat(row[8]) : null,
        link_reuniao: row[9] || null,
        link_pasta: row[10] || null,
        descricao_problema: row[11] || null,
        briefing: row[12] || null,
        anotacoes_adicionais: row[13] || null,
        criativo_status: row[14] || null,
        bm_status: row[15] || null,
      })).slice(1) // Remove o cabeçalho

      // Enviar os dados para o Supabase
      const { error } = await supabase
        .from('clientes')
        .insert(salesData)

      if (error) {
        console.error('Erro ao importar vendas:', error)
        toast({
          title: "Erro ao importar vendas!",
          description: "Ocorreu um erro ao importar os dados. Verifique o formato do arquivo e tente novamente.",
          variant: "destructive",
        })
      } else {
        fetchClientes() // Recarrega os clientes após a importação
        toast({
          title: "Vendas importadas!",
          description: "As vendas foram importadas com sucesso.",
        })
      }
    } catch (error) {
      console.error('Erro inesperado ao importar vendas:', error)
      toast({
        title: "Erro Inesperado!",
        description: "Ocorreu um erro inesperado ao importar as vendas. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'Cliente Novo': 'bg-slate-500 text-white',
      'Formulário': 'bg-gray-500 text-white',
      'Brief': 'bg-blue-500 text-white',
      'Criativo': 'bg-purple-500 text-white',
      'Site': 'bg-orange-500 text-white',
      'Agendamento': 'bg-yellow-500 text-white',
      'Configurando BM': 'bg-cyan-500 text-white',
      'Subindo Campanha': 'bg-lime-500 text-white',
      'Otimização': 'bg-emerald-500 text-white',
      'Problema': 'bg-red-500 text-white',
      'Cliente Sumiu': 'bg-slate-600 text-white',
      'Reembolso': 'bg-rose-500 text-white',
      'Saque Pendente': 'bg-green-500 text-white',
      'Campanha Anual': 'bg-indigo-500 text-white',
      'Urgente': 'bg-red-600 text-white',
      'Cliente Antigo': 'bg-violet-500 text-white',
    }
    return statusColors[status] || 'bg-gray-400 text-white'
  }

  // Remove os estados dos banners

  const TableActions = ({ showAddForm, setShowAddForm, onImportSales, isImporting }: { showAddForm: boolean, setShowAddForm: (show: boolean) => void, onImportSales: (file: File | null) => void, isImporting: boolean }) => {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        setFile(event.target.files[0])
      }
    }

    const handleImport = () => {
      onImportSales(file)
      setFile(null) // Limpa o arquivo após a importação
    }

    return (
      <div className="flex items-center space-x-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <FilePlus className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Importar Dados via CSV</SheetTitle>
              <SheetDescription>
                Selecione um arquivo CSV para importar os dados dos clientes.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Arquivo CSV
                </Label>
                <Input
                  type="file"
                  id="file"
                  className="col-span-3"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <>
                    Importando...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Importar"
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <FilePlus className="w-4 h-4 mr-2" />
              Adicionar Cliente
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Adicionar Novo Cliente</SheetTitle>
              <SheetDescription>
                Preencha o formulário abaixo para adicionar um novo cliente.
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome
                  </Label>
                  <Input id="nome" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input type="email" id="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefone" className="text-right">
                    Telefone
                  </Label>
                  <Input id="telefone" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vendedor" className="text-right">
                    Vendedor
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {gestores.map(gestor => (
                        <SelectItem key={gestor} value={gestor}>{gestor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button type="submit">Adicionar</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        siteStatusFilter={siteStatusFilter}
        setSiteStatusFilter={setSiteStatusFilter}
        showSiteStatusFilter={true}
        creativoFilter={creativoFilter}
        setCreativoFilter={setCreativoFilter}
        bmFilter={bmFilter}
        setBmFilter={setBmFilter}
        getStatusColor={getStatusColor}
      />

      <ResponsiveTableWrapper>
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                <Users className="w-6 h-6" />
                Clientes {selectedManager && `de ${selectedManager}`} ({filteredClientes.length})
              </CardTitle>
              <TableActions
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                onImportSales={handleImportSales}
                isImporting={isImporting}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                      {editingClienteId === cliente.id ? (
                        <Input
                          defaultValue={cliente.nome}
                          onChange={(e) => handleInputChange(cliente.id, 'nome', e.target.value)}
                        />
                      ) : (
                        cliente.nome
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId === cliente.id ? (
                        <Input
                          defaultValue={cliente.email}
                          onChange={(e) => handleInputChange(cliente.id, 'email', e.target.value)}
                        />
                      ) : (
                        <InputWithCopy value={cliente.email} />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId === cliente.id ? (
                        <Input
                          defaultValue={cliente.telefone}
                          onChange={(e) => handleInputChange(cliente.id, 'telefone', e.target.value)}
                        />
                      ) : (
                        cliente.telefone
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId === cliente.id ? (
                        <Select
                          defaultValue={cliente.vendedor}
                          onValueChange={(value) => handleInputChange(cliente.id, 'vendedor', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={cliente.vendedor} />
                          </SelectTrigger>
                          <SelectContent>
                            {gestores.map(gestor => (
                              <SelectItem key={gestor} value={gestor}>{gestor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        cliente.vendedor
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId !== cliente.id ? (
                        <StatusSelect
                          value={cliente.status_campanha as StatusCampanha}
                          onValueChange={(value) => handleStatusChange(cliente.id, value)}
                          getStatusColor={getStatusColor}
                          disabled={transferindoCliente === cliente.id}
                          isUpdating={transferindoCliente === cliente.id}
                          compact
                        />
                      ) : (
                        <Select
                          defaultValue={cliente.status_campanha}
                          onValueChange={(value) => handleInputChange(cliente.id, 'status_campanha', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={cliente.status_campanha} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cliente Novo">Cliente Novo</SelectItem>
                            <SelectItem value="Formulário">Formulário</SelectItem>
                            <SelectItem value="Brief">Brief</SelectItem>
                            <SelectItem value="Criativo">Criativo</SelectItem>
                            <SelectItem value="Site">Site</SelectItem>
                            <SelectItem value="Agendamento">Agendamento</SelectItem>
                            <SelectItem value="Configurando BM">Configurando BM</SelectItem>
                            <SelectItem value="Subindo Campanha">Subindo Campanha</SelectItem>
                            <SelectItem value="Otimização">Otimização</SelectItem>
                            <SelectItem value="Problema">Problema</SelectItem>
                            <SelectItem value="Cliente Sumiu">Cliente Sumiu</SelectItem>
                            <SelectItem value="Reembolso">Reembolso</SelectItem>
                            <SelectItem value="Saque Pendente">Saque Pendente</SelectItem>
                            <SelectItem value="Campanha Anual">Campanha Anual</SelectItem>
                            <SelectItem value="Urgente">Urgente</SelectItem>
                            <SelectItem value="Cliente Antigo">Cliente Antigo</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId !== cliente.id ? (
                        <SiteStatusSelect
                          value={cliente.site_status}
                          onValueChange={(value) => handleStatusChange(cliente.id, value)}
                          disabled={transferindoCliente === cliente.id}
                          isUpdating={transferindoCliente === cliente.id}
                          compact
                        />
                      ) : (
                        <Select
                          defaultValue={cliente.site_status}
                          onValueChange={(value) => handleInputChange(cliente.id, 'site_status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={cliente.site_status} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Não Pago">Não Pago</SelectItem>
                            <SelectItem value="Pago">Pago</SelectItem>
                            <SelectItem value="Pronto">Pronto</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClienteId === cliente.id ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveInlineEdit(cliente.id)}
                            disabled={transferindoCliente === cliente.id}
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInlineEdit(cliente.id)}
                            disabled={transferindoCliente === cliente.id}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingClienteId(cliente.id)}
                            disabled={transferindoCliente === cliente.id}
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação é irreversível. Tem certeza que deseja excluir este cliente?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ResponsiveTableWrapper>
    </div>
  )
}
