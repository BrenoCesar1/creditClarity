'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { Debt } from '@/lib/types';
import { useEffect } from 'react';

const debtSchema = z.object({
  person: z.string().min(2, { message: 'O nome da pessoa deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  reason: z.string().min(2, { message: 'O motivo deve ter pelo menos 2 caracteres.' }),
  installmentsCurrent: z.coerce.number().optional(),
  installmentsTotal: z.coerce.number().optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;

interface AddDebtFormProps {
    onFormSubmit: (debt: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'>) => Promise<void>;
    debtToEdit?: Debt | null;
}

export function AddDebtForm({ onFormSubmit, debtToEdit }: AddDebtFormProps) {
  
  const isEditMode = !!debtToEdit;

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
  });

  useEffect(() => {
    form.reset({
      person: debtToEdit?.person || '',
      amount: debtToEdit?.amount,
      reason: debtToEdit?.reason || '',
      installmentsCurrent: debtToEdit?.installments?.current,
      installmentsTotal: debtToEdit?.installments?.total,
    });
  }, [debtToEdit, form]);

  const onSubmit = async (values: DebtFormValues) => {
    const debtData: Omit<Debt, 'id' | 'paid' | 'date' | 'avatarUrl'> = {
        person: values.person,
        amount: values.amount,
        reason: values.reason,
    };

    if (values.installmentsCurrent && values.installmentsTotal && values.installmentsTotal > 0) {
        debtData.installments = {
            current: values.installmentsCurrent,
            total: values.installmentsTotal
        }
    } else {
        debtData.installments = undefined;
    }
    
    await onFormSubmit(debtData);
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
                        <Input type="number" placeholder="150.00" {...field} value={field.value ?? ''} />
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
                        <Input type="number" placeholder="1" {...field} value={field.value ?? ''}/>
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
                        <Input type="number" placeholder="12" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Dívida'}
        </Button>
      </form>
    </Form>
  );
}
