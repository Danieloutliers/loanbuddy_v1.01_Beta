import React from 'react';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/dashboard/MetricCard';
import LoanStatusChart from '@/components/dashboard/LoanStatusChart';
import UpcomingDueLoans from '@/components/dashboard/UpcomingDueLoans';
import OverdueLoansTable from '@/components/dashboard/OverdueLoansTable';
import { useLoanContext } from '@/context/LoanContext';
import { formatCurrency } from '@/utils/format';
import { DollarSign, Percent, AlertTriangle, BarChart } from 'lucide-react';

export default function Dashboard() {
  const { calculateLoanMetrics } = useLoanContext();
  
  const metrics = calculateLoanMetrics();
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Visão geral dos seus empréstimos</p>
        </div>
        
        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Emprestado"
            value={formatCurrency(metrics.totalLent)}
            trend={{
              value: metrics.totalLentTrend,
              direction: 'up'
            }}
            icon={<DollarSign className="text-primary-600 h-5 w-5" />}
            iconBgColor="bg-primary-50"
          />
          
          <MetricCard
            title="Juros Acumulados"
            value={formatCurrency(metrics.accruedInterest)}
            trend={{
              value: metrics.accruedInterestTrend,
              direction: 'up'
            }}
            icon={<Percent className="text-blue-600 h-5 w-5" />}
            iconBgColor="bg-blue-50"
          />
          
          <MetricCard
            title="Valor em Atraso"
            value={formatCurrency(metrics.overdueAmount)}
            trend={{
              value: metrics.overdueAmountTrend,
              direction: 'up'
            }}
            icon={<AlertTriangle className="text-red-600 h-5 w-5" />}
            iconBgColor="bg-red-50"
          />
          
          <MetricCard
            title="Recebido este Mês"
            value={formatCurrency(metrics.receivedThisMonth)}
            trend={{
              value: metrics.receivedThisMonthTrend,
              direction: 'up'
            }}
            icon={<BarChart className="text-green-600 h-5 w-5" />}
            iconBgColor="bg-green-50"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoanStatusChart />
          </div>
          <div>
            <UpcomingDueLoans />
          </div>
        </div>
        
        <OverdueLoansTable />
      </main>
    </Layout>
  );
}
