'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useData } from "@/context/data-context";
import { Users } from "lucide-react";
import type { Debt } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DebtsPage() {
    const { debts, addDebt, updateDebt } = useData();
    const { toast } = useToast();
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [isEditingOpen, setIsEditingOpen] = useState(false);

    const handleAddSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        await addDebt(values);
        toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
    };

    const handleEditSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        if (!editingDebt) return;
        await updateDebt(editingDebt.id, values);
        setIsEditingOpen(false);
        toast({ title: 'Sucesso!', description: 'Dívida atualizada.' });
    };

    const handleEditClick = (debt: Debt) => {
        setEditingDebt(debt);
        setIsEditingOpen(true);
    };

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Adicionar Nova Dívida</CardTitle>
                    <CardDescription>Registre um novo valor a receber de terceiros.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddDebtForm onFormSubmit={handleAddSubmit} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Minhas Dívidas a Receber</CardTitle>
                    <CardDescription>Sua lista de dívidas a receber.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DebtsList debts={debts} onEditDebt={handleEditClick} />
                </CardContent>
            </Card>

            <Dialog open={isEditingOpen} onOpenChange={setIsEditingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Dívida</DialogTitle>
                    </DialogHeader>
                    <AddDebtForm
                        debtToEdit={editingDebt}
                        onFormSubmit={handleEditSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
