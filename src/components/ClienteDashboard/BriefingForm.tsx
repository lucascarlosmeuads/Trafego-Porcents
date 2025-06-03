
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const briefingFormSchema = z.object({
  nome_produto: z.string().min(2, {
    message: "Nome do produto precisa ter pelo menos 2 caracteres.",
  }),
  publico_alvo: z.string().min(10, {
    message: "Público alvo precisa ter pelo menos 10 caracteres.",
  }),
  descricao_resumida: z.string().min(10, {
    message: "Descrição resumida precisa ter pelo menos 10 caracteres.",
  }),
  diferencial: z.string().min(10, {
    message: "Diferencial do produto precisa ter pelo menos 10 caracteres.",
  }),
  investimento_diario: z.number().min(0.01, {
    message: "Investimento diário deve ser maior que R$ 0,01.",
  }),
  observacoes_finais: z.string().optional(),
  comissao_aceita: z.enum(['sim', 'nao']).optional(),
})

interface BriefingCliente {
  nome_produto: string
  publico_alvo: string
  descricao_resumida: string
  diferencial: string
  investimento_diario: number
  observacoes_finais?: string | null
  comissao_aceita?: string | null
}

interface BriefingFormProps {
  briefing?: BriefingCliente | null
  emailCliente: string
  onBriefingUpdated: () => void
  onBack?: () => void
}

export function BriefingForm({ briefing, emailCliente, onBriefingUpdated, onBack }: BriefingFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  console.log('🔍 [BriefingForm] === DEBUGGING BRIEFING FORM ===')
  console.log('📧 [BriefingForm] Email do cliente:', emailCliente)
  console.log('📋 [BriefingForm] Briefing recebido:', briefing)

  const form = useForm<z.infer<typeof briefingFormSchema>>({
    resolver: zodResolver(briefingFormSchema),
    defaultValues: {
      nome_produto: briefing?.nome_produto || "",
      publico_alvo: briefing?.publico_alvo || "",
      descricao_resumida: briefing?.descricao_resumida || "",
      diferencial: briefing?.diferencial || "",
      investimento_diario: briefing?.investimento_diario || 0,
      observacoes_finais: briefing?.observacoes_finais || "",
      comissao_aceita: briefing?.comissao_aceita as 'sim' | 'nao' || undefined,
    },
  })

  useEffect(() => {
    if (briefing) {
      console.log('🔄 [BriefingForm] Resetando formulário com dados do briefing')
      form.reset({
        nome_produto: briefing.nome_produto || "",
        publico_alvo: briefing.publico_alvo || "",
        descricao_resumida: briefing.descricao_resumida || "",
        diferencial: briefing.diferencial || "",
        investimento_diario: briefing.investimento_diario || 0,
        observacoes_finais: briefing.observacoes_finais || "",
        comissao_aceita: briefing.comissao_aceita as 'sim' | 'nao' || undefined,
      })
    }
  }, [briefing, form])

  async function onSubmit(values: z.infer<typeof briefingFormSchema>) {
    setIsSubmitting(true)
    setSuccess(false)

    console.log('🚀 [BriefingForm] === INICIANDO SALVAMENTO ===')
    console.log('📧 [BriefingForm] Email cliente:', emailCliente)
    console.log('📝 [BriefingForm] Dados do formulário:', values)

    try {
      const briefingData = {
        email_cliente: emailCliente.trim().toLowerCase(),
        nome_produto: values.nome_produto.trim(),
        publico_alvo: values.publico_alvo.trim(),
        descricao_resumida: values.descricao_resumida.trim(),
        diferencial: values.diferencial.trim(),
        investimento_diario: values.investimento_diario,
        observacoes_finais: values.observacoes_finais?.trim() || null,
        comissao_aceita: values.comissao_aceita || null,
      }

      console.log('💾 [BriefingForm] Dados preparados para salvar:', briefingData)

      const { data, error } = await supabase
        .from('briefings_cliente')
        .upsert(briefingData, { 
          onConflict: 'email_cliente',
          ignoreDuplicates: false 
        })
        .select()

      console.log('📤 [BriefingForm] Resposta do upsert:', { data, error })

      if (error) {
        console.error("❌ [BriefingForm] Erro ao salvar o briefing:", error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar.",
          description: `Ocorreu um erro ao salvar o briefing: ${error.message}`,
        })
        return
      }

      console.log('✅ [BriefingForm] Briefing salvo com sucesso!')
      
      toast({
        title: "Sucesso!",
        description: "Briefing salvo com sucesso.",
      })
      
      setSuccess(true)
      onBriefingUpdated()

    } catch (error) {
      console.error("💥 [BriefingForm] Erro inesperado ao salvar o briefing:", error)
      toast({
        variant: "destructive",
        title: "Erro Inesperado.",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botão de voltar para desktop */}
      {onBack && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : null}
            Briefing do Produto/Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome_produto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto/Serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Curso de Marketing Digital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="publico_alvo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Público Alvo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Empreendedores de 25 a 45 anos, interessados em marketing digital e vendas online, residentes no Brasil."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao_resumida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Resumida do Produto/Serviço</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Curso completo de marketing digital com mais de 50 aulas, certificado e suporte personalizado."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="diferencial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diferencial do Produto/Serviço</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Único curso que oferece mentorias 1:1 semanais, metodologia testada por mais de 1000 alunos."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investimento_diario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investimento Diário (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Ex: 50.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comissao_aceita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aceita trabalhar por comissão?</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="observacoes_finais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Finais (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Informações adicionais que considera importante para a campanha."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Salvar Briefing"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Botão de voltar para mobile */}
      {onBack && (
        <div className="md:hidden pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel Principal
          </Button>
        </div>
      )}
    </div>
  )
}
