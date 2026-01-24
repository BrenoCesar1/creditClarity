'use client';

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { summarizeSpendingInsights } from '@/ai/flows/summarize-spending';
import { useToast } from '@/hooks/use-toast';

export function SpendingSummaryAI({ transactions }: { transactions: Transaction[] }) {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');

    try {
        const month = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric'});
        const spendingData = JSON.stringify(transactions.map(t => ({
            description: t.description,
            amount: t.amount,
            date: t.date,
            category: t.category,
        })));
      
        const result = await summarizeSpendingInsights({ spendingData, month });

        setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar resumo',
        description: 'Não foi possível se conectar à IA. Tente novamente mais tarde.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> Resumo Inteligente
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Receba insights sobre seus gastos com o poder da IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
        {isSummarizing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Analisando seus dados...</p>
          </div>
        ) : summary ? (
          <p className="text-sm">{summary}</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p>Clique no botão para gerar um resumo dos seus gastos deste mês.</p>
            <Button variant="secondary" onClick={handleSummarize} disabled={isSummarizing}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Gerar Resumo com IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
