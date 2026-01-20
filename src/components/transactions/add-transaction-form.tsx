'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useData } from '@/context/data-context';

const transactionSchema = z.object({
  description: z.string().min(2, { message: 'A descrição deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  cardId: z.string({ required_error: 'Selecione um cartão.' }),
  date: z.date({ required_error: 'Selecione uma data.' }),
  installmentsCurrent: z.coerce.number().optional(),
  installmentsTotal: z.coerce.number().optional(),
});

export function AddTransactionForm({ onAddTransaction }: { onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void }) {
  const { toast } = useToast();
  const { cards } = useData();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      date: new Date(),
    },
  });

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    const transactionData: Omit<Transaction, 'id'> = {
        description: values.description,
        amount: values.amount,
        cardId: values.cardId,
        date: values.date.toISOString(),
    };

    if (values.installmentsCurrent && values.installmentsTotal && values.installmentsTotal > 0) {
        transactionData.installments = {
            current: values.installmentsCurrent,
            total: values.installmentsTotal
        }
    }
    
    onAddTransaction(transactionData);
    toast({ title: 'Sucesso!', description: 'Transação adicionada.' });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cardId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cartão</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={cards.length === 0}>
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
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Transação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { })
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
          Adicionar Transação
        </Button>
      </form>
    </Form>
  );
}
