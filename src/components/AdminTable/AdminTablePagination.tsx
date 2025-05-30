
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface AdminTablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export function AdminTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  className
}: AdminTablePaginationProps) {
  // Gerar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se há poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica mais complexa para muitas páginas
      if (currentPage <= 3) {
        // Início: mostrar 1, 2, 3, 4, ..., última
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Fim: mostrar 1, ..., antepenúltima, penúltima, última
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Meio: mostrar 1, ..., atual-1, atual, atual+1, ..., última
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={className}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={onPrevious}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={onNext}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-center mt-2 text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  )
}
