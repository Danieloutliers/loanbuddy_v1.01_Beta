import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2, DollarSign } from 'lucide-react';
import { useLoanContext } from '@/context/LoanContext';
import { Loan } from '@/types';
import { getDaysOverdue, calculateRemainingBalance } from '@/utils/loanCalculations';
import { formatCurrency, formatStatus, getInitials } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export default function OverdueLoansTable() {
  const { getOverdueLoans, getPaymentsByLoanId, deleteLoan } = useLoanContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get all overdue loans
  const overdueLoans = getOverdueLoans();
  
  // Filter loans by search term
  const filteredLoans = overdueLoans.filter(loan => 
    loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
    <Card className="bg-white border border-slate-200 mt-6">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
          <h3 className="font-semibold text-slate-900">Empréstimos em Atraso</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
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
            <Button>
              Exportar
            </Button>
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
                  Valor Original
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Valor Atual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Dias em Atraso
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
                  const currentValue = calculateRemainingBalance(loan, payments);
                  const daysOverdue = getDaysOverdue(loan);
                  
                  return (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarFallback>{getInitials(loan.borrowerName)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{loan.borrowerName}</div>
                            <div className="text-sm text-slate-500">{loan.borrowerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(loan.principal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {daysOverdue} dias
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={loan.status as any}
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        >
                          {formatStatus(loan.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/loans/${loan.id}/payment`}>
                            <Button variant="ghost" size="icon" className="text-primary-600 hover:text-primary-900">
                              <DollarSign className="h-4 w-4" />
                              <span className="sr-only">Pagar</span>
                            </Button>
                          </Link>
                          <Link href={`/loans/${loan.id}/edit`}>
                            <Button variant="ghost" size="icon" className="text-primary-600 hover:text-primary-900">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:text-red-900"
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
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                    Nenhum empréstimo em atraso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredLoans.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="outline" size="sm">Anterior</Button>
              <Button variant="outline" size="sm">Próxima</Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredLoans.length}</span> de <span className="font-medium">{filteredLoans.length}</span> resultados
                </p>
              </div>
              {filteredLoans.length > 10 && (
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="sm" className="rounded-l-md">
                      Anterior
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-r-md">
                      Próxima
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
