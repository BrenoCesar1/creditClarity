'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useData } from "@/context/data-context";
import { ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function TransactionsPage() {
    const { addTransaction, updateTransaction } = useData();
    const { toast } = useToast();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditingOpen, setIsEditingOpen] = useState(false);

    // This effect ensures that when the dialog is closed, the editing state is cleared.
    // This prevents stale data and potential race conditions.
    useEffect(() => {
        if (!isEditingOpen) {
            setEditingTransaction(null);
        }
    }, [isEditingOpen]);

    const handleAddSubmit = async (values: Omit<Transaction, 'id'>) => {
        await addTransaction(values);
    };

    const handleEditSubmit = async (values: Omit<Transaction, 'id'>) => {
        if (!editingTransaction) return;
        await updateTransaction(editingTransaction.id, values);
        setIsEditingOpen(false); // Close the sheet
        toast({ title: 'Transação atualizada com sucesso!' });
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditingOpen(true);
    };

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ArrowLeftRight /> Adicionar Nova Transação</CardTitle>
                    <CardDescription>Registre uma nova transação em um de seus cartões.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddTransactionForm onFormSubmit={handleAddSubmit} />
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

            <Sheet open={isEditingOpen} onOpenChange={setIsEditingOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Transação</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                        {editingTransaction && (
                            <AddTransactionForm
                                transactionToEdit={editingTransaction}
                                onFormSubmit={handleEditSubmit}
                            />
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
