import { z } from 'zod';

export const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().describe('Question. Do not use emojis or links.'),
      back: z.string().describe('Answer. Do not use emojis or links.'),
    })
  ),
});

export const quizSchema = z.object({
  quizzes: z.array(
    z.object({
      question: z.string().describe('Question. Do not use emojis or links.'),
      quiz_options: z.array(
        z.object({
          value: z.string().describe('Option. Do not use emojis or links.'),
          explanation: z
            .string()
            .describe(
              'Explain why this option is correct or incorrect, if it is incorrect, explain possible misconceptions and what made the option wrong with respect to the question, if it is correct, explain why it is correct. Be as detailed as possible.'
            ),
          is_correct: z.boolean().describe('This option is a correct answer.'),
        })
      ),
    })
  ),
});

export const quizOptionExplanationSchema = z.object({
  explanation: z
    .string()
    .describe(
      'Explain why this option is correct or incorrect, if it is incorrect, explain possible misconceptions and what made the option wrong with respect to the question, if it is correct, explain why it is correct. Be as detailed as possible.'
    ),
});
