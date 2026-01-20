'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCardForm } from "@/components/cards/add-card-form";
import { CardsList } from "@/components/cards/cards-list";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Card as CardType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";

export default function CardsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { data: cards, loading } = useCollection<CardType>(
        user ? query(collection(firestore, 'cards'), where('userId', '==', user.uid)) : null
    );

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Adicionar Novo Cartão</CardTitle>
                    <CardDescription>Preencha os detalhes do seu novo cartão de crédito.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddCardForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Meus Cartões</CardTitle>
                    <CardDescription>Sua lista de cartões cadastrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-40" /> : <CardsList cards={cards || []} />}
                </CardContent>
            </Card>
        </div>
    );
}
