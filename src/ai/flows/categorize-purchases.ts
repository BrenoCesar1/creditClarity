'use server';

/**
 * @fileOverview Automatically categorizes credit card purchases using AI.
 *
 * - categorizePurchases - A function that categorizes a list of purchases.
 * - CategorizePurchasesInput - The input type for the categorizePurchases function.
 * - CategorizePurchasesOutput - The return type for the categorizePurchases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizePurchasesInputSchema = z.object({
  purchases: z.array(
    z.object({
      description: z.string().describe('The description of the purchase.'),
      amount: z.number().describe('The amount of the purchase.'),
    })
  ).describe('A list of credit card purchases to categorize.'),
});
export type CategorizePurchasesInput = z.infer<typeof CategorizePurchasesInputSchema>;

const CategorizePurchasesOutputSchema = z.object({
  categories: z.array(
    z.object({
      description: z.string().describe('The description of the purchase.'),
      category: z.string().describe('The category of the purchase (e.g., food, transportation, entertainment).'),
      amount: z.number().describe('The amount of the purchase.'),
    })
  ).describe('A list of purchases with their categories.'),
});
export type CategorizePurchasesOutput = z.infer<typeof CategorizePurchasesOutputSchema>;

export async function categorizePurchases(input: CategorizePurchasesInput): Promise<CategorizePurchasesOutput> {
  return categorizePurchasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizePurchasesPrompt',
  input: {schema: CategorizePurchasesInputSchema},
  output: {schema: CategorizePurchasesOutputSchema},
  prompt: `You are a personal finance expert. Your task is to categorize credit card purchases.

Given the following list of purchases, categorize each purchase into one of the following categories: food, transportation, entertainment, utilities, or other.

Purchases:
{{#each purchases}}
- Description: {{this.description}}, Amount: {{this.amount}}
{{/each}}

Return a JSON object with the following format:
{
  "categories": [
    {
      "description": "Description of the purchase",
      "category": "Category of the purchase",
      "amount": Amount of the purchase
    }
  ]
}
`,
});

const categorizePurchasesFlow = ai.defineFlow(
  {
    name: 'categorizePurchasesFlow',
    inputSchema: CategorizePurchasesInputSchema,
    outputSchema: CategorizePurchasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
