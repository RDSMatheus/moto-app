import z from 'zod';

export const createLinkDto = z.object({
  storeId: z.string(),
  courierId: z.string(),
});

export type CreateLinkDto = z.infer<typeof createLinkDto>;
