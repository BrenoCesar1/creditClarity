'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { categorizePurchases } from '@/ai/flows/categorize-purchases';
import { useToast } from '@/hooks/use-toast';
import CategoryIcon from './category-icon';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function RecentTransactions({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const handleCategorize = async () => {
    setIsCategorizing(true);
    const uncategorized = transactions
      .filter((t) => !t.category)
      .map((t) => ({ description: t.description, amount: t.amount }));

    if (uncategorized.length === 0) {
      toast({
        title: 'Tudo categorizado!',
        description: 'Todas as suas transações já possuem uma categoria.',
      });
      setIsCategorizing(false);
      return;
    }
    
    try {
      const result = await categorizePurchases({ purchases: uncategorized });
      
      const updatedTransactions = transactions.map((t) => {
        if (!t.category) {
          const categorized = result.categories.find(
            (c) => c.description === t.description && c.amount === t.amount
          );
          if (categorized) {
            const categoryMap: { [key: string]: Transaction['category'] } = {
                'food': 'Alimentação',
                'transportation': 'Transporte',
                'entertainment': 'Lazer',
                'utilities': 'Contas',
                'other': 'Outros'
            };
            return { ...t, category: categoryMap[categorized.category.toLowerCase()] || 'Outros' };
          }
        }
        return t;
      });

      setTransactions(updatedTransactions);
      toast({
        title: 'Categorias aplicadas!',
        description: `${result.categories.length} transações foram categorizadas com sucesso.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao categorizar',
        description: 'Não foi possível categorizar as transações. Tente novamente.',
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Suas últimas movimentações financeiras.</CardDescription>
        </div>
        <Button onClick={handleCategorize} disabled={isCategorizing}>
          {isCategorizing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Categorizar com IA
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>
                  {transaction.installments && (
                    <div className="text-xs text-muted-foreground">
                      Parcela {transaction.installments.current}/{transaction.installments.total}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {transaction.category ? (
                     <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                        <CategoryIcon category={transaction.category} className="h-4 w-4"/>
                        {transaction.category}
                     </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Não categorizado</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(transaction.date)}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
