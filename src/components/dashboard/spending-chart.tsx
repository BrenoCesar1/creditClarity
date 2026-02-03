'use client';

import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { Card as UICard, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { useData } from '@/context/data-context';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell } from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SpendingChart({ transactions }: { transactions: Transaction[] }) {
  const { debts, cards } = useData();

  // 1. Current Invoice Composition Data
  const compositionData = useMemo(() => {
    const spotTotal = transactions
      .filter(t => !t.installments)
      .reduce((sum, t) => sum + t.amount, 0);

    const installmentTotal = transactions
      .filter(t => t.installments)
      .reduce((sum, t) => sum + t.amount, 0);

    const debtTotal = debts
      .filter(d => !d.paid)
      .reduce((sum, d) => sum + d.amount, 0);

    return [
      { name: 'À Vista', value: spotTotal, fill: 'hsl(var(--primary))' },
      { name: 'Parcelado', value: installmentTotal, fill: '#8884d8' },
      { name: 'Dívidas', value: debtTotal, fill: '#82ca9d' },
    ];
  }, [transactions, debts]);

  // 2. Historical Data Reconstruction
  const historyData = useMemo(() => {
    const history = [];
    const closingDay = cards[0]?.closingDate || 14;

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      // Adjust to align with billing cycle (approx 15th of prev month to 14th of target month)
      const cycleYear = targetDate.getFullYear();
      const cycleMonth = targetDate.getMonth();
      const monthName = targetDate.toLocaleString('pt-BR', { month: 'short' });

      let monthlyTotal = 0;

      if (i === 0) {
        // Special Case: Current Month
        // User confirmed all transactions in the list belong to this month's invoice.
        // So we match the "Fatura Aberta" card exactly: All Transactions + All Unpaid Debts.
        const allTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);
        const allDebts = debts.filter(d => !d.paid).reduce((sum, d) => sum + d.amount, 0);
        monthlyTotal = allTransactions + allDebts;
      } else {
        // Historical Reconstruction for previous months
        // ... (existing logic for spot/installments based on dates) ...

        // Calculate Cycle Start/End dates for this target month
        // Cycle: 15th of (Month-1) to 14th of (Month)
        const cycleEnd = new Date(cycleYear, cycleMonth, closingDay, 23, 59, 59);
        const cycleStart = new Date(cycleYear, cycleMonth - 1, closingDay + 1, 0, 0, 0);

        // A. Spot Purchases in window
        const monthlySpot = transactions
          .filter(t => !t.installments)
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate >= cycleStart && tDate <= cycleEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        // B. Installments active in window
        const monthlyInstallments = transactions
          .filter(t => t.installments)
          .reduce((sum, t) => {
            if (!t.installments) return sum;
            // Check if installment existed 'i' months ago
            const installmentAtThatTime = t.installments.current - i;
            if (installmentAtThatTime > 0 && installmentAtThatTime <= t.installments.total) {
              return sum + t.amount;
            }
            return sum;
          }, 0);

        monthlyTotal = monthlySpot + monthlyInstallments;
      }

      history.push({
        name: monthName,
        total: monthlyTotal,
        fill: 'hsl(var(--primary))'
      });
    }
    return history;
  }, [transactions, cards, debts]);

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <UICard className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Análise de Gastos</CardTitle>
        <CardDescription>
          Visualize a composição atual ou o histórico recente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="composition">Composição Atual</TabsTrigger>
            <TabsTrigger value="history">Histórico (6 Meses)</TabsTrigger>
          </TabsList>

          <TabsContent value="composition">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={compositionData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toFixed(2)}`} hideLabel />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="history">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={historyData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent formatter={(value) => `R$ ${Number(value).toFixed(2)}`} hideLabel />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </UICard>
  );
}
