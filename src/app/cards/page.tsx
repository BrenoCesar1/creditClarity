'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCardForm } from "@/components/cards/add-card-form";
import { CardsList } from "@/components/cards/cards-list";
import { useData } from "@/context/data-context";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Card as CardType } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CardsPage() {
    const { cards, addCard, updateCard } = useData();
    const { toast } = useToast();
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [isEditingOpen, setIsEditingOpen] = useState(false);

    // This effect ensures that when the dialog is closed, the editing state is cleared.
    // This prevents stale data and potential race conditions.
    useEffect(() => {
        if (!isEditingOpen) {
            setEditingCard(null);
        }
    }, [isEditingOpen]);

    const handleAddSubmit = async (values: Omit<CardType, 'id'>) => {
        await addCard(values);
        toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
    };

    const handleEditSubmit = async (values: Omit<CardType, 'id'>) => {
        if (!editingCard) return;
        await updateCard(editingCard.id, values);
        setIsEditingOpen(false); // Close the dialog
        toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setIsEditingOpen(true);
    };

    return (
        <div className="grid gap-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard /> Adicionar Novo Cartão</CardTitle>
                    <CardDescription>Preencha os detalhes do seu novo cartão de crédito.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddCardForm onFormSubmit={handleAddSubmit} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Meus Cartões</CardTitle>
                    <CardDescription>Sua lista de cartões cadastrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CardsList cards={cards} onEditCard={handleEditClick} />
                </CardContent>
            </Card>

            <Dialog open={isEditingOpen} onOpenChange={setIsEditingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cartão</DialogTitle>
                    </DialogHeader>
                    {/* The form is only rendered when there's a card to edit, ensuring a clean state. */}
                    {editingCard && (
                        <AddCardForm
                            cardToEdit={editingCard}
                            onFormSubmit={handleEditSubmit}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
