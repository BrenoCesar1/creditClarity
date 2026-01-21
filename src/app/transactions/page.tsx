'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
    const { addTransaction, updateTransaction } = useData();
    const { toast } = useToast();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleFormSubmit = async (values: Omit<Transaction, 'id'>) => {
        if (editingTransaction) {
            await updateTransaction(editingTransaction.id, values);
            toast({ title: 'Transação atualizada com sucesso!' });
        } else {
            await addTransaction(values);
            toast({ title: 'Sucesso!', description: 'Transação adicionada.' });
        }
        setIsDialogOpen(false);
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingTransaction(null);
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingTransaction(null);
        }
    }
    
    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Histórico de Transações</CardTitle>
                        <CardDescription>Seu histórico completo de transações.</CardDescription>
                    </div>
                     <Button onClick={handleAddClick}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Transação
                    </Button>
                </CardHeader>
                <CardContent>
                    <RecentTransactions onEditTransaction={handleEditClick} />
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {isDialogOpen && (
                            <AddTransactionForm
                                transactionToEdit={editingTransaction}
                                onFormSubmit={handleFormSubmit}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
