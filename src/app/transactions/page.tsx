'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
    const { addTransaction, updateTransaction } = useData();
    const { toast } = useToast();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [view, setView] = useState<'list' | 'form'>('list');

    const handleFormSubmit = async (values: Omit<Transaction, 'id'>) => {
        if (editingTransaction) {
            await updateTransaction(editingTransaction.id, values);
            toast({ title: 'Transação atualizada com sucesso!' });
        } else {
            await addTransaction(values);
            toast({ title: 'Sucesso!', description: 'Transação adicionada.' });
        }
        setView('list');
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setView('form');
    };

    const handleAddClick = () => {
        setEditingTransaction(null);
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
        setEditingTransaction(null);
    }
    
    return (
        <div className="grid gap-8">
            {view === 'list' ? (
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
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddTransactionForm
                            transactionToEdit={editingTransaction}
                            onFormSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
