'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCardForm } from "@/components/cards/add-card-form";
import { CardsList } from "@/components/cards/cards-list";
import { useData } from "@/context/data-context";
import { CreditCard } from "lucide-react";

export default function CardsPage() {
    const { cards, addCard } = useData();

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Adicionar Novo Cartão</CardTitle>
                    <CardDescription>Preencha os detalhes do seu novo cartão de crédito.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddCardForm onAddCard={addCard} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Meus Cartões</CardTitle>
                    <CardDescription>Sua lista de cartões cadastrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CardsList cards={cards} />
                </CardContent>
            </Card>
        </div>
    );
}
