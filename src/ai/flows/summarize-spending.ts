'use server';

/**
 * @fileOverview Provides a summarized overview of spending habits each month using AI.
 *
 * - summarizeSpendingInsights - A function that generates a summary of spending insights.
 * - SummarizeSpendingInsightsInput - The input type for the summarizeSpendingInsights function.
 * - SummarizeSpendingInsightsOutput - The return type for the summarizeSpendingInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeSpendingInsightsInputSchema = z.object({
  spendingData: z.string().describe('Spending data in JSON format.'),
  month: z.string().describe('The month for which to summarize spending, e.g., January 2024.'),
});
export type SummarizeSpendingInsightsInput = z.infer<typeof SummarizeSpendingInsightsInputSchema>;

const SummarizeSpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A summarized overview of spending habits for the specified month, highlighting key trends and anomalies.'),
});
export type SummarizeSpendingInsightsOutput = z.infer<typeof SummarizeSpendingInsightsOutputSchema>;

export async function summarizeSpendingInsights(input: SummarizeSpendingInsightsInput): Promise<SummarizeSpendingInsightsOutput> {
  return summarizeSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSpendingInsightsPrompt',
  input: { schema: SummarizeSpendingInsightsInputSchema },
  output: { schema: SummarizeSpendingInsightsOutputSchema },
  prompt: `Você é um assistente de IA ajudando usuários a entender seus hábitos de gastos e fatura do cartão.
  
  Os dados abaixo representam a **FATURA FECHADA** do mês de {{month}}.
  Esta lista inclui:
  1. Compras à vista feitas neste mês.
  2. Parcelas de compras antigas que caíram nesta fatura (indicadas pelo campo 'installments').
  
  **Instruções:**
  - Analise o **VALOR TOTAL** da fatura (some todos os itens fornecidos).
  - Identifique o quanto é "Dívida Parcelada" (compras antigas) vs "Novos Gastos" (compras deste mês).
  - Destaque os maiores gastos desta fatura específica.
  - Forneça dicas baseadas no contexto de que algumas despesas são fixas/parceladas.

  Dados da Fatura:
  {{spendingData}}
  
  Retorne a resposta em formato de parágrafo curto, em português do Brasil. Seja direto, amigável e conversacional. Use valores monetários (R$) no seu resumo.
  `,
});

const summarizeSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingInsightsFlow',
    inputSchema: SummarizeSpendingInsightsInputSchema,
    outputSchema: SummarizeSpendingInsightsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
