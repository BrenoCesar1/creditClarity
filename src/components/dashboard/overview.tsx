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

export function DashboardOverview() {
  const { cards, transactions, debts } = useData();

  const now = new Date();
  // Calculate Total Spent based on Billing Cycle (not calendar month)
  // If card closes on 14th:
  // - Current Date: Feb 3 -> Cycle: Jan 15 to Feb 14
  // - Current Date: Feb 15 -> Cycle: Feb 15 to Mar 14
  const closingDay = cards[0]?.closingDate || 1; // Default to 1st if no card

  let startOfCycle = new Date(now);
  if (now.getDate() <= closingDay) {
    // We are in the cycle that started last month
    startOfCycle.setMonth(startOfCycle.getMonth() - 1);
  }
  startOfCycle.setDate(closingDay + 1);
  startOfCycle.setHours(0, 0, 0, 0);

  // Calculate Total Spent based on Transaction Type
  // Since the 'transactions' list represents the current invoice (including old installments),
  // we split it into:
  // 1. Installments (Parcelado)
  // 2. Spot Purchases (À vista / Total Gasto Mês)

  const totalInstallmentsThisMonth = transactions
    .filter(t => t.installments)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => !t.installments)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebt = debts
    .filter((d) => !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);

  // Fatura Aberta: All transactions + unpaid debts
  const upcomingInvoiceTotal = transactions.reduce((sum, t) => sum + t.amount, 0) + totalDebt;

  // For other components that need 'monthlyTransactions', we use the full list since it represents the current invoice
  const monthlyTransactions = transactions;


  const stats = [
    {
      title: 'Total Gasto (Mês)',
      value: `R$ ${totalSpent.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
      description: 'Compras à vista na fatura',
    },
    {
      title: 'Dívidas a Receber',
      value: `R$ ${totalDebt.toFixed(2)}`,
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Fatura Aberta (Total)',
      value: `R$ ${upcomingInvoiceTotal.toFixed(2)}`,
      icon: <CreditCard className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: 'Total Parcelado (Mês)',
      value: `R$ ${totalInstallmentsThisMonth.toFixed(2)}`,
      icon: <TrendingUp className="h-6 w-6 text-muted-foreground" />,
      description: 'Parcelas na fatura atual',
    },
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
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
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
