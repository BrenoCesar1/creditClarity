'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { useData } from "@/context/data-context";
import { Plus, BrainCircuit, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { categorizePurchases } from "@/ai/flows/categorize-purchases";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CategoryIcon from "@/components/dashboard/category-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function TransactionsPage() {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData();
    const { toast } = useToast();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const handleFormSubmit = async (values: Omit<Transaction, 'id'>) => {
        if (dialogMode === 'edit' && editingTransaction) {
            await updateTransaction(editingTransaction.id, values);
            toast({ title: 'Transação atualizada com sucesso!' });
        } else if (dialogMode === 'add') {
            await addTransaction(values);
            toast({ title: 'Sucesso!', description: 'Transação adicionada.' });
        }
        setIsDialogOpen(false);
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setDialogMode('edit');
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingTransaction(null);
        setDialogMode('add');
        setIsDialogOpen(true);
    };
    
    const handleDelete = async (transactionId: string) => {
        await deleteTransaction(transactionId);
        toast({
            title: "Transação deletada!",
        });
    };
    
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setDialogMode(null);
        }
    }

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
    
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Histórico de Transações</CardTitle>
                        <CardDescription>Seu histórico completo de transações.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleCategorize} disabled={isCategorizing}>
                            {isCategorizing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <BrainCircuit className="mr-2 h-4 w-4" />
                            )}
                            Categorizar com IA
                        </Button>
                        <Button onClick={handleAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Transação
                        </Button>
                    </div>
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
                                <TableCell className="hidden md:table-cell">{isClient ? formatDate(transaction.date) : <Skeleton className="h-4 w-20" />}
</TableCell>
                                <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                                <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => handleEditClick(transaction)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
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
                                                    <AlertDialogAction onClick={() => handleDelete(transaction.id)} className="bg-red-600 hover:bg-red-700">Deletar</AlertDialogAction>
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
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'edit' ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
                    </DialogHeader>
                    {dialogMode && (
                        <AddTransactionForm
                            transactionToEdit={editingTransaction}
                            onFormSubmit={handleFormSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
