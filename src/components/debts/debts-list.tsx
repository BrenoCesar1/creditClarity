'use client';
import type { Debt } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/context/data-context';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

export function DebtsList({ debts }: { debts: Debt[] }) {
    const { updateDebt } = useData();
    const { toast } = useToast();

    const handlePaidChange = (debtId: string, paid: boolean) => {
        updateDebt(debtId, { paid });
        toast({
            title: "Dívida atualizada!",
        });
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
            </div>
          ))}
        </div>
    );
}
