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
  nome_campanha: z.string().min(2, {
    message: "Nome da campanha precisa ter pelo menos 2 caracteres.",
  }),
  publico_alvo: z.string().min(10, {
    message: "Público alvo precisa ter pelo menos 10 caracteres.",
  }),
  objetivo_campanha: z.string().min(10, {
    message: "Objetivo da campanha precisa ter pelo menos 10 caracteres.",
  }),
  canais_divulgacao: z.string().min(10, {
    message: "Canais de divulgação precisa ter pelo menos 10 caracteres.",
  }),
  diferenciais_produto: z.string().min(10, {
    message: "Diferenciais do produto precisa ter pelo menos 10 caracteres.",
  }),
  restricoes_campanha: z.string().optional(),
})

interface BriefingCliente {
  nome_campanha: string
  publico_alvo: string
  objetivo_campanha: string
  canais_divulgacao: string
  diferenciais_produto: string
  restricoes_campanha?: string | null
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

  const form = useForm<z.infer<typeof briefingFormSchema>>({
    resolver: zodResolver(briefingFormSchema),
    defaultValues: {
      nome_campanha: briefing?.nome_campanha || "",
      publico_alvo: briefing?.publico_alvo || "",
      objetivo_campanha: briefing?.objetivo_campanha || "",
      canais_divulgacao: briefing?.canais_divulgacao || "",
      diferenciais_produto: briefing?.diferenciais_produto || "",
      restricoes_campanha: briefing?.restricoes_campanha || "",
    },
  })

  useEffect(() => {
    if (briefing) {
      form.reset(briefing)
    }
  }, [briefing, form])

  async function onSubmit(values: z.infer<typeof briefingFormSchema>) {
    setIsSubmitting(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('briefings_clientes')
        .upsert({
          email_cliente: emailCliente,
          nome_campanha: values.nome_campanha,
          publico_alvo: values.publico_alvo,
          objetivo_campanha: values.objetivo_campanha,
          canais_divulgacao: values.canais_divulgacao,
          diferenciais_produto: values.diferenciais_produto,
          restricoes_campanha: values.restricoes_campanha,
        }, { onConflict: 'email_cliente' })

      if (error) {
        console.error("Erro ao salvar o briefing:", error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar.",
          description: "Ocorreu um erro ao salvar o briefing. Tente novamente.",
        })
      } else {
        toast({
          title: "Sucesso!",
          description: "Briefing salvo com sucesso.",
        })
        setSuccess(true)
        onBriefingUpdated()
      }
    } catch (error) {
      console.error("Erro inesperado ao salvar o briefing:", error)
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
            Briefing da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome_campanha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Campanha de Natal 2024" {...field} />
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
                        placeholder="Ex: Mulheres de 25 a 35 anos, interessadas em moda e beleza, residentes no Brasil."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="objetivo_campanha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo da Campanha</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Aumentar o reconhecimento da marca e gerar leads qualificados."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canais_divulgacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canais de Divulgação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Facebook, Instagram, Google Ads, e-mail marketing."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diferenciais_produto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diferenciais do Produto/Serviço</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Produto sustentável, alta qualidade, design exclusivo."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="restricoes_campanha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restrições da Campanha (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Não usar imagens de concorrentes, evitar horários de pico."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
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
