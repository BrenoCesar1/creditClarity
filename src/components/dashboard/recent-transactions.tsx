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
import { BrainCircuit, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { categorizePurchases } from '@/ai/flows/categorize-purchases';
import { useToast } from '@/hooks/use-toast';
import CategoryIcon from './category-icon';
import { Skeleton } from '../ui/skeleton';
import { useData } from '@/context/data-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

export function RecentTransactions({ onEditTransaction }: { onEditTransaction?: (transaction: Transaction) => void }) {
  const { transactions, updateTransaction, deleteTransaction } = useData();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
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
      
      const transactionsToUpdate: { id: string, updates: Partial<Transaction> }[] = [];

      result.categories.forEach(categorizedPurchase => {
        const transactionToUpdate = transactions.find(
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
          
          transactionsToUpdate.push({ id: transactionToUpdate.id, updates: { category: newCategory } });
        }
      });

      await Promise.all(transactionsToUpdate.map(t => updateTransaction(t.id, t.updates)));
      
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

  const handleDelete = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    toast({
        title: "Transação deletada!",
    });
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
              <TableHead className="w-[50px] text-right">Ações</TableHead>
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
                      {' '}({transaction.installments.total - transaction.installments.current} restantes)
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
                <TableCell>
                  <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          {onEditTransaction && (
                            <DropdownMenuItem onSelect={() => onEditTransaction(transaction)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Deletar
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Essa ação não pode ser desfeita. Isso irá deletar permanentemente a transação da sua planilha.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(transaction.id)} variant="destructive">Deletar</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
