
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'

interface TablePaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

export function TablePagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const paginationInfo = useMemo(() => {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)
    return { startItem, endItem }
  }, [currentPage, itemsPerPage, totalItems])

  if (totalItems === 0) {
    return null
  }

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Itens por página:</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            const newItemsPerPage = parseInt(value)
            onItemsPerPageChange(newItemsPerPage)
            // Adjust current page if necessary
            const newTotalPages = Math.ceil(totalItems / newItemsPerPage)
            if (currentPage > newTotalPages) {
              onPageChange(newTotalPages)
            }
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination info */}
      <div className="text-sm text-muted-foreground">
        Mostrando {paginationInfo.startItem} a {paginationInfo.endItem} de {totalItems} cliente{totalItems !== 1 ? 's' : ''}
      </div>

      {/* Pagination controls */}
      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              className="gap-1"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Primeira</span>
            </Button>
          </PaginationItem>
          
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
          </PaginationItem>

          {/* Page numbers - show current and adjacent pages */}
          {totalPages <= 7 ? (
            // Show all pages if 7 or fewer
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              </PaginationItem>
            ))
          ) : (
            // Show truncated pagination for many pages
            <>
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>1</Button>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                </>
              )}
              
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => {
                  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
                  return startPage + i
                }
              ).filter(page => page <= totalPages).map((page) => (
                <PaginationItem key={page}>
                  <Button
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
                      {totalPages}
                    </Button>
                  </PaginationItem>
                </>
              )}
            </>
          )}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
          
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">Última</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
