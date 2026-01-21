'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import type { Debt } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DebtsPage() {
    const { debts, addDebt, updateDebt } = useData();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const handleFormSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        if (editingDebt) {
            await updateDebt(editingDebt.id, values);
            toast({ title: 'Sucesso!', description: 'Dívida atualizada.' });
        } else {
            await addDebt(values);
            toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
        }
        setIsFormOpen(false);
        setEditingDebt(null);
    };

    const handleEditClick = (debt: Debt) => {
        setEditingDebt(debt);
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setEditingDebt(null);
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingDebt(null);
    }
    
    return (
        <div className="space-y-6">
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingDebt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddDebtForm
                            key={editingDebt?.id || 'add'}
                            debtToEdit={editingDebt}
                            onFormSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                        />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Minhas Dívidas a Receber</CardTitle>
                        <CardDescription>Sua lista de dívidas a receber.</CardDescription>
                    </div>
                    {!isFormOpen && (
                        <Button onClick={handleAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Dívida
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <DebtsList debts={debts} onEditDebt={handleEditClick} />
                </CardContent>
            </Card>
        </div>
    );
}
