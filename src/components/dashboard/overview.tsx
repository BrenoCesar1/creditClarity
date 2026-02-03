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
  const currentMonthUTC = now.getUTCMonth();
  const currentYearUTC = now.getUTCFullYear();

  const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getUTCMonth() === currentMonthUTC && transactionDate.getUTCFullYear() === currentYearUTC;
  });

  const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalDebt = debts
    .filter((d) => !d.paid)
    .reduce((sum, d) => sum + d.amount, 0);
  
  const upcomingInvoiceTotal = cards.reduce((total, card) => {
    if (!card.closingDate) return total;

    // Use UTC for all date calculations to avoid timezone issues.
    const today = new Date();
    
    // 1. Determine the current open invoice period for the card.
    // An invoice period runs from (previous_closing_day + 1) to (current_closing_day).

    // Find the closing date for the CURRENTLY OPEN invoice.
    // If today is Feb 20 and closing day is 14, the open invoice closes on Mar 14.
    let closingDateYear = today.getUTCFullYear();
    let closingDateMonth = today.getUTCMonth(); // Jan=0, Feb=1, etc.
    if (today.getUTCDate() > card.closingDate) {
        closingDateMonth += 1;
    }
    // Handle month overflow (e.g., December -> January of next year)
    if (closingDateMonth > 11) {
        closingDateMonth = 0;
        closingDateYear += 1;
    }
    const invoiceEndDate = new Date(Date.UTC(closingDateYear, closingDateMonth, card.closingDate, 23, 59, 59, 999));

    // The start date is the day after the previous closing date.
    let startDateYear = closingDateYear;
    let startDateMonth = closingDateMonth - 1;
    if (startDateMonth < 0) {
        startDateMonth = 11;
        startDateYear -= 1;
    }
    const invoiceStartDate = new Date(Date.UTC(startDateYear, startDateMonth, card.closingDate + 1, 0, 0, 0, 0));

    // 2. Calculate the total for this card's open invoice.
    let cardTotalForInvoice = 0;
    const cardTransactions = transactions.filter(t => t.cardId === card.id);

    cardTransactions.forEach(t => {
      const purchaseDate = new Date(t.date); // t.date is an ISO string, so it's parsed as UTC.
      
      if (!t.installments) {
        // --- This is a single, non-installment purchase ---
        if (purchaseDate >= invoiceStartDate && purchaseDate <= invoiceEndDate) {
          cardTotalForInvoice += t.amount;
        }
      } else {
        // --- This is an installment purchase ---
        const installmentValue = t.amount / t.installments.total;

        // Find the closing date of the FIRST invoice this purchase belongs to.
        let firstInstallmentYear = purchaseDate.getUTCFullYear();
        let firstInstallmentMonth = purchaseDate.getUTCMonth();
        if (purchaseDate.getUTCDate() > card.closingDate) {
            firstInstallmentMonth += 1;
        }
        if (firstInstallmentMonth > 11) {
            firstInstallmentMonth = 0;
            firstInstallmentYear += 1;
        }

        // Loop through all possible installments for this purchase.
        for (let i = 0; i < t.installments.total; i++) {
            let currentInstallmentYear = firstInstallmentYear;
            let currentInstallmentMonth = firstInstallmentMonth + i;

            // Handle year rollovers for installments.
            currentInstallmentYear += Math.floor(currentInstallmentMonth / 12);
            currentInstallmentMonth = currentInstallmentMonth % 12;
            
            // Check if this installment's invoice period matches the card's currently open invoice.
            if (currentInstallmentYear === closingDateYear && currentInstallmentMonth === closingDateMonth) {
              cardTotalForInvoice += installmentValue;
              break; // Found the installment for this period, move to the next transaction.
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
