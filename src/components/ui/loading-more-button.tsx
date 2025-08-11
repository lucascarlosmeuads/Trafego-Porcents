import React from 'react';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

interface LoadingMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  className?: string;
}

export function LoadingMoreButton({ onClick, loading, hasMore, className }: LoadingMoreButtonProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Todos os leads foram carregados
      </div>
    );
  }

  return (
    <div className={`text-center py-4 ${className}`}>
      <Button
        onClick={onClick}
        disabled={loading}
        variant="outline"
        className="min-w-32"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          'Carregar mais leads'
        )}
      </Button>
    </div>
  );
}