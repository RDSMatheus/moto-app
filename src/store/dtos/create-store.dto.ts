import z from 'zod';

export const createStoreDto = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  cpfCnpj: z.string().min(1, 'O CPF/CNPJ é obrigatório'),
  email: z.email('Endereço de e-mail inválido'),
  phone: z.string().min(1, 'O telefone é obrigatório'),
  address: z.string().min(1, 'O endereço é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type CreateStoreDto = z.infer<typeof createStoreDto>;
