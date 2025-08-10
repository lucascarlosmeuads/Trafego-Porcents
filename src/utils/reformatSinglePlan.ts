import { supabase } from "@/integrations/supabase/client";

export async function reformatSinglePlan(emailCliente: string) {
  const { data, error } = await supabase.functions.invoke("reformat-single-plan", {
    body: { emailCliente },
  });

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error || "Falha ao formatar planejamento");
  }

  return data.planejamento as string;
}
