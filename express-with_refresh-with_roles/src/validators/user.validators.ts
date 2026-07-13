import { z } from 'zod';

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

export type SetActiveDto = z.infer<typeof setActiveSchema>;
