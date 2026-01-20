'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useData } from "@/context/data-context";
import { ArrowLeftRight } from "lucide-react";

export default function TransactionsPage() {
    const { addTransaction } = useData();

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ArrowLeftRight /> Adicionar Nova Transação</CardTitle>
                    <CardDescription>Registre uma nova transação em um de seus cartões.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddTransactionForm onAddTransaction={addTransaction} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Seu histórico completo de transações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentTransactions />
                </CardContent>
            </Card>
        </div>
    );
}
