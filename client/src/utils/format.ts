import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Format currency for display
 * @param value The number to format as currency
 * @param currency The currency code (default: BRL)
 */
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a date string to Brazilian format (dd/mm/yyyy)
 * @param dateString The ISO date string to format
 */
export function formatDate(dateString: string | Date | null): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'dd/MM/yyyy', { locale: pt });
}

/**
 * Format a percentage value
 * @param value The percentage value (e.g., 12 for 12%)
 */
export function formatPercent(value: number): string {
  return `${value}%`;
}

/**
 * Get initials from a name
 * @param name The full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Format a loan status for display
 * @param status The loan status
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Ativo',
    'paid': 'Pago',
    'overdue': 'Vencido',
    'defaulted': 'Inadimplente'
  };
  
  return statusMap[status] || status;
}

/**
 * Format a payment frequency for display
 * @param frequency The payment frequency
 */
export function formatFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    'weekly': 'Semanal',
    'biweekly': 'Quinzenal',
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'yearly': 'Anual',
    'custom': 'Personalizado'
  };
  
  return frequencyMap[frequency] || frequency;
}
