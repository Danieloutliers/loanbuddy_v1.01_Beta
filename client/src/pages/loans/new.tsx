import React from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoanContext } from '@/context/LoanContext';
import { PaymentFrequency } from '@/types';
import {
  calculateNextPaymentDate,
  calculateInstallmentAmount,
  formatCurrency
} from '@/utils/loanCalculations';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';

const formSchema = z.object({
  borrowerId: z.string().min(1, "Selecione um mutuário"),
  principal: z.coerce.number().positive("Valor deve ser positivo"),
  interestRate: z.coerce.number().min(0, "Taxa de juros não pode ser negativa"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  paymentDay: z.coerce.number().min(1, "Dia de pagamento é obrigatório").max(31, "Dia inválido"),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  installments: z.coerce.number().int().positive("Número de parcelas deve ser positivo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLoanPage() {
  const { borrowers, addLoan, settings } = useLoanContext();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Today's date in ISO format
  const today = format(new Date(), 'yyyy-MM-dd');

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowerId: "",
      principal: 0,
      interestRate: settings.defaultInterestRate,
      issueDate: today,
      paymentDay: 1,
      frequency: settings.defaultPaymentFrequency,
      installments: settings.defaultInstallments,
      notes: "",
    },
  });

  // Get current form values
  const formValues = form.watch();

  // Calculate installment amount based on current form values
  const calculatePaymentAmount = () => {
    if (!formValues.principal || !formValues.interestRate || !formValues.issueDate || !formValues.installments) {
      return 0;
    }

    const principal = Number(formValues.principal);
    const rate = Number(formValues.interestRate) / 100; // Convert to decimal
    const installments = Number(formValues.installments);

    // Juros simples por parcela: Principal * Taxa * Número de Parcelas
    const totalInterest = principal * rate * installments;

    // Total a ser pago (principal + juros totais)
    const total = principal + totalInterest;

    // Dividir pelo número de parcelas
    return total / installments;
  };

  const installmentAmount = calculatePaymentAmount();

  // Calculate total interest
  const calculateTotalInterest = () => {
    if (!formValues.principal || !formValues.interestRate || !formValues.installments) {
      return 0;
    }

    const principal = Number(formValues.principal);
    const rate = Number(formValues.interestRate) / 100;
    const installments = Number(formValues.installments);

    // Juros simples por parcela: Principal * Taxa * Número de Parcelas
    return principal * rate * installments;
  };

  const totalInterest = calculateTotalInterest();

  const onSubmit = async (data: FormValues) => {
    try {
      // Get borrower name
      const borrower = borrowers.find(b => b.id === data.borrowerId);
      if (!borrower) {
        toast({
          title: "Erro",
          description: "Mutuário não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Calculate next payment date
      const issueDate = new Date(data.issueDate);
      // Criar data do próximo pagamento baseado no dia de pagamento
      const nextPaymentDate = new Date(data.issueDate);
      nextPaymentDate.setDate(data.paymentDay);
      if (nextPaymentDate < new Date(data.issueDate)) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }

      // Create loan object
      const loan = {
        borrowerId: data.borrowerId,
        borrowerName: borrower.name,
        principal: data.principal,
        interestRate: data.interestRate,
        issueDate: new Date(data.issueDate).toISOString(),
        paymentDay: data.paymentDay, // Include paymentDay
        frequency: data.frequency as PaymentFrequency,
        nextPaymentDate: nextPaymentDate.toISOString(),
        installments: data.installments,
        installmentAmount,
        notes: data.notes,
        paymentSchedule: {
          frequency: data.frequency as PaymentFrequency,
          nextPaymentDate: nextPaymentDate.toISOString(),
          installments: data.installments,
          installmentAmount,
        }
      };

      // Add loan
      const newLoan = addLoan(loan);

      toast({
        title: "Empréstimo criado",
        description: `Empréstimo para ${borrower.name} criado com sucesso`,
      });

      // Redirect to loan details
      navigate(`/loans/${newLoan.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o empréstimo",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Novo Empréstimo</h1>
          <p className="mt-1 text-sm text-slate-500">Preencha os detalhes do novo empréstimo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Empréstimo</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="borrowerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mutuário</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um mutuário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {borrowers.map((borrower) => (
                              <SelectItem key={borrower.id} value={borrower.id}>
                                {borrower.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="principal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Principal (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa de Juros (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Emissão</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Pagamento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Ex: 5 para todo dia 5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência de Pagamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="biweekly">Quinzenal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormItem>
                      <FormLabel>Juros Totais (R$)</FormLabel>
                      <FormControl>
                        <Input type="text" value={formatCurrency(totalInterest)} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {installmentAmount > 0 && (
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                    <p className="text-sm text-slate-700">
                      <strong>Valor estimado da parcela:</strong> {formatCurrency(installmentAmount)}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => navigate('/loans')}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Empréstimo
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
