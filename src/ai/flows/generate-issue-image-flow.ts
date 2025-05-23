'use server';
/**
 * @fileOverview Generates an image based on a prompt using Genkit.
 *
 * - generateIssueImage - A function that generates an image.
 * - GenerateIssueImageInput - The input type for the generateIssueImage function.
 * - GenerateIssueImageOutput - The return type for the generateIssueImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIssueImageInputSchema = z.object({
  prompt: z.string().describe('A textual prompt to generate an image from.'),
});
export type GenerateIssueImageInput = z.infer<typeof GenerateIssueImageInputSchema>;

const GenerateIssueImageOutputSchema = z.object({
  imageDataUri: z.string().optional().describe('The generated image as a data URI (e.g., data:image/png;base64,...). Optional if generation fails.'),
});
export type GenerateIssueImageOutput = z.infer<typeof GenerateIssueImageOutputSchema>;

// Exported wrapper function
export async function generateIssueImage(input: GenerateIssueImageInput): Promise<GenerateIssueImageOutput> {
  return generateIssueImageFlow(input);
}

// The Genkit flow
const generateIssueImageFlow = ai.defineFlow(
  {
    name: 'generateIssueImageFlow',
    inputSchema: GenerateIssueImageInputSchema,
    outputSchema: GenerateIssueImageOutputSchema,
  },
  async (input) => {
    if (!input.prompt || input.prompt.trim() === '') {
        console.warn('Image generation skipped due to empty prompt.');
        return { imageDataUri: undefined };
    }
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Crucial: Use the image generation capable model
        prompt: `Generate a clear, realistic photo showing: ${input.prompt}`, // Constructing a slightly more descriptive prompt
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both
           safetySettings: [ // Add safety settings to be less restrictive for general images
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (media && media.url) {
        return { imageDataUri: media.url };
      }
      console.warn('Image generation did not return a media URL for prompt:', input.prompt);
      return { imageDataUri: undefined };
    } catch (error) {
      console.error(`Error generating image with Genkit for prompt '${input.prompt}':`, error);
      return { imageDataUri: undefined }; // Return undefined on error to allow fallback to placeholder
    }
  }
);
