
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload, CheckCircle } from 'lucide-react'

const vendasManuais = [
  { "nome_cliente": "Edelson Lopes", "telefone": "55 11 99251-4042", "email_cliente": "Edinho.viega@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "SILNEY AZEVEDO", "telefone": "55 21 98658-5504", "email_cliente": "silney.a.ortlieb@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "TIAGO MARCONI", "telefone": "55 11 97544-7084", "email_cliente": "sucessomarconi@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Eliza", "telefone": "55 11 95053-3832", "email_cliente": "empreendedorismodigital0906@gmail.com", "vendedor": "Itamar" },
  { "nome_cliente": "Bruna Tolfo", "telefone": "55 51 9789-8492", "email_cliente": "btolfo@hotmail.com", "vendedor": "Itamar" },
  { "nome_cliente": "Moria Limp", "telefone": "55 64 9335-9170", "email_cliente": "rodrigoshego16@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Beatriz Peres", "telefone": "55 11 94964-8222", "email_cliente": "biiaoliveira1205@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Rennan Watrin", "telefone": "55 91 8447-4514", "email_cliente": "rennanwmesquita@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Vinicius Almeida", "telefone": "55 34 9194-8348", "email_cliente": "Valmeidarodriguesdasilva@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Placido Menezes", "telefone": "55 67 9810-3037", "email_cliente": "drplacido_menezes@hotmail.com", "vendedor": "EDU" },
  { "nome_cliente": "START ACADEMIA", "telefone": "55 17 99113-5546", "email_cliente": "julianabrito_3@outlook.com", "vendedor": "EDU" },
  { "nome_cliente": "Mario Galo", "telefone": "55 73 8107-3056", "email_cliente": "mario.galoooo@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Elizabete Halfeld", "telefone": "55 31 9731-1452", "email_cliente": "elizabetehalfeldestetica@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Francielly Pacheco", "telefone": "55 61 9828-8842", "email_cliente": "essence.esteticap@gmail.com", "vendedor": "EDU" },
  { "nome_cliente": "Bianca Marques", "telefone": "55 43 8832-8072", "email_cliente": "bao.designid@gmail.com", "vendedor": "Itamar" },
  { "nome_cliente": "Ana Intervenções Clínica de Terapias Integradas Ltda", "telefone": "(34) 3231-5820", "email_cliente": "abaintervencoesclinica@gmail.com", "vendedor": "Itamar" },
  { "nome_cliente": "Fernando Mayer", "telefone": "55 11 98844-1259", "email_cliente": "Fzanoni.fz@gmail.com", "vendedor": "Itamar" },
  { "nome_cliente": "Elionai Neri", "telefone": "55 87 9155-9221", "email_cliente": "elionai.oliveiraneri@gmail.com", "vendedor": "Itamar" }
]

export function ImportarVendasManuais() {
  const [isImporting, setIsImporting] = useState(false)
  const [importCompleted, setImportCompleted] = useState(false)
  const { toast } = useToast()

  const handleImportVendas = async () => {
    setIsImporting(true)
    
    try {
      console.log('🚀 Iniciando importação de 18 vendas manuais (26/05/2025)')
      
      // Preparar dados para inserção
      const clientesParaInserir = vendasManuais.map((venda, index) => {
        // Os 9 primeiros (índices 0-8) vão para Felipe, os 9 últimos (índices 9-17) para Gabriel
        const emailGestor = index < 9 
          ? 'felipealmeida@trafegoporcents.com' 
          : 'gabrielizodoro@trafegoporcents.com'
        
        return {
          created_at: '2025-05-26T12:00:00Z',
          nome_cliente: venda.nome_cliente,
          telefone: venda.telefone,
          email_cliente: venda.email_cliente,
          vendedor: venda.vendedor,
          email_gestor: emailGestor,
          status_campanha: 'Preenchimento do Formulário',
          status_envio: 'Enviado',
          comissao: '20',
          valor_comissao: 60.00,
          comissao_paga: false,
          site_status: 'pendente'
        }
      })

      console.log('📊 Dados preparados:', clientesParaInserir.length, 'clientes')
      console.log('👥 Divisão de gestores:')
      console.log('   - Felipe Almeida:', clientesParaInserir.slice(0, 9).length, 'clientes')
      console.log('   - Gabriel Izodoro:', clientesParaInserir.slice(9, 18).length, 'clientes')

      // Verificar clientes já existentes
      const emailsClientes = clientesParaInserir.map(c => c.email_cliente)
      const { data: existingClients } = await supabase
        .from('todos_clientes')
        .select('email_cliente')
        .in('email_cliente', emailsClientes)

      const existingEmails = existingClients?.map(c => c.email_cliente) || []
      const clientesNovos = clientesParaInserir.filter(c => !existingEmails.includes(c.email_cliente))

      if (existingEmails.length > 0) {
        console.log('⚠️ Clientes já existentes encontrados:', existingEmails.length)
        console.log('📋 Emails já existentes:', existingEmails)
      }

      if (clientesNovos.length === 0) {
        toast({
          title: "Nenhum cliente novo",
          description: "Todos os clientes da lista já estão cadastrados no sistema.",
          variant: "destructive"
        })
        return
      }

      // Inserir apenas clientes novos
      const { data, error } = await supabase
        .from('todos_clientes')
        .insert(clientesNovos)
        .select()

      if (error) {
        console.error('❌ Erro ao inserir clientes:', error)
        throw error
      }

      console.log('✅ Importação concluída com sucesso!')
      console.log('📈 Clientes inseridos:', data?.length || 0)
      console.log('🔄 Clientes já existentes:', existingEmails.length)

      setImportCompleted(true)
      
      toast({
        title: "Importação concluída!",
        description: `${clientesNovos.length} novos clientes foram importados. ${existingEmails.length} já existiam no sistema.`
      })

    } catch (error) {
      console.error('💥 Erro na importação:', error)
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar as vendas manuais. Verifique o console para mais detalhes.",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Vendas Manuais (26/05/2025)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Detalhes da Importação</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>18 clientes</strong> serão importados</li>
              <li>• <strong>Data:</strong> 26/05/2025 às 12:00</li>
              <li>• <strong>9 primeiros</strong> → Felipe Almeida</li>
              <li>• <strong>9 últimos</strong> → Gabriel Izodoro</li>
              <li>• <strong>Status:</strong> Preenchimento do Formulário</li>
              <li>• <strong>Comissão:</strong> R$ 60,00 cada</li>
            </ul>
          </div>

          {importCompleted ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Importação realizada com sucesso!</span>
            </div>
          ) : (
            <Button 
              onClick={handleImportVendas} 
              disabled={isImporting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isImporting ? 'Importando vendas...' : 'Executar Importação'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
