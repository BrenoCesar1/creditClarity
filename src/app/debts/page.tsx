'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useData } from "@/context/data-context";
import { Users } from "lucide-react";
import type { Debt } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function DebtsPage() {
    const { debts, addDebt } = useData();
    const { toast } = useToast();

    const handleAddSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        await addDebt(values);
        toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
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
                    <DebtsList debts={debts} />
                </CardContent>
            </Card>
        </div>
    );
}
