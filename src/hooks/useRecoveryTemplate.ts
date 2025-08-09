
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const DEFAULT_RECOVERY_TEMPLATE = 
  'Olá {{primeiro_nome}}! Tudo bem? Vi que você demonstrou interesse em melhorar suas vendas. Posso te enviar agora um plano rapidinho para você avaliar?';

type TemplateRecord = {
  id?: string;
  email_usuario: string;
  context: string;
  template_text: string;
  is_active: boolean;
};

export function useRecoveryTemplate(context: string = 'leads_parceria') {
  const { user } = useAuth();
  const [template, setTemplate] = useState<string>(DEFAULT_RECOVERY_TEMPLATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        setTemplate(DEFAULT_RECOVERY_TEMPLATE);
        return;
      }

      const { data, error } = await supabase
        .from('waseller_manual_templates')
        .select('id, email_usuario, context, template_text, is_active')
        .eq('email_usuario', user.email)
        .eq('context', context)
        .maybeSingle();

      if (error) throw error;

      if (data?.template_text) {
        setTemplate(data.template_text);
      } else {
        setTemplate(DEFAULT_RECOVERY_TEMPLATE);
      }
    } catch (e: any) {
      console.error('Erro ao carregar template de recuperação:', e);
      setError(e.message || 'Falha ao carregar template');
      setTemplate(DEFAULT_RECOVERY_TEMPLATE);
    } finally {
      setLoading(false);
    }
  }, [user?.email, context]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const saveTemplate = useCallback(async (newText: string) => {
    if (!user?.email) return;
    try {
      setSaving(true);
      setError(null);

      const record: TemplateRecord = {
        email_usuario: user.email,
        context,
        template_text: newText,
        is_active: true,
      };

      const { error } = await supabase
        .from('waseller_manual_templates')
        .upsert(record, { onConflict: 'email_usuario,context' });

      if (error) throw error;
      setTemplate(newText);
    } catch (e: any) {
      console.error('Erro ao salvar template de recuperação:', e);
      setError(e.message || 'Falha ao salvar template');
      throw e;
    } finally {
      setSaving(false);
    }
  }, [user?.email, context]);

  return {
    template,
    setTemplate,
    loading,
    saving,
    error,
    fetchTemplate,
    saveTemplate,
  };
}
