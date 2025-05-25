
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminTable } from './AdminTable'
import { GestoresManagement } from './GestoresManagement'
import { SolicitacoesSaque } from './SolicitacoesSaque'
import { ProblemasPanel } from './ProblemasPanel'
import { CriarContasClientes } from './CriarContasClientes'

export function AdminDashboard() {
  const { currentManagerName } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Bem-vindo, {currentManagerName}</p>
        </div>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="clientes">👥 Clientes</TabsTrigger>
          <TabsTrigger value="gestores">👨‍💼 Gestores</TabsTrigger>
          <TabsTrigger value="saques">💰 Saques</TabsTrigger>
          <TabsTrigger value="problemas">⚠️ Problemas</TabsTrigger>
          <TabsTrigger value="contas">🔑 Criar Contas</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-6">
          <AdminTable />
        </TabsContent>

        <TabsContent value="gestores" className="space-y-6">
          <GestoresManagement />
        </TabsContent>

        <TabsContent value="saques" className="space-y-6">
          <SolicitacoesSaque />
        </TabsContent>

        <TabsContent value="problemas" className="space-y-6">
          <ProblemasPanel />
        </TabsContent>

        <TabsContent value="contas" className="space-y-6">
          <CriarContasClientes />
        </TabsContent>
      </Tabs>
    </div>
  )
}
