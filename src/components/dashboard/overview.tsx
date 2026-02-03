'use client';

import { CardsSummary } from './cards-summary';
import { RecentTransactions } from './recent-transactions';
import { SpendingChart } from './spending-chart';
import { DebtTracker } from './debt-tracker';
import { SpendingSummaryAI } from './spending-summary-ai';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, CreditCard, Users, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useData } from '@/context/data-context';
import type { Card as CardType, Transaction, Debt } from '@/lib/types';

export function DashboardOverview() {
  const { cards, transactions, debts } = useData();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalDebt = debts
    .filter((d) => !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);
  
  const upcomingInvoiceTotal = cards.reduce((total, card) => {
    if (!card.closingDate) return total;

    const today = new Date();
    const currentYearUTC = today.getUTCFullYear();
    const currentMonthUTC = today.getUTCMonth();
    const currentDayUTC = today.getUTCDate();
    
    // Determine the upcoming closing date we are calculating for.
    // Example: If today is Jan 20 and closing day is 14, the next closing is Feb 14.
    const upcomingClosingDateUTC = new Date(Date.UTC(currentYearUTC, currentMonthUTC, card.closingDate));
    if (currentDayUTC > card.closingDate) {
      upcomingClosingDateUTC.setUTCMonth(upcomingClosingDateUTC.getUTCMonth() + 1);
    }
    
    // The period for this upcoming invoice starts the day after the *previous* closing date.
    const invoicePeriodEndDate = new Date(upcomingClosingDateUTC);
    const invoicePeriodStartDate = new Date(upcomingClosingDateUTC);
    invoicePeriodStartDate.setUTCMonth(invoicePeriodStartDate.getUTCMonth() - 1);
    invoicePeriodStartDate.setUTCDate(invoicePeriodStartDate.getUTCDate() + 1);
    invoicePeriodStartDate.setUTCHours(0, 0, 0, 0);
    invoicePeriodEndDate.setUTCHours(23, 59, 59, 999);


    let cardTotalForInvoice = 0;
    const cardTransactions = transactions.filter(t => t.cardId === card.id);

    cardTransactions.forEach(t => {
      const purchaseDate = new Date(t.date);

      // Simple purchases (not installments)
      if (!t.installments) {
        if (purchaseDate >= invoicePeriodStartDate && purchaseDate <= invoicePeriodEndDate) {
          cardTotalForInvoice += t.amount;
        }
      } 
      // Installment purchases
      else {
        const installmentValue = t.amount / t.installments.total;
        
        // Determine the closing date of the first invoice this purchase will appear on.
        const purchaseYearUTC = purchaseDate.getUTCFullYear();
        const purchaseMonthUTC = purchaseDate.getUTCMonth();
        const purchaseDayUTC = purchaseDate.getUTCDate();

        const firstInvoiceClosingDate = new Date(Date.UTC(purchaseYearUTC, purchaseMonthUTC, card.closingDate));
        if (purchaseDayUTC > card.closingDate) {
            firstInvoiceClosingDate.setUTCMonth(firstInvoiceClosingDate.getUTCMonth() + 1);
        }

        // Now, check if any of the installment invoices match the current open invoice
        for (let i = 0; i < t.installments.total; i++) {
          const installmentInvoiceDate = new Date(firstInvoiceClosingDate);
          installmentInvoiceDate.setUTCMonth(installmentInvoiceDate.getUTCMonth() + i);

          if (installmentInvoiceDate.getTime() === upcomingClosingDateUTC.getTime()) {
            cardTotalForInvoice += installmentValue;
            break; // Found the installment for this period, move to next transaction
          }
        }
      }
    });

    return total + cardTotalForInvoice;
  }, 0);

  const totalFutureInstallments = transactions
    .filter((t) => t.installments && t.installments.current < t.installments.total)
    .reduce((sum, t) => {
        const remainingInstallments = t.installments!.total - (t.installments!.current || 0);
        const installmentValue = t.amount / t.installments!.total;
        return sum + (remainingInstallments * installmentValue);
    }, 0);

  const stats = [
    {
      title: 'Total Gasto (Mês)',
      value: `R$ ${totalSpent.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Dívidas a Receber',
      value: `R$ ${totalDebt.toFixed(2)}`,
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
    },
    {
        title: 'Fatura Aberta (Estimativa)',
        value: `R$ ${upcomingInvoiceTotal.toFixed(2)}`,
        icon: <CreditCard className="h-6 w-6 text-muted-foreground" />,
    },
    {
        title: 'Saldo Parcelado Futuro',
        value: `R$ ${totalFutureInstallments.toFixed(2)}`,
        icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />,
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CardsSummary cards={cards} transactions={monthlyTransactions} />
        </div>
        <div className="lg:col-span-2">
            <Suspense fallback={<Skeleton className="h-full w-full"/>}>
              <SpendingSummaryAI transactions={monthlyTransactions} />
            </Suspense>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" /> Evolução de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingChart transactions={transactions} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <DebtTracker debts={debts} />
        </div>
      </div>

      <div>
        <RecentTransactions />
      </div>
    </div>
  );
}
