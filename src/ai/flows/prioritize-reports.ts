'use server';

/**
 * @fileOverview An AI agent to classify and prioritize incoming issue reports.
 *
 * - prioritizeIssueReports - A function that handles the issue report prioritization process.
 * - PrioritizeIssueReportsInput - The input type for the prioritizeIssueReports function.
 * - PrioritizeIssueReportsOutput - The return type for the prioritizeIssueReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeIssueReportsInputSchema = z.object({
  reportText: z
    .string()
    .describe('The text description of the issue report, provided by the user.'),
});
export type PrioritizeIssueReportsInput = z.infer<typeof PrioritizeIssueReportsInputSchema>;

const PrioritizeIssueReportsOutputSchema = z.object({
  issueType: z.string().describe('The type of issue reported (e.g., pothole, broken streetlight, garbage dump).'),
  severity: z.string().describe('The severity level of the issue (e.g., low, medium, high, critical).'),
  priorityScore: z.number().describe('A numerical score representing the priority of the issue (higher score = higher priority).'),
  reason: z.string().describe('The reason for the assigned issue type, severity, and priority score.'),
});
export type PrioritizeIssueReportsOutput = z.infer<typeof PrioritizeIssueReportsOutputSchema>;

export async function prioritizeIssueReports(input: PrioritizeIssueReportsInput): Promise<PrioritizeIssueReportsOutput> {
  return prioritizeIssueReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeIssueReportsPrompt',
  input: {schema: PrioritizeIssueReportsInputSchema},
  output: {schema: PrioritizeIssueReportsOutputSchema},
  prompt: `You are an AI assistant helping to prioritize civic issue reports. Analyze the issue report text provided by the user and determine the issue type, severity, and a priority score. Also, explain the reason for your assessment.\n\nIssue Report Text: {{{reportText}}}\n\nOutput: Provide the issue type (e.g., pothole, broken streetlight), severity (low, medium, high, critical), a priority score (1-100), and a brief reason for your assessment.`,
});

const prioritizeIssueReportsFlow = ai.defineFlow(
  {
    name: 'prioritizeIssueReportsFlow',
    inputSchema: PrioritizeIssueReportsInputSchema,
    outputSchema: PrioritizeIssueReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
