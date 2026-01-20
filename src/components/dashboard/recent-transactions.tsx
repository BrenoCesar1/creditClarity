'use client';

import { useState, useEffect } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '../ui/skeleton';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: userTimeZone
    });
}

export function RecentTransactions({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      
      const updatedTransactions = [...transactions];
      const categoryUpdatePromises: Promise<void>[] = [];

      result.categories.forEach(categorizedPurchase => {
        const transactionToUpdate = updatedTransactions.find(
          (t) => !t.category && t.description === categorizedPurchase.description && t.amount === categorizedPurchase.amount
        );

        if (transactionToUpdate) {
          const categoryMap: { [key: string]: Transaction['category'] } = {
              'food': 'Alimentação',
              'transportation': 'Transporte',
              'entertainment': 'Lazer',
              'utilities': 'Contas',
              'other': 'Outros'
          };
          const newCategory = categoryMap[categorizedPurchase.category.toLowerCase()] || 'Outros';
          
          // Update local state
          transactionToUpdate.category = newCategory;

          // Prepare Firestore update
          const transactionRef = doc(firestore, 'transactions', transactionToUpdate.id);
          categoryUpdatePromises.push(
            updateDoc(transactionRef, { category: newCategory })
             .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: transactionRef.path,
                    operation: 'update',
                    requestResourceData: { category: newCategory },
                });
                errorEmitter.emit('permission-error', permissionError);
              })
          );
        }
      });
      
      await Promise.all(categoryUpdatePromises);

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
                <TableCell className="hidden md:table-cell">{isClient ? formatDate(transaction.date) : <Skeleton className="h-4 w-20" />}</TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
