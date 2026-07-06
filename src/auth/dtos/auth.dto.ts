import z from 'zod';

export const loginDto = z.object({
  email: z.email({ message: 'Invalid email' }),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof loginDto>;
