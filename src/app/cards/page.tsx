'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddCardForm } from "@/components/cards/add-card-form";
import { CardsList } from "@/components/cards/cards-list";
import { useData } from "@/context/data-context";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Card as CardType } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CardsPage() {
    const { cards, addCard, updateCard } = useData();
    const { toast } = useToast();
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogKey, setDialogKey] = useState(0);

    const handleFormSubmit = async (values: Omit<CardType, 'id'>) => {
        if (editingCard) {
            await updateCard(editingCard.id, values);
            toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
        } else {
            await addCard(values);
            toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
        }
        setIsDialogOpen(false);
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setDialogKey(prev => prev + 1);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setDialogKey(prev => prev + 1);
        setIsDialogOpen(true);
    };

    return (
        <div className="grid gap-8">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent key={dialogKey}>
                    <DialogHeader>
                        <DialogTitle>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <AddCardForm
                            cardToEdit={editingCard}
                            onFormSubmit={handleFormSubmit}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
