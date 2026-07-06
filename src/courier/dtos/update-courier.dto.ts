import { PartialType } from '@nestjs/mapped-types';
import { createCourierDto } from './create-courier.dto';

import z from 'zod';

export const updateCourierDto = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'O nome é obrigatório').optional(),
  email: z.email('Endereço de e-mail inválido').optional(),
  phone: z.string().min(1, 'O telefone é obrigatório').optional(),
  password: z.string().min(6).optional(),
  cpf: z.string().min(11).optional(),
});

export type UpdateCourierDto = z.infer<typeof updateCourierDto>;
