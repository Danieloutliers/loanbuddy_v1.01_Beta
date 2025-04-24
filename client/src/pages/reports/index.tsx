import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLoanContext } from '@/context/LoanContext';
import { formatCurrency } from '@/utils/format';
import { subMonths, format, parseISO, isAfter } from 'date-fns'; // Added isAfter import
import { Download, Upload, BarChart as BarChartIcon, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#14b8a6', '#22c55e', '#eab308', '#ef4444'];

// Function to download CSV content
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  document.body.removeChild(link);
};

export default function ReportsPage() {
  const {
    loans,
    borrowers,
    payments,
    calculateLoanMetrics,
    calculateStatusDistribution,
    exportData,
    importData
  } = useLoanContext();
  const { toast } = useToast();

  const [importFile, setImportFile] = useState<File | null>(null);

  // Get metrics
  const metrics = calculateLoanMetrics();
  const statusDistribution = calculateStatusDistribution();

  // Prepare data for charts
  const statusData = [
    { name: 'Ativos', value: statusDistribution.active, fill: COLORS[0] },
    { name: 'Pagos', value: statusDistribution.paid, fill: COLORS[1] },
    { name: 'Vencidos', value: statusDistribution.overdue, fill: COLORS[2] },
    { name: 'Inadimplentes', value: statusDistribution.defaulted, fill: COLORS[3] }
  ].filter(item => item.value > 0);

  // Prepare monthly payment data (last 6 months)
  const getMonthlyPayments = () => {
    const monthData: Record<string, number> = {};
    const today = new Date();

    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthLabel = format(monthDate, 'MMM/yy');
      monthData[monthLabel] = 0;
    }

    // Sum payments by month
    payments.forEach(payment => {
      const paymentDate = parseISO(payment.date);
      const monthLabel = format(paymentDate, 'MMM/yy');

      // Only include payments from the last 6 months
      if (monthData[monthLabel] !== undefined) {
        monthData[monthLabel] += payment.amount;
      }
    });

    // Convert to array format for chart
    return Object.entries(monthData).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  const monthlyPaymentsData = getMonthlyPayments();

  // Export data handlers
  const handleExportLoans = () => {
    try {
      const csvData = exportData();

      // Convert loans to CSV - Added paymentDay header and data
      let csvContent = "id,borrowerId,borrowerName,principal,interestRate,issueDate,dueDate,status,frequency,nextPaymentDate,installments,installmentAmount,notes,paymentDay\n";

      csvData.loans.forEach(loan => {
        csvContent += `${loan.id},${loan.borrowerId},"${loan.borrowerName}",${loan.principal},${loan.interestRate},${loan.issueDate},${loan.dueDate},${loan.status},${loan.frequency},${loan.nextPaymentDate},${loan.installments},${loan.installmentAmount},"${loan.notes}",${loan.paymentDay}\n`;
      });

      downloadCSV(csvContent, 'emprestimos.csv');

      toast({
        title: "Exportação concluída",
        description: "Os dados dos empréstimos foram exportados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleExportBorrowers = () => {
    try {
      const csvData = exportData();

      // Convert borrowers to CSV
      let csvContent = "id,name,email,phone\n";

      csvData.borrowers.forEach(borrower => {
        csvContent += `${borrower.id},"${borrower.name}","${borrower.email}","${borrower.phone}"\n`;
      });

      downloadCSV(csvContent, 'mutuarios.csv');

      toast({
        title: "Exportação concluída",
        description: "Os dados dos mutuários foram exportados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleExportPayments = () => {
    try {
      const csvData = exportData();

      // Convert payments to CSV
      let csvContent = "id,loanId,date,amount,principal,interest,notes\n";

      csvData.payments.forEach(payment => {
        csvContent += `${payment.id},${payment.loanId},${payment.date},${payment.amount},${payment.principal},${payment.interest},"${payment.notes}"\n`;
      });

      downloadCSV(csvContent, 'pagamentos.csv');

      toast({
        title: "Exportação concluída",
        description: "Os dados dos pagamentos foram exportados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleExportAll = () => {
    try {
      const csvData = exportData();

      // Convert to JSON and then to string
      const jsonStr = JSON.stringify(csvData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'loanbuddy_export.json';
      link.click();

      toast({
        title: "Exportação concluída",
        description: "Todos os dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  };

  // Import data handler
  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.loans || !data.borrowers || !data.payments) {
          throw new Error("Formato de arquivo inválido");
        }

        importData(data);

        toast({
          title: "Importação concluída",
          description: "Os dados foram importados com sucesso.",
        });

        setImportFile(null);
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro na importação",
          description: "Ocorreu um erro ao importar os dados. Verifique o formato do arquivo.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
          <p className="mt-1 text-sm text-slate-500">Visualize e exporte dados do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Empréstimos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loans.length}</div>
              <p className="text-sm text-slate-500 mt-1">Total de empréstimos registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Mutuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{borrowers.length}</div>
              <p className="text-sm text-slate-500 mt-1">Total de mutuários cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payments.length}</div>
              <p className="text-sm text-slate-500 mt-1">Total de pagamentos recebidos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Emprestado:</span>
                  <span className="font-semibold">{formatCurrency(metrics.totalLent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Juros Acumulados:</span>
                  <span className="font-semibold">{formatCurrency(metrics.accruedInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor em Atraso:</span>
                  <span className="font-semibold">{formatCurrency(metrics.overdueAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recebido este Mês:</span>
                  <span className="font-semibold">{formatCurrency(metrics.receivedThisMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar/Importar Dados</CardTitle>
              <CardDescription>Exporte seus dados ou importe de um backup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleExportLoans} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Empréstimos
                  </Button>
                  <Button onClick={handleExportBorrowers} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Mutuários
                  </Button>
                  <Button onClick={handleExportPayments} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Pagamentos
                  </Button>
                  <Button onClick={handleExportAll} variant="default" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Tudo
                  </Button>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm mb-2">Importar dados de backup</p>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="text-sm w-full p-2 border border-slate-300 rounded-md"
                    />
                    <Button onClick={handleImport} disabled={!importFile}>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="payments">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Pagamentos Mensais
            </TabsTrigger>
            <TabsTrigger value="status">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Status dos Empréstimos
            </TabsTrigger>
            <TabsTrigger value="data">
              <FileText className="h-4 w-4 mr-2" />
              Dados Brutos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Mensais</CardTitle>
                <CardDescription>
                  Valor total de pagamentos recebidos nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyPaymentsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Tooltip
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Valor Recebido" fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Empréstimos</CardTitle>
                <CardDescription>
                  Distribuição dos empréstimos por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} empréstimos`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Sistema</CardTitle>
                <CardDescription>
                  Resumo de todos os dados armazenados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Empréstimos</h3>
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Valor Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Ativos</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{statusDistribution.active}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(
                              loans
                                .filter(loan => loan.status === 'active')
                                .reduce((sum, loan) => sum + loan.principal, 0)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Pagos</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{statusDistribution.paid}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(
                              loans
                                .filter(loan => loan.status === 'paid')
                                .reduce((sum, loan) => sum + loan.principal, 0)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Vencidos</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{statusDistribution.overdue}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(
                              loans
                                .filter(loan => loan.status === 'overdue')
                                .reduce((sum, loan) => sum + loan.principal, 0)
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Inadimplentes</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{statusDistribution.defaulted}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(
                              loans
                                .filter(loan => loan.status === 'defaulted')
                                .reduce((sum, loan) => sum + loan.principal, 0)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Pagamentos</h3>
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Período
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Valor Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Este mês</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {payments.filter(p => isAfter(parseISO(p.date), subMonths(new Date(), 1))).length}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(metrics.receivedThisMonth)}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{payments.length}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">Total</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                            {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExportAll} className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório Completo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
}
