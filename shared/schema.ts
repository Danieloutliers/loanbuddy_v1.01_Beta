import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Borrowers table
export const borrowers = pgTable("borrowers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBorrowerSchema = createInsertSchema(borrowers).omit({
  id: true,
  createdAt: true,
});

export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type Borrower = typeof borrowers.$inferSelect;

// Loan status enum
export const loanStatusSchema = z.enum(['active', 'paid', 'overdue', 'defaulted']);
export type LoanStatus = z.infer<typeof loanStatusSchema>;

// Payment frequency enum
export const paymentFrequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']);
export type PaymentFrequency = z.infer<typeof paymentFrequencySchema>;

// Loans table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").notNull().references(() => borrowers.id),
  principal: real("principal").notNull(),
  interestRate: real("interest_rate").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  paymentDay: integer("payment_day").notNull(),
  status: text("status").notNull(),
  frequency: text("frequency").notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  installments: integer("installments"),
  installmentAmount: real("installment_amount"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull().references(() => loans.id),
  date: timestamp("date").notNull(),
  amount: real("amount").notNull(),
  principal: real("principal").notNull(),
  interest: real("interest").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
