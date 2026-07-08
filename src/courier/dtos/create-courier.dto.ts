import z from 'zod';

export const createCourierDto = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.email('Endereço de e-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  cpf: z.string().min(11, 'O CPF deve ter 11 dígitos'),
  confirmPassword: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z.string().min(1, 'O telefone é obrigatório'),
  isOnline: z.boolean().default(false),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
});

export type CreateCourierDto = z.infer<typeof createCourierDto>;
