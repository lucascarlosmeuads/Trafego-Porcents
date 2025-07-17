import { useState } from "react";
import { useAcervoIdeias } from "@/hooks/useAcervoIdeias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Progress será substituído por uma barra simples
import { IdeiaCard } from "./IdeiaCard";
import { IdeiaDetailModal } from "./IdeiaDetailModal";
import { Lightbulb, TrendingUp, Search, RefreshCw, Zap, Database } from "lucide-react";
import { LoadingFallback } from "@/components/LoadingFallback";

export const AcervoIdeasDashboard = () => {
  const { 
    ideias, 
    loading, 
    processing, 
    stats, 
    processarBriefingsPendentes, 
    processarTodosBriefings,
    atualizarStatusIdeia 
  } = useAcervoIdeias();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedIdeia, setSelectedIdeia] = useState<any>(null);
  const [progressoTotal, setProgressoTotal] = useState({ atual: 0, total: 0 });

  const handleProcessarTodos = async () => {
    await processarTodosBriefings((atual, total) => {
      setProgressoTotal({ atual, total });
    });
    setProgressoTotal({ atual: 0, total: 0 });
  };

  const filteredIdeias = ideias.filter(ideia => {
    const matchesSearch = 
      ideia.titulo_ideia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ideia.produto_servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ideia.descricao_projeto?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "todas" || ideia.categoria_negocio === selectedCategory;
    const matchesStatus = selectedStatus === "todos" || ideia.status_analise === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusOptions = ["pendente", "analisado", "aprovado", "rejeitado"];

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ideias</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.categorias.length} categorias diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analisadas pela IA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analisadas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Potencial</CardTitle>
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.altoPotencial}
            </div>
            <p className="text-xs text-muted-foreground">
              Ideias promissoras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.aprovadas}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.aprovadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Prontas para execução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar durante processamento */}
      {processing && progressoTotal.total > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-sm">Processando Briefings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(progressoTotal.atual / progressoTotal.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {progressoTotal.atual} de {progressoTotal.total} briefings processados
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles e filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar ideias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {stats.categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => processarBriefingsPendentes()}
            disabled={processing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processando...' : 'Processar Lote'}
          </Button>

          <Button 
            onClick={handleProcessarTodos}
            disabled={processing}
            variant="default"
            size="sm"
          >
            <Zap className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processando Todos...' : 'Processar Todos os Briefings'}
          </Button>
        </div>
      </div>

      {/* Grid de ideias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeias.map((ideia) => (
          <IdeiaCard
            key={ideia.id}
            ideia={ideia}
            onClick={() => setSelectedIdeia(ideia)}
          />
        ))}
      </div>

      {filteredIdeias.length === 0 && (
        <Card className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {ideias.length === 0 ? "Nenhuma ideia encontrada" : "Nenhuma ideia correspondente"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {ideias.length === 0 
              ? "Clique em 'Processar Todos os Briefings' para analisar todos os formulários pendentes"
              : "Tente ajustar os filtros de busca"
            }
          </p>
          {ideias.length === 0 && (
            <Button 
              onClick={handleProcessarTodos}
              disabled={processing}
              className="mt-2"
            >
              <Zap className="h-4 w-4 mr-2" />
              Processar Todos os Briefings
            </Button>
          )}
        </Card>
      )}

      {/* Modal de detalhes */}
      {selectedIdeia && (
        <IdeiaDetailModal
          ideia={selectedIdeia}
          open={!!selectedIdeia}
          onClose={() => setSelectedIdeia(null)}
        />
      )}
    </div>
  );
};