'use client';

import type { Debt } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function DebtTracker({ debts: initialDebts }: { debts: Debt[] }) {
  const { updateDebt } = useData();
  const { toast } = useToast();

  const handlePaidChange = (debtId: string, paid: boolean) => {
    updateDebt(debtId, { paid });
    toast({
        title: "Dívida atualizada!",
    })
  };
  
  const sortedDebts = [...initialDebts].sort((a, b) => {
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" /> Dívidas a Receber
        </CardTitle>
        <CardDescription>Empréstimos de cartão a terceiros.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDebts.map((debt) => (
            <div key={debt.id} className="flex items-center gap-4">
               <Checkbox
                id={`debt-${debt.id}`}
                checked={debt.paid}
                onCheckedChange={(checked) => handlePaidChange(debt.id, !!checked)}
              />
              <Avatar className="h-9 w-9">
                <AvatarImage src={debt.avatarUrl} alt={debt.person} data-ai-hint="person portrait" />
                <AvatarFallback>{debt.person.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <label 
                  htmlFor={`debt-${debt.id}`}
                  className={cn("font-medium", debt.paid && "line-through text-muted-foreground")}
                >
                  {debt.person}
                </label>
                <p className={cn("text-sm text-muted-foreground", debt.paid && "line-through")}>{debt.reason}</p>
              </div>
              <div className={cn("font-medium text-right", debt.paid && "line-through text-muted-foreground")}>
                {formatCurrency(debt.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
