
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}

// NEW: Specific loading fallbacks for different sections
export function MetricsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableLoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-12 bg-muted rounded animate-pulse"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
      ))}
    </div>
  )
}
