'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CardType | null>(null);

    const handleFormSubmit = async (values: Omit<CardType, 'id'>) => {
        try {
            if (editingCard) {
                await updateCard(editingCard.id, values);
                toast({ title: 'Sucesso!', description: 'Cartão atualizado.' });
            } else {
                await addCard(values);
                toast({ title: 'Sucesso!', description: 'Cartão adicionado.' });
            }
            setIsSheetOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível salvar o cartão.' });
        }
    };

    const handleEditClick = (card: CardType) => {
        setEditingCard(card);
        setIsSheetOpen(true);
    };

    const handleAddClick = () => {
        setEditingCard(null);
        setIsSheetOpen(true);
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
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</SheetTitle>
                        <SheetDescription>
                            {editingCard ? 'Edite as informações do seu cartão.' : 'Preencha as informações do novo cartão.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        <AddCardForm
                            key={editingCard?.id || 'add'}
                            cardToEdit={editingCard}
                            onFormSubmit={handleFormSubmit}
                            onCancel={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
