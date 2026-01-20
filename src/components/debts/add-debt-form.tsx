'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Debt } from '@/lib/types';

const debtSchema = z.object({
  person: z.string().min(2, { message: 'O nome da pessoa deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  reason: z.string().min(2, { message: 'O motivo deve ter pelo menos 2 caracteres.' }),
  installmentsCurrent: z.coerce.number().optional(),
  installmentsTotal: z.coerce.number().optional(),
});

export function AddDebtForm({ onAddDebt }: { onAddDebt: (debt: Omit<Debt, 'id'>) => Promise<void>}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof debtSchema>>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      person: '',
      reason: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof debtSchema>) => {
    const debtData: Omit<Debt, 'id'> = {
        person: values.person,
        amount: values.amount,
        reason: values.reason,
        paid: false,
        date: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/${values.person.replace(/\s/g, '')}/40/40`,
    };

    if (values.installmentsCurrent && values.installmentsTotal && values.installmentsTotal > 0) {
        debtData.installments = {
            current: values.installmentsCurrent,
            total: values.installmentsTotal
        }
    }
    
    await onAddDebt(debtData);
    toast({ title: 'Sucesso!', description: 'Dívida adicionada.' });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="person"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel>Pessoa</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Empréstimo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="installmentsCurrent"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Parcela Atual (opcional)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="installmentsTotal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Total de Parcelas (opcional)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Adicionar Dívida
        </Button>
      </form>
    </Form>
  );
}
