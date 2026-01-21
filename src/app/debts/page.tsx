'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import type { Debt } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DebtsPage() {
    const { debts, addDebt, updateDebt } = useData();
    const { toast } = useToast();
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleFormSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        if (editingDebt) {
            await updateDebt(editingDebt.id, values);
            toast({ title: 'Sucesso!', description: 'Dívida atualizada.' });
        } else {
            await addDebt(values);
            toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
        }
        setIsDialogOpen(false);
    };

    const handleEditClick = (debt: Debt) => {
        setEditingDebt(debt);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingDebt(null);
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingDebt(null);
        }
    }
    
    return (
        <div className="grid gap-8">
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

            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDebt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                       {isDialogOpen && (
                           <AddDebtForm
                                debtToEdit={editingDebt}
                                onFormSubmit={handleFormSubmit}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
