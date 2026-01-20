'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }).optional(),
  photoURL: z.string().url({ message: 'Por favor, insira uma URL válida.' }).optional(),
});

export function ProfileForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
    },
    mode: 'onChange'
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você não está logado.' });
        return;
    }
    
    const userRef = doc(firestore, 'users', user.uid);

    const dataToUpdate: Partial<UserProfile> = {};
    if (values.displayName) dataToUpdate.displayName = values.displayName;
    if (values.photoURL) dataToUpdate.photoURL = values.photoURL;

    updateDoc(userRef, dataToUpdate)
        .then(() => {
            toast({ title: 'Sucesso!', description: 'Perfil atualizado.' });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'update',
              requestResourceData: dataToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o perfil.' });
        });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={form.watch('photoURL') || user.photoURL || undefined} alt={user.displayName || 'Avatar'} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center">
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
            <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome de Exibição</FormLabel>
                <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="photoURL"
            render={({ field }) => (
                <FormItem>
                <FormLabel>URL da Foto</FormLabel>
                <FormControl>
                    <Input placeholder="https://exemplo.com/sua-foto.jpg" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
            </Button>
        </form>
        </Form>
    </div>
  );
}
