'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const handleFormSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        try {
            if (editingDebt) {
                await updateDebt(editingDebt.id, values);
                toast({ title: 'Sucesso!', description: 'Dívida atualizada.' });
            } else {
                await addDebt(values);
                toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível salvar a dívida.' });
        }
    };

    const handleEditClick = (debt: Debt) => {
        setEditingDebt(debt);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingDebt(null);
        setIsDialogOpen(true);
    };
    
    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Minhas Dívidas a Receber</CardTitle>
                            <CardDescription>Sua lista de dívidas a receber.</CardDescription>
                        </div>
                        <Button onClick={handleAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Dívida
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DebtsList debts={debts} onEditDebt={handleEditClick} />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDebt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</DialogTitle>
                    </DialogHeader>
                    {isDialogOpen && (
                        <AddDebtForm
                            key={editingDebt?.id || 'add'}
                            debtToEdit={editingDebt}
                            onFormSubmit={handleFormSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
