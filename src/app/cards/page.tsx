'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCardForm } from "@/components/cards/add-card-form";
import { CardsList } from "@/components/cards/cards-list";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Card as CardType } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function CardsPage() {
    const { cards, addCard, updateCard } = useData();
    const { toast } = useToast();
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [view, setView] = useState<'list' | 'form'>('list');

    const handleFormSubmit = async (values: Omit<CardType, 'id'>) => {
        if (editingCard) {
            await updateCard(editingCard.id, values);
            toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
        } else {
            await addCard(values);
            toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
        }
        setView('list');
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setView('form');
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
        setEditingCard(null);
    }

    return (
        <div className="grid gap-8">
            {view === 'list' ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Meus Cartões</CardTitle>
                            <CardDescription>Sua lista de cartões cadastrados.</CardDescription>
                        </div>
                        <Button onClick={handleAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Cartão
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <CardsList cards={cards} onEditCard={handleEditClick} />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddCardForm
                            cardToEdit={editingCard}
                            onFormSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
