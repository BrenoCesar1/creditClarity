'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDebtForm } from "@/components/debts/add-debt-form";
import { DebtsList } from "@/components/debts/debts-list";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Debt } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function DebtsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { data: debts, loading } = useCollection<Debt>(
        user ? query(collection(firestore, 'debts'), where('userId', '==', user.uid)) : null
    );

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Adicionar Nova Dívida</CardTitle>
                    <CardDescription>Registre um novo valor a receber de terceiros.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddDebtForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Minhas Dívidas a Receber</CardTitle>
                    <CardDescription>Sua lista de dívidas a receber.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-40" /> : <DebtsList debts={debts || []} />}
                </CardContent>
            </Card>
        </div>
    );
}
