import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Max 120 chars'),
  content: z.string().trim().max(5000, 'Max 5000 chars').optional(),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
