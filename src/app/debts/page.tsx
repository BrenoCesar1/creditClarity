'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import type { Debt } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function DebtsPage() {
    const { debts, addDebt, updateDebt } = useData();
    const { toast } = useToast();
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleFormSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        if (editingDebt) {
            await updateDebt(editingDebt.id, values);
            toast({ title: 'Sucesso!', description: 'Dívida atualizada.' });
        } else {
            await addDebt(values);
            toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
        }
        setIsSheetOpen(false);
    };

    const handleEditClick = (debt: Debt) => {
        setEditingDebt(debt);
        setIsSheetOpen(true);
    };

    const handleAddClick = () => {
        setEditingDebt(null);
        setIsSheetOpen(true);
    };
    
    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
    };

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

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingDebt ? 'Editar Dívida' : 'Adicionar Nova Dívida'}</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                       <AddDebtForm
                            key={editingDebt?.id || 'new'}
                            debtToEdit={editingDebt}
                            onFormSubmit={handleFormSubmit}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
