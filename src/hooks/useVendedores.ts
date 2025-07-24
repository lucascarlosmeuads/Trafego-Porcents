import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Vendedor {
  nome: string
  email?: string
}

export function useVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        setLoading(true)
        
        // Buscar vendedores únicos da tabela todos_clientes
        const { data, error } = await supabase
          .from('todos_clientes')
          .select('vendedor')
          .not('vendedor', 'is', null)
          .neq('vendedor', '')
          .neq('vendedor', 'nao sei')
          .neq('vendedor', 'teste')
          .neq('vendedor', 'Produto Teste')
          .neq('vendedor', 'Sistema')
          .neq('vendedor', 'Usuário')
          .neq('vendedor', 'vendedor')

        if (error) {
          console.error('Erro ao buscar vendedores:', error)
          setError(error.message)
          return
        }

        // Extrair vendedores únicos e normalizar nomes
        const vendedoresUnicos = new Set<string>()
        
        data?.forEach(item => {
          if (item.vendedor) {
            // Normalizar nomes similares
            let nomeNormalizado = item.vendedor.trim()
            
            // Converter para formato padrão
            if (nomeNormalizado.toLowerCase() === 'edu') {
              nomeNormalizado = 'Edu'
            } else if (nomeNormalizado.toLowerCase() === 'itamar') {
              nomeNormalizado = 'Itamar'
            } else if (nomeNormalizado.toLowerCase() === 'kimberlly') {
              nomeNormalizado = 'Kimberlly'
            } else if (nomeNormalizado.toLowerCase() === 'leandrodrumzique') {
              nomeNormalizado = 'Leandrodrumzique'
            } else if (nomeNormalizado.toLowerCase() === 'rullian') {
              nomeNormalizado = 'Rullian'
            } else if (nomeNormalizado.toLowerCase() === 'lucas') {
              nomeNormalizado = 'Lucas'
            } else if (nomeNormalizado.toLowerCase() === 'joao') {
              nomeNormalizado = 'João'
            } else if (nomeNormalizado.toLowerCase() === 'izidoro') {
              nomeNormalizado = 'Izidoro'
            } else if (nomeNormalizado.toLowerCase().includes('junior')) {
              nomeNormalizado = 'Junior'
            }
            
            vendedoresUnicos.add(nomeNormalizado)
          }
        })

        // Converter para array de objetos e ordenar
        const vendedoresArray = Array.from(vendedoresUnicos)
          .sort()
          .map(nome => ({
            nome,
            email: `${nome.toLowerCase()}@trafegoporcents.com`
          }))

        setVendedores(vendedoresArray)
        setError(null)
      } catch (err) {
        console.error('Erro inesperado:', err)
        setError('Erro inesperado ao carregar vendedores')
      } finally {
        setLoading(false)
      }
    }

    fetchVendedores()
  }, [])

  return { vendedores, loading, error }
}