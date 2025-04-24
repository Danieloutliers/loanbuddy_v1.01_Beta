import React, { useState } from 'react';
import { Link } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Edit, Trash2, DollarSign, Plus } from 'lucide-react';
import { useLoanContext } from '@/context/LoanContext';
import { Loan, LoanStatus } from '@/types';
import { calculateRemainingBalance } from '@/utils/loanCalculations';
import { formatCurrency, formatDate, formatStatus, getInitials } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export default function LoansPage() {
  const { loans, getPaymentsByLoanId, deleteLoan } = useLoanContext();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter loans by search term and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (loan: Loan) => {
    if (window.confirm(`Tem certeza que deseja excluir o empréstimo de ${loan.borrowerName}?`)) {
      try {
        deleteLoan(loan.id);
        toast({
          title: 'Empréstimo excluído',
          description: `O empréstimo de ${loan.borrowerName} foi excluído com sucesso.`,
        });
      } catch (error) {
        toast({
          title: 'Erro ao excluir',
          description: `Ocorreu um erro ao excluir o empréstimo.`,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Empréstimos</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie todos os seus empréstimos</p>
          </div>
          <Link href="/loans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Empréstimo
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="w-full md:w-72 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar mutuário"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
                    <SelectItem value="defaulted">Inadimplentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mutuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Taxa de Juros
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data de Emissão
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Dia de Pagamento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Próximo Pagamento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => {
                      const payments = getPaymentsByLoanId(loan.id);
                      const remainingBalance = calculateRemainingBalance(loan, payments);

                      return (
                        <tr key={loan.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar>
                                <AvatarFallback>{getInitials(loan.borrowerName)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{loan.borrowerName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(loan.principal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {loan.interestRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatDate(loan.issueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            Dia {loan.paymentDay} {/* Display paymentDay */}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {loan.nextPaymentDate ? formatDate(loan.nextPaymentDate) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(remainingBalance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                !loan.nextPaymentDate ? 'active' :
                                new Date(loan.nextPaymentDate) < new Date() ? 'overdue' :
                                remainingBalance <= 0 ? 'paid' : 'active'
                              }
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            >
                              {!loan.nextPaymentDate ? 'Ativo' :
                               new Date(loan.nextPaymentDate) < new Date() ? 'Vencido' : 'Pago'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/loans/${loan.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="sr-only">Detalhes</span>
                                </Button>
                              </Link>
                              <Link href={`/loans/${loan.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
                                onClick={() => handleDelete(loan)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-sm text-slate-500">
                        Nenhum empréstimo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
