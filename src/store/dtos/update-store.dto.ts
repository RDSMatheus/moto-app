import z from 'zod';

export const updateStoreDto = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome é obrigatório').optional(),
  cpfCnpj: z.string().min(1, 'O CPF/CNPJ é obrigatório').optional(),
  email: z.email('Endereço de e-mail inválido').optional(),
  phone: z.string().min(1, 'O telefone é obrigatório').optional(),
  address: z.string().min(1, 'O endereço é obrigatório').optional(),
  refreshToken: z.string().min(1, 'Refresh token must be provided').optional(),
});

export type UpdateStoreDto = z.infer<typeof updateStoreDto>;
