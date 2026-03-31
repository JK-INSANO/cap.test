'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const PAGE_SIZE = 10

interface TablePaginationProps {
  total: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Controles de paginación server-side: Anterior / Página X de Y / Siguiente
 */
export function TablePaginationControls({
  total,
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  if (total <= PAGE_SIZE) return null

  return (
    <div className="flex items-center justify-between pt-4 border-t mt-4">
      <p className="text-sm text-muted-foreground">
        {total} registro{total !== 1 ? 's' : ''} en total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
