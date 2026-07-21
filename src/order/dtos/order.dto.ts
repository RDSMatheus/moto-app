import z from 'zod';

export const OrderStatus = z.enum([
  'PENDING',
  'ACCEPTED',
  'ARRIVED_AT_STORE',
  'IN_ROUTE',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED',
]);

export const createOrderDto = z.object({
  storeId: z.string(),
  tenantId: z.string(),
  totalPrice: z.number(),
  phone: z.string().min(1, 'Informe o número do cliente'),
  state: z.string().min(1, 'O estado é obrigatório'),
  street: z.string().min(1, 'A rua é obrigatória'),
  neighborhood: z.string().min(1, 'O bairro é obrigatório'),
  zipCode: z.string().min(1, 'O CEP é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  complement: z.string().optional(),
  number: z.string().min(1, 'O número é obrigatório'),
  courierId: z.string().nullable().optional(),
  status: OrderStatus.optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderDto>;

export const updateOrderDto = z.object({
  status: OrderStatus.optional(),
  courierId: z.string().nullable().optional(),
});

export type UpdateOrderDto = z.infer<typeof updateOrderDto>;
