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

    const today = new Date();
    
    let invoiceEndYear = today.getUTCFullYear();
    let invoiceEndMonth = today.getUTCMonth();
    
    if (today.getUTCDate() > card.closingDate) {
        invoiceEndMonth += 1;
        if (invoiceEndMonth > 11) {
            invoiceEndMonth = 0;
            invoiceEndYear += 1;
        }
    }
    
    const invoiceEndDate = new Date(Date.UTC(invoiceEndYear, invoiceEndMonth, card.closingDate, 23, 59, 59, 999));

    let invoiceStartYear = invoiceEndYear;
    let invoiceStartMonth = invoiceEndMonth -1;
    if(invoiceStartMonth < 0) {
        invoiceStartMonth = 11;
        invoiceStartYear -= 1;
    }

    const invoiceStartDate = new Date(Date.UTC(invoiceStartYear, invoiceStartMonth, card.closingDate + 1, 0, 0, 0, 0));

    const cardTransactions = transactions.filter(t => t.cardId === card.id);
    
    let cardTotalForInvoice = 0;

    cardTransactions.forEach(t => {
        const purchaseDate = new Date(t.date);

        if (t.installments) {
            const installmentValue = t.amount / t.installments.total;
            
            let firstInstallmentYear = purchaseDate.getUTCFullYear();
            let firstInstallmentMonth = purchaseDate.getUTCMonth();

            if (purchaseDate.getUTCDate() > card.closingDate) {
                firstInstallmentMonth += 1;
                if (firstInstallmentMonth > 11) {
                    firstInstallmentMonth = 0;
                    firstInstallmentYear += 1;
                }
            }
            
            const firstInstallmentClosingDate = new Date(Date.UTC(firstInstallmentYear, firstInstallmentMonth, card.closingDate));

            for (let i = 0; i < t.installments.total; i++) {
                const currentInstallmentClosingDate = new Date(firstInstallmentClosingDate);
                currentInstallmentClosingDate.setUTCMonth(firstInstallmentClosingDate.getUTCMonth() + i);

                if (currentInstallmentClosingDate.getUTCFullYear() === invoiceEndDate.getUTCFullYear() &&
                    currentInstallmentClosingDate.getUTCMonth() === invoiceEndDate.getUTCMonth()) {
                    cardTotalForInvoice += installmentValue;
                    break; 
                }
            }
        } else {
            if (purchaseDate >= invoiceStartDate && purchaseDate <= invoiceEndDate) {
                cardTotalForInvoice += t.amount;
            }
        }
    });

    return total + cardTotalForInvoice;
  }, 0);


  const totalFutureInstallments = transactions.reduce((sum, t) => {
    if (!t.installments) return sum;
    
    const card = cards.find(c => c.id === t.cardId);
    if (!card) return sum;
    
    const installmentValue = t.amount / t.installments.total;
    const purchaseDate = new Date(t.date);
    const today = new Date();

    let firstInvoiceYear = purchaseDate.getUTCFullYear();
    let firstInvoiceMonth = purchaseDate.getUTCMonth();
    if (purchaseDate.getUTCDate() > card.closingDate) {
        firstInvoiceMonth += 1;
    }
    const firstInvoiceClosing = new Date(Date.UTC(firstInvoiceYear, firstInvoiceMonth, card.closingDate));

    let currentInvoiceYear = today.getUTCFullYear();
    let currentInvoiceMonth = today.getUTCMonth();
    if (today.getUTCDate() > card.closingDate) {
        currentInvoiceMonth += 1;
    }
    const currentInvoiceClosing = new Date(Date.UTC(currentInvoiceYear, currentInvoiceMonth, card.closingDate));

    const monthsDiff = (currentInvoiceClosing.getUTCFullYear() - firstInvoiceClosing.getUTCFullYear()) * 12 + (currentInvoiceClosing.getUTCMonth() - firstInvoiceClosing.getUTCMonth());
    
    const paidInstallments = Math.max(0, Math.min(monthsDiff, t.installments.total));
    const remainingInstallments = t.installments.total - paidInstallments;

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
