import { differenceInDays, addDays, addWeeks, addMonths, format, parse, isAfter } from 'date-fns';
import { Loan, Payment, PaymentFrequency, LoanStatus } from '../types';

/**
 * Calculate the total amount due for a loan (principal + interest)
 */
export function calculateTotalDue(loan: Loan | undefined): number {
  if (!loan) return 0;

  const principal = loan.principal;
  const rate = loan.interestRate / 100;

  // Calculate based on simple interest
  const interest = principal * rate;
  return principal + interest;
}

/**
 * Calculate the remaining balance on a loan after all payments
 */
export function calculateRemainingBalance(loan: Loan | undefined, payments: Payment[] = []): number {
  if (!loan) return 0;

  const totalDue = calculateTotalDue(loan);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return Math.max(0, totalDue - totalPaid);
}

/**
 * Calculate the principal balance remaining on a loan after all payments
 */
export function calculatePrincipalBalance(loan: Loan | undefined, payments: Payment[] = []): number {
  if (!loan) return 0;

  const principal = loan.principal;
  const principalPaid = payments.reduce((sum, payment) => sum + payment.principal, 0);

  return Math.max(0, principal - principalPaid);
}

/**
 * Check if a loan is overdue
 */
export function isLoanOverdue(loan: Loan | undefined): boolean {
  if (!loan) return false;
  if (loan.status === 'paid') return false;

  const today = new Date();

  // If there's a next payment date and it's in the past
  if (loan.nextPaymentDate && isAfter(today, new Date(loan.nextPaymentDate))) {
    return true;
  }

  // If the entire loan is past due date
  if (isAfter(today, new Date(loan.dueDate))) {
    return true;
  }

  return false;
}

/**
 * Get the number of days a loan is overdue
 */
export function getDaysOverdue(loan: Loan | undefined): number {
  if (!loan) return 0;
  if (loan.status === 'paid') return 0;

  const today = new Date();
  const checkDate = loan.nextPaymentDate
    ? new Date(loan.nextPaymentDate)
    : new Date(loan.dueDate);

  if (isAfter(today, checkDate)) {
    return differenceInDays(today, checkDate);
  }

  return 0;
}

/**
 * Distribute a payment between principal and interest (SIMPLE INTEREST)
 */
export function calculatePaymentDistribution(
  loan: Loan | undefined,
  paymentAmount: number,
  payments: Payment[] = []
): { principal: number; interest: number } {
  if (!loan) {
    return { principal: 0, interest: 0 };
  }

  // Calculate total interest due based on simple interest
  const principal = loan.principal;
  const rate = loan.interestRate / 100;
  const totalInterest = principal * rate;

  // Determine interest and principal portions
  let interestComponent = Math.min(paymentAmount, totalInterest); // Interest cannot exceed total interest
  let principalComponent = paymentAmount - interestComponent;

  return {
    interest: interestComponent,
    principal: principalComponent > 0 ? principalComponent : 0, // Principal cannot be negative
  };
}

/**
 * Determine the new loan status based on payment history
 */
export function determineNewLoanStatus(
  loan: Loan | undefined,
  payments: Payment[] = []
): LoanStatus {
  if (!loan) return 'active';

  // Check if fully paid
  const remainingBalance = calculateRemainingBalance(loan, payments);
  if (remainingBalance <= 0) {
    return 'paid';
  }

  // Check if defaulted (90+ days overdue)
  const daysOverdue = getDaysOverdue(loan);
  if (daysOverdue >= 90) {
    return 'defaulted';
  }

  // Check if overdue
  if (daysOverdue > 0) {
    return 'overdue';
  }

  // Otherwise active
  return 'active';
}

/**
 * Calculate the next payment date based on frequency
 */
export function calculateNextPaymentDate(
  currentDate: Date,
  paymentDay: number,
  frequency: PaymentFrequency
): Date {
  const nextDate = new Date(currentDate);
  nextDate.setDate(paymentDay);

  // Se a data calculada for anterior à data atual, avance para o próximo período
  if (nextDate < currentDate) {
    switch (frequency) {
      case 'weekly':
        return addWeeks(nextDate, 1);
      case 'biweekly':
        return addWeeks(nextDate, 2);
      case 'monthly':
        return addMonths(nextDate, 1);
      case 'quarterly':
        return addMonths(nextDate, 3);
      case 'yearly':
        return addMonths(nextDate, 12);
      case 'custom':
      default:
        return addMonths(nextDate, 1);
    }
  }

  return nextDate;
}

/**
 * Calculate installment amount based on loan terms
 */
export function calculateInstallmentAmount(loan: Loan | undefined): number {
  if (!loan) return 0;
  if (!loan.installments || loan.installments <= 0) return calculateTotalDue(loan);

  const totalDue = calculateTotalDue(loan);
  return totalDue / loan.installments;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
}
