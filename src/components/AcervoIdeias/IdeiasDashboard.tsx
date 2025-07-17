import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IdeiaCard } from "./IdeiaCard";
import { IdeiasFilters } from "./IdeiasFilters";
import { IdeiaDetailModal } from "./IdeiaDetailModal";
import { Lightbulb, TrendingUp, Search, RefreshCw } from "lucide-react";
import { LoadingFallback } from "@/components/LoadingFallback";

interface IdeiaItem {
  id: string;
  email_cliente: string;
  briefing_id: string;
  titulo_ideia: string;
  descricao_projeto: string;
  produto_servico: string;
  publico_alvo: string;
  dores_identificadas: string[];
  diferenciais: string;
  categoria_negocio: string;
  potencial_mercado: string;
  investimento_sugerido: number;
  status_analise: string;
  insights_ia: any;
  created_at: string;
  updated_at: string;
}

export const IdeiasDashboard = () => {
  const [ideias, setIdeias] = useState<IdeiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedIdeia, setSelectedIdeia] = useState<IdeiaItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchIdeias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideias_negocio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeias(data || []);
    } catch (error) {
      console.error('Erro ao buscar ideias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar acervo de ideias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processarBriefingsPendentes = async () => {
    try {
      setProcessing(true);
      
      // Buscar briefings que ainda não foram analisados
      const { data: briefings, error: briefingsError } = await supabase
        .from('briefings_cliente')
        .select(`
          id,
          email_cliente,
          nome_produto,
          created_at
        `)
        .not('id', 'in', `(${ideias.map(i => `'${i.briefing_id}'`).join(',') || "''"})`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (briefingsError) throw briefingsError;

      if (!briefings || briefings.length === 0) {
        toast({
          title: "Nenhum briefing novo",
          description: "Todos os briefings já foram processados",
        });
        return;
      }

      let processados = 0;
      for (const briefing of briefings) {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-business-idea', {
            body: { briefing_id: briefing.id }
          });

          if (error) throw error;
          if (data?.success) processados++;
          
        } catch (error) {
          console.error(`Erro ao processar briefing ${briefing.id}:`, error);
        }
      }

      toast({
        title: "Processamento concluído",
        description: `${processados} novas ideias foram analisadas e adicionadas ao acervo`,
      });

      fetchIdeias();
      
    } catch (error) {
      console.error('Erro ao processar briefings:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar briefings pendentes",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchIdeias();
  }, []);

  const filteredIdeias = ideias.filter(ideia => {
    const matchesSearch = 
      ideia.titulo_ideia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ideia.produto_servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ideia.descricao_projeto?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "todas" || ideia.categoria_negocio === selectedCategory;
    const matchesStatus = selectedStatus === "todos" || ideia.status_analise === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categorias = [...new Set(ideias.map(i => i.categoria_negocio).filter(Boolean))];
  const statusOptions = [...new Set(ideias.map(i => i.status_analise).filter(Boolean))];

  const stats = {
    total: ideias.length,
    analisadas: ideias.filter(i => i.status_analise === 'analisado').length,
    altoPotencial: ideias.filter(i => i.potencial_mercado === 'Alto').length,
    categoriasUnicas: categorias.length
  };

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
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analisadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analisadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Potencial</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stats.altoPotencial}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.altoPotencial}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriasUnicas}</div>
          </CardContent>
        </Card>
      </div>

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
              {categorias.map(categoria => (
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

        <Button 
          onClick={processarBriefingsPendentes}
          disabled={processing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
          {processing ? 'Processando...' : 'Processar Novos'}
        </Button>
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
          <h3 className="text-lg font-medium mb-2">Nenhuma ideia encontrada</h3>
          <p className="text-muted-foreground">
            {ideias.length === 0 
              ? "Clique em 'Processar Novos' para analisar briefings pendentes"
              : "Tente ajustar os filtros de busca"
            }
          </p>
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