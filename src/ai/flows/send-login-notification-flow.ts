'use server';
/**
 * @fileOverview A Genkit flow to generate content for a login notification email.
 *
 * - sendLoginNotification - Generates the subject and body for a login notification.
 * - SendLoginNotificationInput - Input type for the sendLoginNotification function.
 * - SendLoginNotificationOutput - Return type for the sendLoginNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendLoginNotificationInputSchema = z.object({
  adminEmail: z.string().email().describe("The admin's email address to which the notification pertains."),
  loginTimestamp: z.string().datetime().describe('The ISO 8601 timestamp of the login event.'),
});
export type SendLoginNotificationInput = z.infer<typeof SendLoginNotificationInputSchema>;

const SendLoginNotificationOutputSchema = z.object({
  emailSubject: z.string().describe('The subject line for the login notification email.'),
  emailBody: z.string().describe('The body content for the login notification email.'),
});
export type SendLoginNotificationOutput = z.infer<typeof SendLoginNotificationOutputSchema>;

export async function sendLoginNotification(input: SendLoginNotificationInput): Promise<SendLoginNotificationOutput> {
  return sendLoginNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendLoginNotificationPrompt',
  input: {schema: SendLoginNotificationInputSchema},
  output: {schema: SendLoginNotificationOutputSchema},
  prompt: `You are a security notification system.
Given the admin's email address and a login timestamp, generate a concise subject and body for a login notification email.

Admin Email: {{{adminEmail}}}
Login Timestamp: {{{loginTimestamp}}}

The email subject should clearly indicate a security alert or login notification.
The email body should inform the admin about a new login to their account for YourCar.
Include the login timestamp in the email body (formatted nicely, e.g., "YYYY-MM-DD HH:MM:SS UTC").
Advise the admin to contact support immediately if they do not recognize this activity.
Keep the email professional and to the point.
Do not include any preambles like "Here's the subject and body:" in your output.
`,
});

const sendLoginNotificationFlow = ai.defineFlow(
  {
    name: 'sendLoginNotificationFlow',
    inputSchema: SendLoginNotificationInputSchema,
    outputSchema: SendLoginNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
