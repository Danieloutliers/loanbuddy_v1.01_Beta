import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  Borrower,
  Loan,
  Payment,
  LoanWithDetails,
  LoanMetrics,
  StatusDistribution,
  Settings,
  CsvData,
  PaymentFrequency
} from '../types';
import {
  calculateRemainingBalance,
  calculatePrincipalBalance,
  determineNewLoanStatus,
  calculatePaymentDistribution,
  isLoanOverdue,
  getDaysOverdue
} from '../utils/loanCalculations';

import { format, parseISO, subMonths, isAfter, isBefore } from 'date-fns';

// Context type definition
interface LoanContextType {
  // Data
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  settings: Settings;

  // Borrower operations
  addBorrower: (borrower: Omit<Borrower, 'id' | 'createdAt'>) => Borrower;
  updateBorrower: (id: string, borrower: Partial<Borrower>) => Borrower;
  deleteBorrower: (id: string) => void;
  getBorrowerById: (id: string) => Borrower | undefined;

  // Loan operations
  addLoan: (loan: Omit<Loan, 'id' | 'status' | 'createdAt'>) => Loan;
  updateLoan: (id: string, loan: Partial<Loan>) => Loan;
  deleteLoan: (id: string) => void;
  getLoanById: (id: string) => Loan | undefined;
  getLoanWithDetails: (id: string) => LoanWithDetails | undefined;
  getLoansByBorrowerId: (borrowerId: string) => Loan[];
  getOverdueLoans: () => Loan[];
  getUpcomingDueLoans: (days: number) => Loan[];

  // Payment operations
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  updatePayment: (id: string, payment: Partial<Payment>) => Payment;
  deletePayment: (id: string) => void;
  getPaymentsByLoanId: (loanId: string) => Payment[];

  // Calculations
  calculateLoanMetrics: () => LoanMetrics;
  calculateStatusDistribution: () => StatusDistribution;

  // Import/Export
  exportData: () => CsvData;
  importData: (data: CsvData) => void;

  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
}

// Create context with default undefined value
const LoanContext = createContext<LoanContextType | undefined>(undefined);

// Provider props
interface LoanProviderProps {
  children: ReactNode;
}

// Default settings (can be moved to a separate config file if needed)
const initialSettings: Settings = {
  defaultInterestRate: 12,
  defaultPaymentFrequency: 'monthly' as PaymentFrequency,
  defaultInstallments: 6,
  currency: 'BRL'
};


// Provider component
export const LoanProvider: React.FC<LoanProviderProps> = ({ children }) => {
  // State for all data - Initialize with empty arrays
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings); // Use initial settings

  // Generate ID (simply increment for mock data)
  const generateId = (prefix: string, collection: { id: string }[]): string => {
    const ids = collection.map(item => parseInt(item.id)).filter(id => !isNaN(id)); // Filter out non-numeric IDs
    const maxId = Math.max(...ids, 0);
    return (maxId + 1).toString();
  };

  // Update loan status based on payments and dates
  const updateLoanStatuses = () => {
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        // Skip if already paid
        if (loan.status === 'paid') return loan;

        const loanPayments = payments.filter(p => p.loanId === loan.id);
        const newStatus = determineNewLoanStatus(loan, loanPayments);

        // Only update if status has changed
        if (newStatus !== loan.status) {
          return { ...loan, status: newStatus };
        }

        return loan;
      })
    );
  };

  // Run status update on initial load and whenever payments change
  useEffect(() => {
    updateLoanStatuses();
  }, [payments]);

  // Borrower operations
  const addBorrower = (borrowerData: Omit<Borrower, 'id' | 'createdAt'>): Borrower => {
    const id = generateId('b', borrowers);
    const newBorrower: Borrower = {
      ...borrowerData,
      id,
      createdAt: new Date().toISOString()
    };

    setBorrowers(prev => [...prev, newBorrower]);
    return newBorrower;
  };

  const updateBorrower = (id: string, borrowerData: Partial<Borrower>): Borrower => {
    let updatedBorrower: Borrower | undefined;

    setBorrowers(prev =>
      prev.map(borrower => {
        if (borrower.id === id) {
          updatedBorrower = { ...borrower, ...borrowerData };
          return updatedBorrower;
        }
        return borrower;
      })
    );

    if (!updatedBorrower) {
      throw new Error(`Borrower with ID ${id} not found`);
    }

    // Update borrower name in all associated loans
    if (borrowerData.name) {
      setLoans(prev =>
        prev.map(loan => {
          if (loan.borrowerId === id) {
            return { ...loan, borrowerName: borrowerData.name as string };
          }
          return loan;
        })
      );
    }

    return updatedBorrower;
  };

  const deleteBorrower = (id: string): void => {
    // Check if borrower has any active loans
    const activeLoans = loans.filter(loan =>
      loan.borrowerId === id && loan.status !== 'paid'
    );

    if (activeLoans.length > 0) {
      throw new Error('Não é possível excluir um mutuário com empréstimos ativos');
    }

    setBorrowers(prev => prev.filter(borrower => borrower.id !== id));

    // Also delete all associated loans and payments
    const borrowerLoans = loans.filter(loan => loan.borrowerId === id);
    const loanIds = borrowerLoans.map(loan => loan.id);

    setLoans(prev => prev.filter(loan => !loanIds.includes(loan.id)));
    setPayments(prev => prev.filter(payment => !loanIds.includes(payment.loanId)));
  };

  const getBorrowerById = (id: string): Borrower | undefined => {
    return borrowers.find(borrower => borrower.id === id);
  };

  // Loan operations
  const addLoan = (loanData: Omit<Loan, 'id' | 'status' | 'createdAt'>): Loan => {
    const id = generateId('l', loans);
    const borrower = getBorrowerById(loanData.borrowerId);

    if (!borrower) {
      throw new Error(`Borrower with ID ${loanData.borrowerId} not found`);
    }

    const newLoan: Loan = {
      ...loanData,
      id,
      borrowerName: borrower.name,
      status: 'active', // New loans start as active
      createdAt: new Date().toISOString()
    };

    setLoans(prev => [...prev, newLoan]);
    return newLoan;
  };

  const updateLoan = (id: string, loanData: Partial<Loan>): Loan => {
    let updatedLoan: Loan | undefined;

    setLoans(prev =>
      prev.map(loan => {
        if (loan.id === id) {
          // If borrower is changing, update borrower name
          let borrowerName = loan.borrowerName;
          if (loanData.borrowerId && loanData.borrowerId !== loan.borrowerId) {
            const borrower = getBorrowerById(loanData.borrowerId);
            if (!borrower) {
              throw new Error(`Borrower with ID ${loanData.borrowerId} not found`);
            }
            borrowerName = borrower.name;
          }

          updatedLoan = {
            ...loan,
            ...loanData,
            borrowerName: loanData.borrowerName || borrowerName
          };
          return updatedLoan;
        }
        return loan;
      })
    );

    if (!updatedLoan) {
      throw new Error(`Loan with ID ${id} not found`);
    }

    return updatedLoan;
  };

  const deleteLoan = (id: string): void => {
    setLoans(prev => prev.filter(loan => loan.id !== id));

    // Also delete all associated payments
    setPayments(prev => prev.filter(payment => payment.loanId !== id));
  };

  const getLoanById = (id: string): Loan | undefined => {
    return loans.find(loan => loan.id === id);
  };

  const getLoanWithDetails = (id: string): LoanWithDetails | undefined => {
    const loan = getLoanById(id);
    if (!loan) return undefined;

    const borrower = getBorrowerById(loan.borrowerId);
    const loanPayments = getPaymentsByLoanId(id);

    // Mesmo se o mutuário não for encontrado, retornamos o empréstimo com os detalhes disponíveis
    return {
      ...loan,
      borrower: borrower || {
        id: loan.borrowerId,
        name: 'Mutuário não encontrado',
        email: '',
        phone: '',
        createdAt: new Date().toISOString(),
      },
      payments: loanPayments
    };
  };

  const getLoansByBorrowerId = (borrowerId: string): Loan[] => {
    return loans.filter(loan => loan.borrowerId === borrowerId);
  };

  const getOverdueLoans = (): Loan[] => {
    return loans.filter(loan =>
      loan.status === 'overdue' || loan.status === 'defaulted'
    );
  };

  const getUpcomingDueLoans = (days: number = 15): Loan[] => {
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + days);

    return loans
      .filter(loan => {
        if (loan.status !== 'active') return false;

        const nextPaymentDate = loan.nextPaymentDate
          ? new Date(loan.nextPaymentDate)
          : null;

        return nextPaymentDate &&
          isAfter(nextPaymentDate, today) &&
          isBefore(nextPaymentDate, cutoff);
      })
      .sort((a, b) => {
        const dateA = new Date(a.nextPaymentDate || a.dueDate);
        const dateB = new Date(b.nextPaymentDate || b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Payment operations
  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const id = generateId('p', payments);
    const loan = getLoanById(paymentData.loanId);

    if (!loan) {
      throw new Error(`Loan with ID ${paymentData.loanId} not found`);
    }

    // If principal and interest are not provided, calculate them
    let { principal, interest } = paymentData;
    if (principal === undefined || interest === undefined) {
      const loanPayments = getPaymentsByLoanId(paymentData.loanId);
      const distribution = calculatePaymentDistribution(loan, paymentData.amount, loanPayments);
      principal = distribution.principal;
      interest = distribution.interest;
    }

    const newPayment: Payment = {
      ...paymentData,
      principal,
      interest,
      id,
      createdAt: new Date().toISOString()
    };

    setPayments(prev => [...prev, newPayment]);

    // Update loan status after payment
    updateLoanStatuses();

    return newPayment;
  };

  const updatePayment = (id: string, paymentData: Partial<Payment>): Payment => {
    let updatedPayment: Payment | undefined;

    setPayments(prev =>
      prev.map(payment => {
        if (payment.id === id) {
          updatedPayment = { ...payment, ...paymentData };
          return updatedPayment;
        }
        return payment;
      })
    );

    if (!updatedPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }

    // Update loan status after payment modification
    updateLoanStatuses();

    return updatedPayment;
  };

  const deletePayment = (id: string): void => {
    setPayments(prev => prev.filter(payment => payment.id !== id));

    // Update loan status after payment deletion
    updateLoanStatuses();
  };

  const getPaymentsByLoanId = (loanId: string): Payment[] => {
    return payments
      .filter(payment => payment.loanId === loanId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculation methods
  const calculateLoanMetrics = (): LoanMetrics => {
    // Calculate total principal lent
    const totalLent = loans.reduce((sum, loan) => sum + loan.principal, 0);

    // Calculate total interest accrued
    const totalInterest = payments.reduce((sum, payment) => sum + payment.interest, 0);

    // Calculate overdue amount
    const overdueLoans = loans.filter(loan =>
      loan.status === 'overdue' || loan.status === 'defaulted'
    );

    const overdueAmount = overdueLoans.reduce((sum, loan) => {
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const remaining = calculateRemainingBalance(loan, loanPayments);
      return sum + remaining;
    }, 0);

    // Calculate received this month
    const oneMonthAgo = subMonths(new Date(), 1);
    const receivedThisMonth = payments
      .filter(payment => isAfter(new Date(payment.date), oneMonthAgo))
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Mock trend calculations (would be more complex in a real app)
    const totalLentTrend = "5,2% este mês";
    const accruedInterestTrend = "3,1% este mês";
    const overdueAmountTrend = "2,5% este mês";
    const receivedThisMonthTrend = "7,8% vs mês anterior";

    return {
      totalLent,
      accruedInterest: totalInterest,
      overdueAmount,
      receivedThisMonth,
      totalLentTrend,
      accruedInterestTrend,
      overdueAmountTrend,
      receivedThisMonthTrend
    };
  };

  const calculateStatusDistribution = (): StatusDistribution => {
    const statusCounts = loans.reduce(
      (counts, loan) => {
        counts[loan.status as keyof StatusDistribution]++;
        return counts;
      },
      { active: 0, paid: 0, overdue: 0, defaulted: 0 }
    );

    return statusCounts;
  };

  // Import/Export
  const exportData = (): CsvData => {
    return {
      loans: loans.map(loan => ({
        id: loan.id,
        borrowerId: loan.borrowerId,
        borrowerName: loan.borrowerName,
        principal: loan.principal,
        interestRate: loan.interestRate,
        issueDate: loan.issueDate,
        dueDate: loan.dueDate,
        status: loan.status,
        frequency: loan.frequency,
        nextPaymentDate: loan.nextPaymentDate || '',
        installments: loan.installments || 0,
        installmentAmount: loan.installmentAmount || 0,
        notes: loan.notes || '',
        paymentDay: loan.paymentDay // Include paymentDay in export
      })),
      borrowers: borrowers.map(borrower => ({
        id: borrower.id,
        name: borrower.name,
        email: borrower.email || '',
        phone: borrower.phone || ''
      })),
      payments: payments.map(payment => ({
        id: payment.id,
        loanId: payment.loanId,
        date: payment.date,
        amount: payment.amount,
        principal: payment.principal,
        interest: payment.interest,
        notes: payment.notes || ''
      }))
    };
  };

  const importData = (data: CsvData): void => {
    // Import in order: borrowers -> loans -> payments
    setBorrowers(data.borrowers.map(b => ({
      ...b,
      createdAt: b.createdAt || new Date().toISOString()
    })));

    setLoans(data.loans.map(l => ({
      ...l,
      createdAt: l.createdAt || new Date().toISOString(),
      paymentDay: l.paymentDay || 1 // Handle missing paymentDay with a default
    })));

    setPayments(data.payments.map(p => ({
      ...p,
      createdAt: p.createdAt || new Date().toISOString()
    })));
  };

  // Settings
  const updateSettings = (newSettings: Partial<Settings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Context value
  const value: LoanContextType = {
    borrowers,
    loans,
    payments,
    settings,

    addBorrower,
    updateBorrower,
    deleteBorrower,
    getBorrowerById,

    addLoan,
    updateLoan,
    deleteLoan,
    getLoanById,
    getLoanWithDetails,
    getLoansByBorrowerId,
    getOverdueLoans,
    getUpcomingDueLoans,

    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByLoanId,

    calculateLoanMetrics,
    calculateStatusDistribution,

    exportData,
    importData,

    updateSettings
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

// Custom hook to use the loan context
export const useLoanContext = () => {
  const context = useContext(LoanContext);

  if (context === undefined) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }

  return context;
};
