'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Card } from '@/lib/types';
import { useEffect } from 'react';

const cardSchema = z.object({
  name: z.string().min(2, { message: 'O nome do cartão deve ter pelo menos 2 caracteres.' }),
  brand: z.enum(['visa', 'mastercard', 'amex', 'elo'], { required_error: 'Selecione uma bandeira.' }),
  last4: z.string().length(4, { message: 'Os últimos 4 dígitos são obrigatórios.' }).regex(/^\d{4}$/, { message: 'Apenas números são permitidos.'}),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Use o formato MM/AA.' }),
  dueDate: z.coerce.number().min(1, { message: 'O dia deve ser entre 1 e 31.' }).max(31, { message: 'O dia deve ser entre 1 e 31.' }),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface AddCardFormProps {
    onFormSubmit: (values: CardFormValues) => Promise<void>;
    cardToEdit?: Card | null;
}

export function AddCardForm({ onFormSubmit, cardToEdit }: AddCardFormProps) {
  const isEditMode = !!cardToEdit;
  
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
  });

  useEffect(() => {
    form.reset({
      name: cardToEdit?.name || '',
      brand: cardToEdit?.brand,
      last4: cardToEdit?.last4 || '',
      expiry: cardToEdit?.expiry || '',
      dueDate: cardToEdit?.dueDate,
    });
  }, [cardToEdit, form]);

  const onSubmit = async (values: CardFormValues) => {
    await onFormSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cartão</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Cartão Principal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Bandeira</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                        <SelectItem value="elo">Elo</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="last4"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Últimos 4 dígitos</FormLabel>
                <FormControl>
                    <Input placeholder="1234" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="expiry"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Validade (MM/AA)</FormLabel>
                <FormControl>
                    <Input placeholder="12/26" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Dia do Vencimento</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="Ex: 10" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Cartão'}
        </Button>
      </form>
    </Form>
  );
}
