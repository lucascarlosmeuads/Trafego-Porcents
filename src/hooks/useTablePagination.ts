
import { useState, useMemo } from 'react'

interface UseTablePaginationProps<T> {
  data: T[]
  initialItemsPerPage?: number
}

export function useTablePagination<T>({ data, initialItemsPerPage = 50 }: UseTablePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  // Memoize paginated data to avoid recalculation
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  // Reset to first page when data changes significantly
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  // Adjust current page if it's beyond the available pages
  const adjustedCurrentPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
      return totalPages
    }
    return currentPage
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    // Reset to first page when changing items per page
    setCurrentPage(1)
  }

  const resetPagination = () => {
    setCurrentPage(1)
  }

  return {
    currentPage: adjustedCurrentPage,
    itemsPerPage,
    totalItems: data.length,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination
  }
}
