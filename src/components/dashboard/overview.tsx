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
  
  const upcomingInvoiceTotal = cards.reduce((totalForAllWindows, card) => {
    if (!card.closingDate) return totalForAllWindows;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let upcomingClosingDate;
    if (today.getDate() <= card.closingDate) {
      upcomingClosingDate = new Date(today.getFullYear(), today.getMonth(), card.closingDate, 23, 59, 59, 999);
    } else {
      upcomingClosingDate = new Date(today.getFullYear(), today.getMonth() + 1, card.closingDate, 23, 59, 59, 999);
    }

    const previousClosingDate = new Date(upcomingClosingDate);
    previousClosingDate.setMonth(previousClosingDate.getMonth() - 1);

    const cardTransactions = transactions.filter(t => t.cardId === card.id);

    const cardInvoiceTotal = cardTransactions.reduce((cardTotal, t) => {
        const purchaseDate = new Date(t.date);

        if (!t.installments) {
            if (purchaseDate > previousClosingDate && purchaseDate <= upcomingClosingDate) {
                return cardTotal + t.amount;
            }
            return cardTotal;
        }
        
        else {
            const installmentValue = t.amount / t.installments.total;

            const closingDateOfPurchasePeriod = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), card.closingDate, 23, 59, 59, 999);

            let firstInvoiceClosingDate;
            if (purchaseDate > closingDateOfPurchasePeriod) {
                firstInvoiceClosingDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 1, card.closingDate);
            } else {
                firstInvoiceClosingDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), card.closingDate);
            }

            for (let i = 0; i < t.installments.total; i++) {
                const installmentClosingDate = new Date(firstInvoiceClosingDate);
                installmentClosingDate.setMonth(installmentClosingDate.getMonth() + i);

                if (installmentClosingDate.getFullYear() === upcomingClosingDate.getFullYear() &&
                    installmentClosingDate.getMonth() === upcomingClosingDate.getMonth()) {
                    return cardTotal + installmentValue;
                }
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
