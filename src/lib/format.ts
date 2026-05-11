import { format, parseISO } from 'date-fns'

export function formatMoney(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}k`
  }
  return `$${value.toLocaleString()}`
}

export function formatMoneyFull(value: number): string {
  return `$${value.toLocaleString()}`
}

export function formatDate(dateStr: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern)
  } catch {
    return dateStr
  }
}
