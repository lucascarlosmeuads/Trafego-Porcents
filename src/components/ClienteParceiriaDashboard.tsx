import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClienteParceiraData } from '@/hooks/useClienteParceiraData';
import { ClienteParceiraDetalhes } from '@/components/ClienteDashboard/ClienteParceiraDetalhes';
import { AlertCircle, Clock } from 'lucide-react';

export default function ClienteParceiriaDashboard() {
  const { user } = useAuth();
  const { dadosConsolidados, loading, error } = useClienteParceiraData(user?.email || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!dadosConsolidados) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Dados não encontrados</h1>
          <p className="text-gray-600">Não foi possível encontrar seus dados de parceria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClienteParceiraDetalhes 
        formulario={null} 
        dadosConsolidados={dadosConsolidados} 
      />
    </div>
  );
}