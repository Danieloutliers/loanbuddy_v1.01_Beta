import React from 'react';
import { useParams, useLocation } from 'wouter';
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
  calculateInstallmentAmount
} from '@/utils/loanCalculations';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const formSchema = z.object({
  borrowerId: z.string().min(1, "Selecione um mutuário"),
  principal: z.coerce.number().positive("Valor deve ser positivo"),
  interestRate: z.coerce.number().min(0, "Taxa de juros não pode ser negativa"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  nextPaymentDate: z.string().min(1, "Data do próximo pagamento é obrigatória"),
  paymentDay: z.coerce.number().min(1, "Dia de pagamento deve ser entre 1 e 31").max(31, "Dia de pagamento deve ser entre 1 e 31"),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  installments: z.coerce.number().int().positive("Número de parcelas deve ser positivo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditLoanPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { borrowers, getLoanById, updateLoan } = useLoanContext();
  const { toast } = useToast();

  const loan = getLoanById(id);

  if (!loan) {
    return (
      <Layout>
        <main className="flex-1 p-4 md:p-6">
          <div className="text-center py-10">
            <h2 className="text-xl font-medium text-slate-900">Empréstimo não encontrado</h2>
            <p className="mt-2 text-slate-500">O empréstimo solicitado não existe ou foi removido.</p>
            <Button className="mt-4" onClick={() => navigate('/loans')}>
              Voltar para Empréstimos
            </Button>
          </div>
        </main>
      </Layout>
    );
  }

  // Format dates for form input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return '';
      return format(date, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  // Initialize form with loan values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowerId: loan.borrowerId,
      principal: loan.principal,
      interestRate: loan.interestRate,
      issueDate: formatDateForInput(loan.issueDate),
      nextPaymentDate: formatDateForInput(loan.nextPaymentDate),
      paymentDay: loan.paymentDay, // Include paymentDay
      frequency: loan.frequency as PaymentFrequency,
      installments: loan.installments || 1,
      notes: loan.notes || "",
    },
  });

  // Get current form values
  const formValues = form.watch();

  // Calculate installment amount based on current form values
  const calculatePaymentAmount = () => {
    if (!formValues.principal || !formValues.interestRate || !formValues.issueDate || !formValues.installments) {
      return 0;
    }

    return calculateInstallmentAmount({
      ...loan,
      principal: formValues.principal,
      interestRate: formValues.interestRate,
      installments: formValues.installments
    });
  };

  const installmentAmount = calculatePaymentAmount();

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

      // Calculate next payment date (using the provided nextPaymentDate from the form)
      // If you want to recalculate based on issueDate and paymentDay, you would use calculateNextPaymentDate here.
      // For now, we'll use the date provided in the form for nextPaymentDate.
      const nextPaymentDate = new Date(data.nextPaymentDate);


      // Create updated loan object
      const updatedLoan = {
        borrowerId: data.borrowerId,
        borrowerName: borrower.name,
        principal: data.principal,
        interestRate: data.interestRate,
        issueDate: new Date(data.issueDate).toISOString(),
        paymentDay: data.paymentDay, // Include paymentDay
        frequency: data.frequency as PaymentFrequency,
        nextPaymentDate: nextPaymentDate.toISOString(),
        installments: data.installments,
        installmentAmount: calculateInstallmentAmount({
          ...loan,
          principal: data.principal,
          interestRate: data.interestRate,
          installments: data.installments
        }),
        notes: data.notes,
        status: loan.status // Keep existing status
      };

      // Update loan
      updateLoan(id, updatedLoan);

      toast({
        title: "Empréstimo atualizado",
        description: `Empréstimo de ${borrower.name} atualizado com sucesso`,
      });

      // Redirect to loan details
      navigate(`/loans/${id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o empréstimo",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Editar Empréstimo</h1>
          <p className="mt-1 text-sm text-slate-500">Atualize os dados do empréstimo</p>
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
                            placeholder="Ex: 5"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10); //Added radix for parseInt
                              if (!isNaN(value) && value >= 1 && value <= 31) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextPaymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Próximo Pagamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                      <strong>Valor estimado da parcela:</strong> R$ {installmentAmount.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => navigate(`/loans/${id}`)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
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
