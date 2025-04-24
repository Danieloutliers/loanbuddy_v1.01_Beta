import React, { useState } from 'react';
import { Link } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useLoanContext } from '@/context/LoanContext';
import { formatDate, getInitials } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export default function BorrowersPage() {
  const { borrowers, getLoansByBorrowerId, deleteBorrower } = useLoanContext();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter borrowers by search term
  const filteredBorrowers = borrowers.filter(borrower => 
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (borrower.email && borrower.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (borrower.phone && borrower.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getBorrowerActiveLoans = (borrowerId: string) => {
    const loans = getLoansByBorrowerId(borrowerId);
    return loans.filter(loan => loan.status !== 'paid').length;
  };
  
  const handleDelete = (borrowerId: string, borrowerName: string) => {
    try {
      // Check if borrower has active loans
      const activeLoans = getBorrowerActiveLoans(borrowerId);
      
      if (activeLoans > 0) {
        toast({
          title: 'Não é possível excluir',
          description: `${borrowerName} possui empréstimos ativos.`,
          variant: 'destructive',
        });
        return;
      }
      
      if (window.confirm(`Tem certeza que deseja excluir ${borrowerName}?`)) {
        deleteBorrower(borrowerId);
        toast({
          title: 'Mutuário excluído',
          description: `${borrowerName} foi excluído com sucesso.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro ao excluir o mutuário.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mutuários</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie todos os seus mutuários</p>
          </div>
          <Link href="/borrowers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Mutuário
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Mutuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="w-full md:w-72 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Data de Cadastro
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Empréstimos Ativos
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredBorrowers.length > 0 ? (
                    filteredBorrowers.map((borrower) => (
                      <tr key={borrower.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar>
                              <AvatarFallback>{getInitials(borrower.name)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{borrower.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {borrower.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {borrower.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatDate(borrower.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-50 text-primary-700">
                            {getBorrowerActiveLoans(borrower.id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/borrowers/${borrower.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Detalhes</span>
                              </Button>
                            </Link>
                            <Link href={`/borrowers/${borrower.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(borrower.id, borrower.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                        Nenhum mutuário encontrado.
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
