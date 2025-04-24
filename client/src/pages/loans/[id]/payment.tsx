import React from 'react';
import { useParams, useLocation } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoanContext } from '@/context/LoanContext';
import { calculatePaymentDistribution } from '@/utils/loanCalculations';
import { formatCurrency, formatDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPaymentPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { getLoanById, getPaymentsByLoanId, addPayment } = useLoanContext();
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
  
  // Get existing payments
  const payments = getPaymentsByLoanId(id);
  
  // Set default payment amount to the installment amount if available
  const defaultAmount = loan.installmentAmount || 0;
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: defaultAmount,
      notes: "",
    },
  });
  
  // Get current form values
  const amount = form.watch('amount');
  
  // Calculate payment distribution (how much goes to principal vs interest)
  const distribution = amount ? calculatePaymentDistribution(loan, amount, payments) : { principal: 0, interest: 0 };
  
  const onSubmit = async (data: FormValues) => {
    try {
      const paymentDate = new Date().toISOString();
      
      // Add payment
      addPayment({
        loanId: loan.id,
        date: paymentDate,
        amount: data.amount,
        principal: distribution.principal,
        interest: distribution.interest,
        notes: data.notes,
      });
      
      toast({
        title: "Pagamento registrado",
        description: `Pagamento de ${formatCurrency(data.amount)} registrado com sucesso.`,
      });
      
      // Redirect to loan details
      navigate(`/loans/${id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Registrar Pagamento</h1>
          <p className="mt-1 text-sm text-slate-500">Adicione um novo pagamento para o empréstimo</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Novo Pagamento</CardTitle>
                <CardDescription>
                  Empréstimo de {loan.borrowerName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Pagamento (R$)</FormLabel>
                          <FormControl>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                      <h3 className="font-medium text-slate-700 mb-2">Distribuição do Pagamento</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Principal:</p>
                          <p className="text-lg font-medium">{formatCurrency(distribution.principal)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Juros:</p>
                          <p className="text-lg font-medium">{formatCurrency(distribution.interest)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" type="button" onClick={() => navigate(`/loans/${id}`)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Confirmar Pagamento
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Empréstimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Mutuário:</span>
                    <span className="text-sm font-medium">{loan.borrowerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Valor Principal:</span>
                    <span className="text-sm font-medium">{formatCurrency(loan.principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Taxa de Juros:</span>
                    <span className="text-sm font-medium">{loan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Data de Emissão:</span>
                    <span className="text-sm font-medium">{formatDate(loan.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Data de Vencimento:</span>
                    <span className="text-sm font-medium">{formatDate(loan.dueDate)}</span>
                  </div>
                  {loan.installmentAmount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Valor da Parcela:</span>
                      <span className="text-sm font-medium">{formatCurrency(loan.installmentAmount)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Últimos Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{formatDate(payment.date)}</span>
                          <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Nenhum pagamento registrado ainda.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
