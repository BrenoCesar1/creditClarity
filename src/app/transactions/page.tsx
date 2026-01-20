'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight } from "lucide-react";

export default function TransactionsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { data: transactions, loading } = useCollection<Transaction>(
        user ? query(collection(firestore, 'transactions'), where('userId', '==', user.uid)) : null
    );

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ArrowLeftRight /> Adicionar Nova Transação</CardTitle>
                    <CardDescription>Registre uma nova transação em um de seus cartões.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddTransactionForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Seu histórico completo de transações.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-96" /> : <RecentTransactions initialTransactions={transactions || []} />}
                </CardContent>
            </Card>
        </div>
    );
}
