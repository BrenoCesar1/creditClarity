'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

export function SpendingChart({ transactions }: { transactions: Transaction[] }) {
  const chartData = useMemo(() => {
    const monthlyTotals: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' });
      const year = date.getUTCFullYear();
      const key = `${month}/${year}`;
      
      monthlyTotals[key] = (monthlyTotals[key] || 0) + transaction.amount;
    });

    const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        const dateA = new Date(`${yearA}-${getMonthNumber(monthA)}-01`);
        const dateB = new Date(`${yearB}-${getMonthNumber(monthB)}-01`);
        return dateA.getTime() - dateB.getTime();
    }).slice(-6); // Get last 6 months

    return sortedMonths.map(key => {
        const [month] = key.split('/');
        return {
            name: month.charAt(0).toUpperCase() + month.slice(1),
            total: monthlyTotals[key]
        }
    });
  }, [transactions]);
  
  function getMonthNumber(month: string) {
    const months: { [key: string]: string } = {
        'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04', 'mai': '05', 'jun': '06',
        'jul': '07', 'ago': '08', 'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
    };
    return months[month.toLowerCase().replace('.', '')];
  }

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
            <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent 
                    formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                    hideLabel
                />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
    </ChartContainer>
  );
}
