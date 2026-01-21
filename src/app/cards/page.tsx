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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);

    const handleFormSubmit = async (values: Omit<CardType, 'id'>) => {
        if (editingCard) {
            await updateCard(editingCard.id, values);
            toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
        } else {
            await addCard(values);
            toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
        }
        setIsFormOpen(false);
        setEditingCard(null);
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingCard(null);
    }

    return (
        <div className="space-y-6">
            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddCardForm
                            key={editingCard?.id || 'add'}
                            cardToEdit={editingCard}
                            onFormSubmit={handleFormSubmit}
                            onCancel={handleCancelForm}
                        />
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meus Cartões</CardTitle>
                        <CardDescription>Sua lista de cartões cadastrados.</CardDescription>
                    </div>
                    {!isFormOpen && (
                        <Button onClick={handleAddClick}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Cartão
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <CardsList cards={cards} onEditCard={handleEditClick} />
                </CardContent>
            </Card>
        </div>
    );
}
