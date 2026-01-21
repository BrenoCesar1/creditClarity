'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useData } from "@/context/data-context";
import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TransactionsPage() {
    const { addTransaction, updateTransaction } = useData();
    const { toast } = useToast();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditingOpen, setIsEditingOpen] = useState(false);

    const handleEditSubmit = async (values: Omit<Transaction, 'id'>) => {
        if (!editingTransaction) return;
        await updateTransaction(editingTransaction.id, values);
        setIsEditingOpen(false);
        toast({ title: 'Transação atualizada com sucesso!' });
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditingOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsEditingOpen(open);
        if (!open) {
            setEditingTransaction(null);
        }
    }

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ArrowLeftRight /> Adicionar Nova Transação</CardTitle>
                    <CardDescription>Registre uma nova transação em um de seus cartões.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddTransactionForm onFormSubmit={addTransaction} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Seu histórico completo de transações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentTransactions onEditTransaction={handleEditClick} />
                </CardContent>
            </Card>

            <Dialog open={isEditingOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Transação</DialogTitle>
                    </DialogHeader>
                    {editingTransaction && (
                        <AddTransactionForm
                            transactionToEdit={editingTransaction}
                            onFormSubmit={handleEditSubmit}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
