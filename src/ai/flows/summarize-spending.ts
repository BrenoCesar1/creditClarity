'use server';

/**
 * @fileOverview Provides a summarized overview of spending habits each month using AI.
 *
 * - summarizeSpendingInsights - A function that generates a summary of spending insights.
 * - SummarizeSpendingInsightsInput - The input type for the summarizeSpendingInsights function.
 * - SummarizeSpendingInsightsOutput - The return type for the summarizeSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: SummarizeSpendingInsightsInputSchema},
  output: {schema: SummarizeSpendingInsightsOutputSchema},
  prompt: `You are an AI assistant helping users understand their spending habits.

  Analyze the following spending data for the month of {{month}} and provide a concise summary of key trends and anomalies. Focus on identifying areas for potential savings and better financial management.

  Spending Data:
  {{spendingData}}
  \nOutput the response in a paragraph format. Be friendly and conversational, so it feels natural.
  `,
});

const summarizeSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingInsightsFlow',
    inputSchema: SummarizeSpendingInsightsInputSchema,
    outputSchema: SummarizeSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
