import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IdeiaCardProps {
  ideia: {
    id: string;
    titulo_ideia: string;
    descricao_projeto: string;
    produto_servico: string;
    categoria_negocio: string;
    potencial_mercado: string;
    investimento_sugerido: number;
    status_analise: string;
    dores_identificadas: string[];
    created_at: string;
    insights_ia?: {
      score_viabilidade?: number;
    };
  };
  onClick: () => void;
}

export const IdeiaCard = ({ ideia, onClick }: IdeiaCardProps) => {
  const getPotencialColor = (potencial: string) => {
    switch (potencial?.toLowerCase()) {
      case 'alto': return 'bg-green-100 text-green-800 border-green-200';
      case 'médio': case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'analisado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const scoreViabilidade = ideia.insights_ia?.score_viabilidade || 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {ideia.titulo_ideia || ideia.produto_servico}
          </CardTitle>
          <Badge className={getStatusColor(ideia.status_analise)}>
            {ideia.status_analise}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {ideia.categoria_negocio && (
            <Badge variant="outline">
              {ideia.categoria_negocio}
            </Badge>
          )}
          {ideia.potencial_mercado && (
            <Badge className={getPotencialColor(ideia.potencial_mercado)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {ideia.potencial_mercado}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {ideia.descricao_projeto}
        </p>

        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-4 py-3 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Viabilidade</div>
            <div className="text-lg font-semibold text-primary">
              {scoreViabilidade > 0 ? `${scoreViabilidade}/10` : 'N/A'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Investimento</div>
            <div className="text-lg font-semibold text-green-600">
              {ideia.investimento_sugerido ? 
                `R$ ${ideia.investimento_sugerido.toLocaleString()}` : 
                'N/A'
              }
            </div>
          </div>
        </div>

        {/* Dores identificadas */}
        {ideia.dores_identificadas && ideia.dores_identificadas.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Principais Dores:</div>
            <div className="text-sm">
              {ideia.dores_identificadas.slice(0, 2).map((dor, index) => (
                <div key={index} className="text-xs text-muted-foreground truncate">
                  • {dor}
                </div>
              ))}
              {ideia.dores_identificadas.length > 2 && (
                <div className="text-xs text-primary">
                  +{ideia.dores_identificadas.length - 2} mais...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {format(new Date(ideia.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};