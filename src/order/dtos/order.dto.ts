import z from 'zod';

export const OrderStatus = z.enum([
  'PENDING',
  'ACCEPTED',
  'IN_ROUTE',
  'DELIVERED',
  'CANCELLED',
]);

export const createOrderDto = z.object({
  storeId: z.string(),
  totalPrice: z.number(),
  tenantId: z.string(),
});

export const updateOrderDto = z.object({
  status: OrderStatus.optional(),
  courierId: z.string().nullable().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderDto>;
export type UpdateOrderDto = z.infer<typeof updateOrderDto>;
