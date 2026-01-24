'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '@/context/data-context';

const transactionSchema = z.object({
  description: z.string().min(2, { message: 'A descrição deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  cardId: z.string({ required_error: 'Selecione um cartão.' }),
  date: z.date({ required_error: 'Selecione uma data.' }),
  installmentsCurrent: z.coerce.number().optional(),
  installmentsTotal: z.coerce.number().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionFormProps {
    onFormSubmit: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    onCancel: () => void;
    transactionToEdit?: Transaction | null;
}

export function AddTransactionForm({ onFormSubmit, onCancel, transactionToEdit }: AddTransactionFormProps) {
  const { cards } = useData();
  const isEditMode = !!transactionToEdit;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transactionToEdit?.description || '',
      amount: transactionToEdit?.amount || undefined,
      cardId: transactionToEdit?.cardId || undefined,
      date: transactionToEdit ? new Date(transactionToEdit.date) : new Date(),
      installmentsCurrent: transactionToEdit?.installments?.current || undefined,
      installmentsTotal: transactionToEdit?.installments?.total || undefined,
    }
  });

  const onSubmit = async (values: TransactionFormValues) => {
    const transactionData: Omit<Transaction, 'id'> = {
        description: values.description,
        amount: values.amount,
        cardId: values.cardId,
        date: values.date.toISOString(),
        category: isEditMode ? transactionToEdit?.category : undefined,
    };

    if (values.installmentsCurrent && values.installmentsTotal && values.installmentsTotal > 0) {
        transactionData.installments = {
            current: values.installmentsCurrent,
            total: values.installmentsTotal
        }
    } else {
        transactionData.installments = undefined;
    }
    
    await onFormSubmit(transactionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                    <Input placeholder="Ex: Almoço no restaurante" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-6 items-end gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-2">
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="150.00" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cardId"
                    render={({ field }) => (
                        <FormItem className="col-span-6 sm:col-span-2">
                        <FormLabel>Cartão</FormLabel>
                        <Select modal={false} onValueChange={field.onChange} value={field.value} disabled={cards.length === 0}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={cards.length === 0 ? "Nenhum cartão" : "Selecione o cartão"} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {cards?.map(card => (
                                    <SelectItem key={card.id} value={card.id}>{card.name} (final {card.last4})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="col-span-6 sm:col-span-2">
                      <FormLabel>Data da Transação</FormLabel>
                      <Popover modal={false}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="installmentsCurrent"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Parcela Atual (opcional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1" {...field} value={field.value ?? ''} />
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
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Transação'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
