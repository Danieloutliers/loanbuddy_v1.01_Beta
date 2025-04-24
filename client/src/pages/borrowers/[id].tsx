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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoanContext } from '@/context/LoanContext';
import { calculateRemainingBalance } from '@/utils/loanCalculations';
import { formatCurrency, formatDate, formatStatus, getInitials } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Edit, DollarSign, Plus } from 'lucide-react';

export default function BorrowerDetailsPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { getBorrowerById, getLoansByBorrowerId, getPaymentsByLoanId, updateBorrower } = useLoanContext();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const borrower = getBorrowerById(id);
  
  if (!borrower) {
    return (
      <Layout>
        <main className="flex-1 p-4 md:p-6">
          <div className="text-center py-10">
            <h2 className="text-xl font-medium text-slate-900">Mutuário não encontrado</h2>
            <p className="mt-2 text-slate-500">O mutuário solicitado não existe ou foi removido.</p>
            <Button className="mt-4" onClick={() => navigate('/borrowers')}>
              Voltar para Mutuários
            </Button>
          </div>
        </main>
      </Layout>
    );
  }
  
  // Get all borrower's loans
  const borrowerLoans = getLoansByBorrowerId(id);
  
  // Calculate total borrowed and remaining balance
  const totalBorrowed = borrowerLoans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalRemaining = borrowerLoans.reduce((sum, loan) => {
    const payments = getPaymentsByLoanId(loan.id);
    return sum + calculateRemainingBalance(loan, payments);
  }, 0);
  
  // Number of active loans
  const activeLoans = borrowerLoans.filter(loan => loan.status !== 'paid').length;
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      try {
        updateBorrower(id, {
          name,
          email: email || undefined,
          phone: phone || undefined,
        });
        
        toast({
          title: "Mutuário atualizado",
          description: "Informações atualizadas com sucesso.",
        });
        
        setIsEditing(false);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao atualizar o mutuário.",
          variant: "destructive",
        });
      }
    } else {
      // Enter edit mode
      setName(borrower.name);
      setEmail(borrower.email || '');
      setPhone(borrower.phone || '');
      setIsEditing(true);
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Perfil do Mutuário</h1>
            <p className="mt-1 text-sm text-slate-500">Informações e empréstimos</p>
          </div>
          <div className="flex mt-4 sm:mt-0 gap-2">
            <Button variant={isEditing ? "default" : "outline"} onClick={handleEditToggle}>
              {isEditing ? "Salvar" : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
            <Link href="/loans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Empréstimo
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Borrower Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl">{getInitials(borrower.name)}</AvatarFallback>
                  </Avatar>
                  {isEditing ? (
                    <div className="ml-4 flex-1">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <div className="ml-4">
                      <h3 className="text-xl font-medium text-slate-900">{borrower.name}</h3>
                      <p className="text-sm text-slate-500">
                        Cliente desde {formatDate(borrower.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-slate-400 mr-3" />
                    {isEditing ? (
                      <div className="flex-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-700">{borrower.email || '-'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-slate-400 mr-3" />
                    {isEditing ? (
                      <div className="flex-1">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-700">{borrower.phone || '-'}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="text-slate-700">
                      Cliente desde {formatDate(borrower.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Emprestado:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(totalBorrowed)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Saldo Devedor:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(totalRemaining)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Empréstimos Ativos:</span>
                    <Badge variant="active">{activeLoans}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total de Empréstimos:</span>
                    <span className="font-semibold text-slate-900">{borrowerLoans.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Borrower Loans */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos</CardTitle>
                <CardDescription>
                  {borrowerLoans.length} empréstimo(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {borrowerLoans.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Taxa
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Data de Emissão
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Data de Vencimento
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
                        {borrowerLoans.map((loan) => (
                          <tr key={loan.id}>
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
                              {formatDate(loan.dueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={loan.status as any}>
                                {formatStatus(loan.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link href={`/loans/${loan.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500">Este mutuário não possui empréstimos.</p>
                    <Link href="/loans/new">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Empréstimo
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
