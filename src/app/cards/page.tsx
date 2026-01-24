'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [dialogKey, setDialogKey] = useState(0);

    const handleFormSubmit = async (values: Omit<CardType, 'id'>) => {
        try {
            if (editingCard) {
                await updateCard(editingCard.id, values);
                toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
            } else {
                await addCard(values);
                toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível salvar o cartão.' });
        }
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setDialogKey(k => k + 1);
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setDialogKey(k => k + 1);
        setIsDialogOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
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
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent key={dialogKey}>
                    <DialogHeader>
                        <DialogTitle>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</DialogTitle>
                    </DialogHeader>
                    <AddCardForm
                        cardToEdit={editingCard}
                        onFormSubmit={handleFormSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
