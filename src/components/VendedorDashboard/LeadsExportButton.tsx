import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useLeadsExport } from '@/hooks/useLeadsExport';

export function LeadsExportButton() {
  const { 
    isExporting, 
    exportableCount, 
    exportLeads, 
    refreshExportableCount 
  } = useLeadsExport();

  useEffect(() => {
    refreshExportableCount();
  }, [refreshExportableCount]);

  const handleExport = () => {
    if (exportableCount > 0) {
      exportLeads();
    }
  };

  const isDisabled = exportableCount === 0 || isExporting;

  return (
    <Button
      onClick={handleExport}
      disabled={isDisabled}
      variant={exportableCount > 0 ? "default" : "outline"}
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {exportableCount > 0 
            ? `Exportar Leads (${exportableCount})` 
            : 'Nenhum lead novo'
          }
        </>
      )}
    </Button>
  );
}