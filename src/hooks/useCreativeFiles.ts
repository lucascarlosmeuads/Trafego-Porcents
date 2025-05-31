
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCreativeFiles(emailCliente: string) {
  const [hasCreativeFiles, setHasCreativeFiles] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCreativeFiles = async () => {
      if (!emailCliente) {
        setHasCreativeFiles(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('arquivos_cliente')
          .select('id')
          .eq('email_cliente', emailCliente)
          .eq('author_type', 'gestor')
          .in('tipo_arquivo', ['image', 'video', 'pdf'])
          .limit(1)

        if (error) {
          console.error('Erro ao verificar arquivos criativos:', error)
          setHasCreativeFiles(false)
        } else {
          setHasCreativeFiles(data && data.length > 0)
        }
      } catch (error) {
        console.error('Erro ao verificar arquivos criativos:', error)
        setHasCreativeFiles(false)
      } finally {
        setLoading(false)
      }
    }

    checkCreativeFiles()
  }, [emailCliente])

  return { hasCreativeFiles, loading }
}
