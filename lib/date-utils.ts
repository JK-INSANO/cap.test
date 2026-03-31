
/**
 * Convierte una fecha de formato YYYY-MM-DD (input HTML) a DD.MM.YYYY (SAP)
 */
export function formatDateToDots(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

/**
 * Convierte una fecha de formato DD.MM.YYYY (SAP) a un objeto Date válido para Prisma
 */
export function parseDateFromDots(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Formatea una fecha ISO (de la BD) a DD-MM-YYYY para mostrar en tablas.
 * Previene el bug de timezone donde las fechas retroceden 1 día (UTC-3 vs UTC-0).
 */
export function formatISOToDisplay(isoDate: string): string {
  if (!isoDate) return ''
  const datePart = isoDate.split('T')[0]
  const [year, month, day] = datePart.split('-')
  return `${day}-${month}-${year}`
}

