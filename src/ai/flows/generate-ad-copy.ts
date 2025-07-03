// use server'
'use server';
/**
 * @fileOverview AI-powered ad copy generation for car listings.
 *
 * - generateAdCopy - Generates ad copy based on car details.
 * - GenerateAdCopyInput - Input type for the generateAdCopy function.
 * - GenerateAdCopyOutput - Return type for the generateAdCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdCopyInputSchema = z.object({
  make: z.string().describe('The make of the car (e.g., Toyota).'),
  model: z.string().describe('The model of the car (e.g., Camry).'),
  year: z.number().describe('The year the car was manufactured.'),
  mileage: z.number().describe('The mileage of the car.'),
  condition: z.string().describe('The condition of the car (e.g., Excellent, Good, Fair).'),
  features: z.array(z.string()).describe('Key features of the car, separated by commas (e.g., Leather seats, Sunroof, Navigation).'),
  price: z.number().describe('The asking price for the car.'),
});

export type GenerateAdCopyInput = z.infer<typeof GenerateAdCopyInputSchema>;

const GenerateAdCopyOutputSchema = z.object({
  adCopy: z.string().describe('The generated ad copy for the car listing.'),
});

export type GenerateAdCopyOutput = z.infer<typeof GenerateAdCopyOutputSchema>;

export async function generateAdCopy(input: GenerateAdCopyInput): Promise<GenerateAdCopyOutput> {
  return generateAdCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyPrompt',
  input: {schema: GenerateAdCopyInputSchema},
  output: {schema: GenerateAdCopyOutputSchema},
  prompt: `You are an expert copywriter specializing in writing compelling ad copy for cars.

  Given the following details about a car, generate an ad copy that is likely to attract potential buyers. The ad copy should be concise, engaging, and highlight the key features and benefits of the car.

  Make: {{{make}}}
  Model: {{{model}}}
  Year: {{{year}}}
  Mileage: {{{mileage}}}
  Condition: {{{condition}}}
  Features: {{{features}}}
  Price: {{{price}}}
  `,
});

const generateAdCopyFlow = ai.defineFlow(
  {
    name: 'generateAdCopyFlow',
    inputSchema: GenerateAdCopyInputSchema,
    outputSchema: GenerateAdCopyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
