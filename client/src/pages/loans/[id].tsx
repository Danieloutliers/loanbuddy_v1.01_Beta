import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLoanContext } from '@/context/LoanContext';
import {
  calculateRemainingBalance,
  calculatePrincipalBalance,
  getDaysOverdue,
  calculateTotalDue,
  calculatePaymentDistribution // Added missing import
} from '@/utils/loanCalculations';
import { formatCurrency, formatDate, formatStatus, formatFrequency, getInitials } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, Edit, User, Clock, FileText, Plus, Trash2 } from 'lucide-react';

export default function LoanDetailsPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { getLoanWithDetails, addPayment, deletePayment, updatePayment } = useLoanContext();
  const { toast } = useToast();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentNotes, setEditPaymentNotes] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loanWithDetails = getLoanWithDetails(id);

  if (!loanWithDetails) {
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

  // o loanWithDetails é o próprio objeto loan com as propriedades adicionais
  const loan = loanWithDetails;
  const { borrower, payments } = loanWithDetails;

  // Usar as funções já protegidas contra null/undefined
  const remainingBalance = calculateRemainingBalance(loan, payments);
  const principalBalance = calculatePrincipalBalance(loan, payments);
  const totalDue = calculateTotalDue(loan);
  const interestBalance = totalDue - loan.principal;
  const daysOverdue = getDaysOverdue(loan);

  const handleMakePayment = () => {
    try {
      if (!loan) {
        toast({
          title: 'Erro',
          description: 'Empréstimo não encontrado. Atualize a página e tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      const amount = parseFloat(paymentAmount);

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Valor inválido',
          description: 'Por favor, insira um valor válido para o pagamento.',
          variant: 'destructive',
        });
        return;
      }

      const paymentDate = new Date().toISOString();

      addPayment({
        loanId: loan.id,
        date: paymentDate,
        amount,
        notes: paymentNotes,
      });

      toast({
        title: 'Pagamento registrado',
        description: `Pagamento de ${formatCurrency(amount)} registrado com sucesso.`,
      });

      setPaymentAmount('');
      setPaymentNotes('');
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao registrar pagamento',
        description: 'Ocorreu um erro ao registrar o pagamento.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este pagamento?")) {
      try {
        deletePayment(paymentId);
        toast({
          title: "Pagamento excluído",
          description: "Pagamento excluído com sucesso.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o pagamento.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setSelectedPaymentId(paymentId);
      setEditPaymentAmount(payment.amount.toString());
      setEditPaymentNotes(payment.notes || '');
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdatePayment = () => {
    if (!selectedPaymentId) return;

    try {
      const amount = parseFloat(editPaymentAmount);

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Valor inválido',
          description: 'Por favor, insira um valor válido para o pagamento.',
          variant: 'destructive',
        });
        return;
      }

      updatePayment(selectedPaymentId, {
        amount: amount,
        notes: editPaymentNotes,
      });

      toast({
        title: 'Pagamento atualizado',
        description: 'Pagamento atualizado com sucesso.',
      });

      setIsEditDialogOpen(false);
      setSelectedPaymentId(null);
      setEditPaymentAmount('');
      setEditPaymentNotes('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao atualizar pagamento',
        description: 'Ocorreu um erro ao atualizar o pagamento.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Detalhes do Empréstimo</h1>
            <p className="mt-1 text-sm text-slate-500">Informações e histórico completo</p>
          </div>
          <div className="flex mt-4 sm:mt-0 gap-2">
            <Button variant="outline" onClick={() => navigate(`/loans/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                  <DialogDescription>
                    Informe o valor do pagamento para o empréstimo {borrower?.name ? `de ${borrower.name}` : ''}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleMakePayment}>Confirmar Pagamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Empréstimo</CardTitle>
                <div className="flex items-center mt-2">
                  {loan && (
                    <>
                      <Badge
                        variant={
                          !loan.nextPaymentDate ? 'active' :
                          new Date(loan.nextPaymentDate) < new Date() ? 'overdue' : 'paid'
                        }
                      >
                        {!loan.nextPaymentDate ? 'Ativo' :
                         new Date(loan.nextPaymentDate) < new Date() ? 'Vencido' : 'Pago'}
                      </Badge>
                      {new Date(loan.nextPaymentDate) < new Date() && (
                        <span className="ml-2 text-xs text-red-500">
                          {daysOverdue} dias em atraso
                        </span>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Informações Gerais</h3>
                    <div className="mt-2 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Valor Principal:</span>
                        <span className="text-sm font-medium">{loan?.principal ? formatCurrency(loan.principal) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Taxa de Juros:</span>
                        <span className="text-sm font-medium">{loan?.interestRate ? `${loan.interestRate}%` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Data de Emissão:</span>
                        <span className="text-sm font-medium">{loan?.issueDate ? formatDate(loan.issueDate) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Dia de Pagamento:</span>
                        <span className="text-sm font-medium">{loan?.paymentDay ? `Dia ${loan.paymentDay}` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Frequência de Pagamento:</span>
                        <span className="text-sm font-medium">{loan?.frequency ? formatFrequency(loan.frequency) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Valor Total Devido:</span>
                        <span className="text-sm font-medium">{loan ? formatCurrency(totalDue) : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Saldo Atual</h3>
                    <div className="mt-2 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Saldo Principal:</span>
                        <span className="text-sm font-medium">{formatCurrency(principalBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Juros a Pagar:</span>
                        <span className="text-sm font-medium">{formatCurrency(interestBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Saldo Total:</span>
                        <span className="text-sm font-semibold text-primary-700">{formatCurrency(remainingBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Próximo Pagamento:</span>
                        <span className="text-sm font-medium">{loan?.nextPaymentDate ? formatDate(loan.nextPaymentDate) : '-'}</span>
                      </div>
                      {loan?.installmentAmount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Valor da Parcela:</span>
                          <span className="text-sm font-medium">{formatCurrency(loan.installmentAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {loan?.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-500">Notas</h3>
                    <p className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                      {loan.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Valor Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Principal
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Juros
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Notas
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatDate(payment.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatCurrency(payment.principal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatCurrency(payment.interest)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {payment.notes || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => handleEditPayment(payment.id)}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Editar Pagamento</DialogTitle>
                                      <DialogDescription>
                                        Edite os detalhes do pagamento.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="amount">Valor (R$)</Label>
                                        <Input
                                          id="amount"
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={editPaymentAmount}
                                          onChange={(e) => setEditPaymentAmount(e.target.value)}
                                        />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="notes">Observações</Label>
                                        <Textarea
                                          id="notes"
                                          value={editPaymentNotes}
                                          onChange={(e) => setEditPaymentNotes(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleUpdatePayment}>Atualizar Pagamento</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
                                  onClick={() => handleDeletePayment(payment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500">Nenhum pagamento registrado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Borrower Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Mutuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{borrower?.name ? getInitials(borrower.name) : '-'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-slate-900">{borrower?.name || 'Mutuário'}</h3>
                    {borrower && (
                      <Link
                        href={`/borrowers/${borrower.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
                      >
                        Ver perfil completo
                      </Link>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  {borrower?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm">{borrower.email}</span>
                    </div>
                  )}
                  {borrower?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm">{borrower.phone}</span>
                    </div>
                  )}
                  {borrower?.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm">Cliente desde {formatDate(borrower.createdAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {borrower?.id && (
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/borrowers/${borrower.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    Ver Todos os Empréstimos
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Payment Schedule */}
            {loan?.paymentSchedule && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Cronograma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loan?.paymentSchedule?.frequency && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm">Frequência: {formatFrequency(loan.paymentSchedule.frequency)}</span>
                      </div>
                    )}
                    {loan?.paymentSchedule?.installmentAmount && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm">Valor da Parcela: {formatCurrency(loan.paymentSchedule.installmentAmount)}</span>
                      </div>
                    )}
                    {loan?.paymentSchedule?.installments && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm">Total de Parcelas: {loan.paymentSchedule.installments}</span>
                      </div>
                    )}
                    {loan?.paymentSchedule?.nextPaymentDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="text-sm">Próximo Pagamento: {formatDate(loan.paymentSchedule.nextPaymentDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

// Lucide icons not imported in the upper section for brevity
import { Mail, Phone } from 'lucide-react';
