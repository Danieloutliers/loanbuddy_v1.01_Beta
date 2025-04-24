import { addDays, format, subDays, addMonths } from 'date-fns';
import { Borrower, Loan, Payment, PaymentSchedule, PaymentFrequency, LoanStatus } from '../types';

// Helper to generate dates
const today = new Date();
const formatISODate = (date: Date) => date.toISOString();

// Generate Borrowers
export const borrowers: Borrower[] = [];

// Generate Loans
export const loans: Loan[] = [
  {
    id: '2',
    borrowerId: '2',
    borrowerName: 'Maria Oliveira',
    principal: 5000,
    interestRate: 10,
    issueDate: formatISODate(subDays(today, 90)),
    dueDate: formatISODate(addDays(today, 90)),
    status: 'active',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(addDays(today, 7)),
    installments: 6,
    installmentAmount: 875,
    notes: 'Empréstimo para curso de especialização',
    createdAt: formatISODate(subDays(today, 90)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(addDays(today, 7)),
      installments: 6,
      installmentAmount: 875
    }
  },
  {
    id: '3',
    borrowerId: '3',
    borrowerName: 'Pedro Santos',
    principal: 2500,
    interestRate: 8,
    issueDate: formatISODate(subDays(today, 45)),
    dueDate: formatISODate(addDays(today, 135)),
    status: 'active',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(addDays(today, 10)),
    installments: 6,
    installmentAmount: 433.33,
    notes: 'Empréstimo para compra de equipamentos',
    createdAt: formatISODate(subDays(today, 45)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(addDays(today, 10)),
      installments: 6,
      installmentAmount: 433.33
    }
  },
  {
    id: '4',
    borrowerId: '4',
    borrowerName: 'Ana Costa',
    principal: 8000,
    interestRate: 15,
    issueDate: formatISODate(subDays(today, 100)),
    dueDate: formatISODate(addDays(today, 80)),
    status: 'active',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(addDays(today, 14)),
    installments: 6,
    installmentAmount: 1400,
    notes: 'Empréstimo para início de negócio',
    createdAt: formatISODate(subDays(today, 100)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(addDays(today, 14)),
      installments: 6,
      installmentAmount: 1400
    }
  },
  {
    id: '5',
    borrowerId: '5',
    borrowerName: 'Ricardo Souza',
    principal: 5000,
    interestRate: 10,
    issueDate: formatISODate(subDays(today, 30)),
    dueDate: formatISODate(addDays(today, 150)),
    status: 'overdue',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(subDays(today, 15)),
    installments: 6,
    installmentAmount: 875,
    notes: 'Empréstimo para pagamento de dívidas',
    createdAt: formatISODate(subDays(today, 30)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(subDays(today, 15)),
      installments: 6,
      installmentAmount: 875
    }
  },
  {
    id: '6',
    borrowerId: '6',
    borrowerName: 'Juliana Ferreira',
    principal: 8500,
    interestRate: 12,
    issueDate: formatISODate(subDays(today, 70)),
    dueDate: formatISODate(addDays(today, 110)),
    status: 'overdue',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(subDays(today, 35)),
    installments: 6,
    installmentAmount: 1487.5,
    notes: 'Empréstimo para tratamento médico',
    createdAt: formatISODate(subDays(today, 70)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(subDays(today, 35)),
      installments: 6,
      installmentAmount: 1487.5
    }
  },
  {
    id: '7',
    borrowerId: '7',
    borrowerName: 'Paulo Cesar',
    principal: 12000,
    interestRate: 18,
    issueDate: formatISODate(subDays(today, 120)),
    dueDate: formatISODate(subDays(today, 30)),
    status: 'defaulted',
    frequency: 'monthly',
    nextPaymentDate: formatISODate(subDays(today, 95)),
    installments: 3,
    installmentAmount: 4240,
    notes: 'Empréstimo para compra de veículo',
    createdAt: formatISODate(subDays(today, 120)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(subDays(today, 95)),
      installments: 3,
      installmentAmount: 4240
    }
  },
  {
    id: '8',
    borrowerId: '1',
    borrowerName: 'João Silva',
    principal: 3000,
    interestRate: 8,
    issueDate: formatISODate(subDays(today, 180)),
    dueDate: formatISODate(subDays(today, 60)),
    status: 'paid',
    frequency: 'monthly',
    nextPaymentDate: null,
    installments: 4,
    installmentAmount: 787.5,
    notes: 'Empréstimo para viagem',
    createdAt: formatISODate(subDays(today, 180)),
    paymentSchedule: {
      frequency: 'monthly',
      nextPaymentDate: formatISODate(subDays(today, 60)),
      installments: 4,
      installmentAmount: 787.5
    }
  }
];

// Generate Payments
export const payments: Payment[] = [
  {
    id: '1',
    loanId: '1',
    date: formatISODate(subDays(today, 30)),
    amount: 1750,
    principal: 1650,
    interest: 100,
    notes: 'Primeira parcela',
    createdAt: formatISODate(subDays(today, 30))
  },
  {
    id: '2',
    loanId: '1',
    date: formatISODate(subDays(today, 1)),
    amount: 1750,
    principal: 1662.5,
    interest: 87.5,
    notes: 'Segunda parcela',
    createdAt: formatISODate(subDays(today, 1))
  },
  {
    id: '3',
    loanId: '2',
    date: formatISODate(subDays(today, 60)),
    amount: 875,
    principal: 833.33,
    interest: 41.67,
    notes: 'Primeira parcela',
    createdAt: formatISODate(subDays(today, 60))
  },
  {
    id: '4',
    loanId: '2',
    date: formatISODate(subDays(today, 30)),
    amount: 875,
    principal: 840.28,
    interest: 34.72,
    notes: 'Segunda parcela',
    createdAt: formatISODate(subDays(today, 30))
  },
  {
    id: '5',
    loanId: '3',
    date: formatISODate(subDays(today, 15)),
    amount: 433.33,
    principal: 416.67,
    interest: 16.66,
    notes: 'Primeira parcela',
    createdAt: formatISODate(subDays(today, 15))
  },
  {
    id: '6',
    loanId: '4',
    date: formatISODate(subDays(today, 70)),
    amount: 1400,
    principal: 1300,
    interest: 100,
    notes: 'Primeira parcela',
    createdAt: formatISODate(subDays(today, 70))
  },
  {
    id: '7',
    loanId: '4',
    date: formatISODate(subDays(today, 40)),
    amount: 1400,
    principal: 1325,
    interest: 75,
    notes: 'Segunda parcela',
    createdAt: formatISODate(subDays(today, 40))
  },
  {
    id: '8',
    loanId: '8',
    date: formatISODate(subDays(today, 150)),
    amount: 787.5,
    principal: 750,
    interest: 37.5,
    notes: 'Primeira parcela',
    createdAt: formatISODate(subDays(today, 150))
  },
  {
    id: '9',
    loanId: '8',
    date: formatISODate(subDays(today, 120)),
    amount: 787.5,
    principal: 756.25,
    interest: 31.25,
    notes: 'Segunda parcela',
    createdAt: formatISODate(subDays(today, 120))
  },
  {
    id: '10',
    loanId: '8',
    date: formatISODate(subDays(today, 90)),
    amount: 787.5,
    principal: 762.5,
    interest: 25,
    notes: 'Terceira parcela',
    createdAt: formatISODate(subDays(today, 90))
  },
  {
    id: '11',
    loanId: '8',
    date: formatISODate(subDays(today, 60)),
    amount: 787.5,
    principal: 768.75,
    interest: 18.75,
    notes: 'Quarta parcela',
    createdAt: formatISODate(subDays(today, 60))
  }
];

// App settings
export const defaultSettings = {
  defaultInterestRate: 12,
  defaultPaymentFrequency: 'monthly' as PaymentFrequency,
  defaultInstallments: 6,
  currency: 'BRL'
};
