import React, { useState } from 'react';
import { Link } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, ExternalLink, Trash2 } from 'lucide-react';
import { useLoanContext } from '@/context/LoanContext';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const { payments, borrowers, getLoanById, deletePayment } = useLoanContext();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowerFilter, setBorrowerFilter] = useState('all');
  
  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Filter payments by search term and borrower
  const filteredPayments = sortedPayments.filter(payment => {
    const loan = getLoanById(payment.loanId);
    if (!loan) return false;
    
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBorrower = borrowerFilter === 'all' || loan.borrowerId === borrowerFilter;
    
    return matchesSearch && matchesBorrower;
  });
  
  const getLoanBorrowerName = (payment: Payment) => {
    const loan = getLoanById(payment.loanId);
    return loan ? loan.borrowerName : 'Desconhecido';
  };
  
  const handleDelete = (payment: Payment) => {
    const borrowerName = getLoanBorrowerName(payment);
    
    if (window.confirm(`Tem certeza que deseja excluir o pagamento de ${formatCurrency(payment.amount)} feito por ${borrowerName}?`)) {
      try {
        deletePayment(payment.id);
        toast({
          title: 'Pagamento excluído',
          description: 'O pagamento foi excluído com sucesso.',
        });
      } catch (error) {
        toast({
          title: 'Erro ao excluir',
          description: 'Ocorreu um erro ao excluir o pagamento.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Pagamentos</h1>
          <p className="mt-1 text-sm text-slate-500">Histórico de todos os pagamentos</p>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="w-full md:w-72 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por nome do mutuário"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={borrowerFilter} onValueChange={setBorrowerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por mutuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os mutuários</SelectItem>
                    {borrowers.map(borrower => (
                      <SelectItem key={borrower.id} value={borrower.id}>
                        {borrower.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mutuário
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
                      Observações
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => {
                      const loan = getLoanById(payment.loanId);
                      
                      return (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {loan ? loan.borrowerName : 'Mutuário removido'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
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
                              <Link href={`/loans/${payment.loanId}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">Ver Empréstimo</span>
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
                                onClick={() => handleDelete(payment)}
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
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">
                        Nenhum pagamento encontrado.
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
