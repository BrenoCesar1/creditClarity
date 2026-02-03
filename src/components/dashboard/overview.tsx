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
    today.setHours(0, 0, 0, 0);
    
    let upcomingClosingDate;
    if (today.getDate() <= card.closingDate) {
        upcomingClosingDate = new Date(today.getFullYear(), today.getMonth(), card.closingDate, 23, 59, 59, 999);
    } else {
        upcomingClosingDate = new Date(today.getFullYear(), today.getMonth() + 1, card.closingDate, 23, 59, 59, 999);
    }
    const previousClosingDate = new Date(upcomingClosingDate.getFullYear(), upcomingClosingDate.getMonth() - 1, card.closingDate, 23, 59, 59, 999);

    const cardTransactions = transactions.filter(t => t.cardId === card.id);

    const cardInvoiceTotal = cardTransactions.reduce((cardTotal, t) => {
        const transactionDate = new Date(t.date);

        if (!t.installments) {
            if (transactionDate > previousClosingDate && transactionDate <= upcomingClosingDate) {
                return cardTotal + t.amount;
            }
            return cardTotal;
        }
        else {
            const installmentValue = t.amount / t.installments.total;
            const purchaseDate = transactionDate;
            const dueDay = card.dueDate;
            const closingDay = card.closingDate;
            const purchaseYear = purchaseDate.getFullYear();
            const purchaseMonth = purchaseDate.getMonth();
            const purchaseDay = purchaseDate.getDate();

            let firstInvoiceDueMonth = purchaseMonth;
            let firstInvoiceDueYear = purchaseYear;

            if (purchaseDay > closingDay) {
                firstInvoiceDueMonth += 1;
            }
            if (dueDay <= closingDay) {
                firstInvoiceDueMonth += 1;
            }
            const firstInvoiceDueDate = new Date(firstInvoiceDueYear, firstInvoiceDueMonth, dueDay);
            firstInvoiceDueDate.setHours(0,0,0,0);

            const closingDateForCurrentInvoice = new Date(upcomingClosingDate);
            closingDateForCurrentInvoice.setHours(0,0,0,0);
            let currentInvoiceDueMonth = closingDateForCurrentInvoice.getMonth();
            let currentInvoiceDueYear = closingDateForCurrentInvoice.getFullYear();
            if (dueDay <= closingDay) {
                currentInvoiceDueMonth += 1;
            }
            const currentInvoiceDueDate = new Date(currentInvoiceDueYear, currentInvoiceDueMonth, dueDay);
            currentInvoiceDueDate.setHours(0,0,0,0);
            
            const totalInstallments = t.installments.total;
            const lastInvoiceDueDate = new Date(firstInvoiceDueDate);
            lastInvoiceDueDate.setMonth(lastInvoiceDueDate.getMonth() + totalInstallments - 1);
            
            if (currentInvoiceDueDate >= firstInvoiceDueDate && currentInvoiceDueDate <= lastInvoiceDueDate) {
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
