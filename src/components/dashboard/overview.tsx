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

  const monthlyDebts = debts.filter(d => {
    const debtDate = new Date(d.date);
    return debtDate.getMonth() === currentMonth && debtDate.getFullYear() === currentYear;
  });

  const totalDebt = monthlyDebts
    .filter((d) => !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);
  
  const upcomingInvoiceTotal = cards.reduce((totalForAllWindows, card) => {
    if (!card.closingDate) return totalForAllWindows;

    const today = new Date();
    
    // 1. Determine the upcoming closing date for the current open invoice
    let upcomingClosingDate;
    if (today.getDate() <= card.closingDate) {
      // The invoice for the current calendar month is still open.
      upcomingClosingDate = new Date(today.getFullYear(), today.getMonth(), card.closingDate, 23, 59, 59, 999);
    } else {
      // The invoice for the current calendar month has already closed. We are calculating for the next month's invoice.
      upcomingClosingDate = new Date(today.getFullYear(), today.getMonth() + 1, card.closingDate, 23, 59, 59, 999);
    }

    // 2. Determine the previous closing date to define the current invoice period.
    const previousClosingDate = new Date(upcomingClosingDate);
    previousClosingDate.setMonth(previousClosingDate.getMonth() - 1);

    const cardTransactions = transactions.filter(t => t.cardId === card.id);

    const cardInvoiceTotal = cardTransactions.reduce((cardTotal, t) => {
        const purchaseDate = new Date(t.date);

        // --- Logic for single-payment (non-installment) transactions ---
        if (!t.installments) {
            // Check if the purchase date is within the current invoice period.
            if (purchaseDate > previousClosingDate && purchaseDate <= upcomingClosingDate) {
                return cardTotal + t.amount;
            }
            return cardTotal;
        }
        
        // --- Logic for installment transactions ---
        else {
            const installmentValue = t.amount / t.installments.total;

            // Determine the closing date of the very first invoice this purchase appeared on.
            let firstInvoiceClosingDate;
            const purchaseYear = purchaseDate.getFullYear();
            const purchaseMonth = purchaseDate.getMonth();

            if (purchaseDate.getDate() > card.closingDate) {
                // If purchase was after closing day, it falls into the next month's invoice.
                firstInvoiceClosingDate = new Date(purchaseYear, purchaseMonth + 1, card.closingDate, 23, 59, 59, 999);
            } else {
                // If purchase was on or before closing day, it falls into the current month's invoice.
                firstInvoiceClosingDate = new Date(purchaseYear, purchaseMonth, card.closingDate, 23, 59, 59, 999);
            }

            // Determine the closing date of the final invoice for this purchase.
            const lastInvoiceClosingDate = new Date(firstInvoiceClosingDate);
            lastInvoiceClosingDate.setMonth(lastInvoiceClosingDate.getMonth() + t.installments.total - 1);
            
            // Check if the current open invoice (upcomingClosingDate) is within the payment window for this installment plan.
            // Using a 2-day tolerance to avoid issues with timezones or daylight saving time.
            const tolerance = 2 * 24 * 60 * 60 * 1000;
            if (upcomingClosingDate.getTime() >= firstInvoiceClosingDate.getTime() - tolerance && upcomingClosingDate.getTime() <= lastInvoiceClosingDate.getTime() + tolerance) {
                return cardTotal + installmentValue;
            }
            
            return cardTotal;
        }
    }, 0);
    return totalForAllWindows + cardInvoiceTotal;
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
      title: 'Dívidas a Receber (Mês)',
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
