import z from 'zod';

export const createStoreDto = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  cpfCnpj: z.string().min(1, 'O CPF/CNPJ é obrigatório'),
  email: z.email('Endereço de e-mail inválido'),
  phone: z.string().min(1, 'O telefone é obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  // Campos de localização extras baseados no Schema Prisma
  state: z.string().min(1, 'O estado é obrigatório'),
  street: z.string().min(1, 'A rua é obrigatória'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  neighborhood: z.string().min(1, 'O bairro é obrigatório'),
  zipCode: z.string().min(1, 'O CEP é obrigatório'),
  complement: z.string().optional(),
  number: z.string().min(1, 'O número é obrigatório'),
});

export type CreateStoreDto = z.infer<typeof createStoreDto>;
