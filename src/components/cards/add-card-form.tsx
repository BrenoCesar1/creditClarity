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
    onCancel: () => void;
    cardToEdit?: Card | null;
}

export function AddCardForm({ onFormSubmit, onCancel, cardToEdit }: AddCardFormProps) {
  const isEditMode = !!cardToEdit;
  
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: cardToEdit?.name || '',
      brand: cardToEdit?.brand || undefined,
      last4: cardToEdit?.last4 || '',
      expiry: cardToEdit?.expiry || '',
      dueDate: cardToEdit?.dueDate || undefined,
    }
  });

  const onSubmit = async (values: CardFormValues) => {
    await onFormSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cartão Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Bandeira</FormLabel>
                <Select modal={false} onValueChange={field.onChange} value={field.value}>
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
                <FormItem className="col-span-2 sm:col-span-1">
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
                <FormItem className="col-span-1">
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
                <FormItem className="col-span-1">
                <FormLabel>Dia do Vencimento</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="Ex: 10" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Cartão'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
