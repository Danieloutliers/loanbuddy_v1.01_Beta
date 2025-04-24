import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLoanContext } from '@/context/LoanContext';
import { formatCurrency } from '@/utils/format';
import { addDays, format } from 'date-fns';

export default function UpcomingDueLoans() {
  const { loans } = useLoanContext();

  const getNextPaymentDate = (paymentDay: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let nextPaymentDate = new Date(currentYear, currentMonth, paymentDay);

    // Se o dia de pagamento já passou este mês, avança para o próximo mês
    if (today.getDate() > paymentDay) {
      nextPaymentDate = new Date(currentYear, currentMonth + 1, paymentDay);
    }

    return nextPaymentDate;
  };

  const upcomingLoans = loans
    .filter(loan => loan.status === 'active')
    .map(loan => ({
      ...loan,
      nextPayment: getNextPaymentDate(loan.paymentDay)
    }))
    .filter(loan => {
      const nextPayment = loan.nextPayment;
      const today = new Date();
      const daysUntilPayment = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilPayment <= 15 && daysUntilPayment >= 0;
    })
    .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime());

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">Próximos Pagamentos</h3> {/* Changed heading */}
          <Link href="/loans">
            <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-700 p-0">
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingLoans.length > 0 ? (
            upcomingLoans.map((loan) => (
              <div 
                key={loan.id} 
                className="p-3 bg-slate-50 rounded-md border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800">{loan.borrowerName}</p>
                    <p className="text-sm text-slate-500">
                      Pagamento dia {format(loan.nextPayment, "dd/MM/yyyy")} {/* Changed text */}
                    </p>
                  </div>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(loan.installmentAmount || 0)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-center">
              <p className="text-slate-500">Nenhum pagamento próximo</p> {/* Changed text */}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
