'use client';
import { useState } from 'react';
import type { Debt } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/context/data-context';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddDebtForm } from './add-debt-form';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

export function DebtsList({ debts }: { debts: Debt[] }) {
    const { updateDebt, deleteDebt } = useData();
    const { toast } = useToast();
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

    const handlePaidChange = (debtId: string, paid: boolean) => {
        updateDebt(debtId, { paid });
        toast({
            title: "Dívida atualizada!",
        });
    };

    const handleDelete = async (debtId: string) => {
        await deleteDebt(debtId);
        toast({
            title: "Dívida deletada!",
        });
    }

    const handleEditSubmit = async (values: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => {
        if (!editingDebt) return;
        await updateDebt(editingDebt.id, values);
        setEditingDebt(null);
        toast({ title: 'Dívida atualizada com sucesso!' });
    };

    if (debts.length === 0) {
        return <p className="text-muted-foreground text-center">Nenhuma dívida a receber cadastrada.</p>
    }

    const sortedDebts = [...debts].sort((a, b) => {
        if (a.paid !== b.paid) {
          return a.paid ? 1 : -1;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return (
        <div className="space-y-4">
          {sortedDebts.map((debt) => (
            <div key={debt.id} className="flex items-center gap-4 p-4 border rounded-lg">
               <Checkbox
                id={`debt-list-${debt.id}`}
                checked={debt.paid}
                onCheckedChange={(checked) => handlePaidChange(debt.id, !!checked)}
              />
              <Avatar className="h-9 w-9">
                <AvatarImage src={debt.avatarUrl} alt={debt.person} data-ai-hint="person portrait" />
                <AvatarFallback>{debt.person.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <label 
                  htmlFor={`debt-list-${debt.id}`}
                  className={cn("font-medium", debt.paid && "line-through text-muted-foreground")}
                >
                  {debt.person}
                </label>
                <p className={cn("text-sm text-muted-foreground", debt.paid && "line-through")}>{debt.reason}</p>
                {debt.installments && (
                    <p className={cn("text-xs text-muted-foreground", debt.paid && "line-through")}>
                        Parcela {debt.installments.current}/{debt.installments.total}
                    </p>
                )}
              </div>
              <div className={cn("font-medium text-right", debt.paid && "line-through text-muted-foreground")}>
                {formatCurrency(debt.amount)}
              </div>
              <div className="ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditingDebt(debt)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Deletar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso irá deletar permanentemente a dívida da sua planilha.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(debt.id)} className="bg-red-600 hover:bg-red-700">Deletar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
           {editingDebt && (
                <Dialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Dívida</DialogTitle>
                        </DialogHeader>
                        <AddDebtForm
                            debtToEdit={editingDebt}
                            onFormSubmit={handleEditSubmit}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
