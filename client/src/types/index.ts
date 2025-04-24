import {
  Borrower,
  Loan as DbLoan,
  Payment as DbPayment,
  PaymentFrequency,
  LoanStatus
} from "@shared/schema";

// Re-export the types from the schema
export {
  PaymentFrequency,
  LoanStatus
};

// Frontend extension of Borrower type
export type Borrower = Borrower;

// Frontend extension of Loan type
export interface Loan extends Omit<DbLoan, 'borrowerId'> {
  borrowerId: string;
  borrowerName: string;
  paymentSchedule?: PaymentSchedule;
  paymentDay: number; // Add paymentDay to the frontend Loan type
}

// Frontend extension of Payment type
export interface Payment extends Omit<DbPayment, 'loanId'> {
  loanId: string;
}

// Payment Schedule type
export interface PaymentSchedule {
  frequency: PaymentFrequency;
  nextPaymentDate: string;
  installments: number;
  installmentAmount: number;
}

// Loan with Borrower and Payments - for detailed views
export interface LoanWithDetails extends Loan {
  borrower: Borrower;
  payments: Payment[];
}

// Loan Metrics for Dashboard
export interface LoanMetrics {
  totalLent: number;
  totalLentTrend: string;
  accruedInterest: number;
  accruedInterestTrend: string;
  overdueAmount: number;
  overdueAmountTrend: string;
  receivedThisMonth: number;
  receivedThisMonthTrend: string;
}

// Status Distribution for charts
export interface StatusDistribution {
  active: number;
  paid: number;
  overdue: number;
  defaulted: number;
}

// Settings type
export interface Settings {
  defaultInterestRate: number;
  defaultPaymentFrequency: PaymentFrequency;
  defaultInstallments: number;
  currency: string;
}

// CSV Import/Export types
export interface CsvLoan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principal: number;
  interestRate: number;
  issueDate: string;
  dueDate: string;
  status: string;
  frequency: string;
  nextPaymentDate: string;
  installments: number;
  installmentAmount: number;
  notes: string;
  paymentDay: number; // Add paymentDay to CsvLoan type
}

export interface CsvBorrower {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CsvPayment {
  id: string;
  loanId: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  notes: string;
}

export interface CsvData {
  loans: CsvLoan[];
  borrowers: CsvBorrower[];
  payments: CsvPayment[];
}
