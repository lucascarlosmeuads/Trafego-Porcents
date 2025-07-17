import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  Mail,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IdeiaDetailModalProps {
  ideia: {
    id: string;
    email_cliente: string;
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
  };
  open: boolean;
  onClose: () => void;
}

export const IdeiaDetailModal = ({ ideia, open, onClose }: IdeiaDetailModalProps) => {
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const getPotencialColor = (potencial: string) => {
    switch (potencial?.toLowerCase()) {
      case 'alto': return 'bg-green-100 text-green-800 border-green-200';
      case 'médio': case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const atualizarStatus = async (novoStatus: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('ideias_negocio')
        .update({ status_analise: novoStatus })
        .eq('id', ideia.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Ideia marcada como ${novoStatus}`,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const insights = ideia.insights_ia || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {ideia.titulo_ideia || ideia.produto_servico}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com badges e info básica */}
          <div className="flex flex-wrap gap-3 items-center">
            <Badge className={getPotencialColor(ideia.potencial_mercado)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {ideia.potencial_mercado} Potencial
            </Badge>
            <Badge variant="outline">
              {ideia.categoria_negocio}
            </Badge>
            <Badge variant="secondary">
              {ideia.status_analise}
            </Badge>
            {insights.score_viabilidade && (
              <Badge variant="outline">
                Score: {insights.score_viabilidade}/10
              </Badge>
            )}
          </div>

          {/* Informações do cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email:</label>
                <p className="text-sm">{ideia.email_cliente}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Criação:</label>
                <p className="text-sm">
                  {format(new Date(ideia.created_at), 'dd/MM/yyyy - HH:mm', { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Descrição do projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Descrição do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{ideia.descricao_projeto}</p>
            </CardContent>
          </Card>

          {/* Grid de informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Público-alvo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Público-Alvo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ideia.publico_alvo || 'Não informado'}</p>
              </CardContent>
            </Card>

            {/* Investimento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Investimento Sugerido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600">
                  {ideia.investimento_sugerido ? 
                    `R$ ${ideia.investimento_sugerido.toLocaleString()}` : 
                    'Não informado'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dores identificadas */}
          {ideia.dores_identificadas && ideia.dores_identificadas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Dores Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ideia.dores_identificadas.map((dor, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {dor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Diferenciais */}
          {ideia.diferenciais && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Diferenciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ideia.diferenciais}</p>
              </CardContent>
            </Card>
          )}

          {/* Insights da IA */}
          {insights && Object.keys(insights).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Análise da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.resumo_executivo && (
                  <div>
                    <h4 className="font-medium mb-2">Resumo Executivo:</h4>
                    <p className="text-sm text-muted-foreground">{insights.resumo_executivo}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pontos fortes */}
                  {insights.pontos_fortes && insights.pontos_fortes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-700">Pontos Fortes:</h4>
                      <ul className="space-y-1">
                        {insights.pontos_fortes.map((ponto: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            {ponto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Desafios */}
                  {insights.desafios_potenciais && insights.desafios_potenciais.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-orange-700">Desafios Potenciais:</h4>
                      <ul className="space-y-1">
                        {insights.desafios_potenciais.map((desafio: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                            {desafio}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sugestões de melhorias */}
                {insights.sugestoes_melhorias && insights.sugestoes_melhorias.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-blue-700">Sugestões de Melhorias:</h4>
                    <ul className="space-y-1">
                      {insights.sugestoes_melhorias.map((sugestao: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                          {sugestao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ações de status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => atualizarStatus('aprovado')}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Ideia
                </Button>
                <Button
                  onClick={() => atualizarStatus('pendente')}
                  disabled={saving}
                  variant="outline"
                >
                  Marcar como Pendente
                </Button>
                <Button
                  onClick={() => atualizarStatus('rejeitado')}
                  disabled={saving}
                  variant="destructive"
                >
                  Rejeitar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};