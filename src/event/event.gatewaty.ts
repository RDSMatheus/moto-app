import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Order } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { CourierService } from 'src/courier/courier.service';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Events (WebSocket)')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly orderService: OrderService,
    private readonly courierService: CourierService,
  ) {}

  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  @OnEvent('order.created')
  handleOrderCreated(order: Order) {
    this.server.to(`store:${order.storeId}:couriers`).emit('order:new', order);
    this.logger.log(
      `Pedido ${order.id} emitido pra room store:${order.storeId}:couriers`,
    );
  }

  @OnEvent('order.delivered')
  handleOrderDeliveredEvent(order: Order) {
    this.server.to(`store:${order.storeId}`).emit('order:delivered', order);
  }

  @OnEvent('order.arrived')
  handleOrderArrivedEvent(order: Order) {
    this.server.to(`store:${order.storeId}`).emit('order:arrived', order);
  }

  @OnEvent('order.in_route')
  handleOrderInRouteEvent(order: Order) {
    this.server.to(`store:${order.storeId}`).emit('order:in_route', order);
  }

  @OnEvent('order.accepted')
  @ApiOperation({ summary: 'Aceita um pedido (somente para motoboys)' })
  @ApiBody({
    description: 'Payload JSON com orderId, courierId e storeId',
    schema: {
      example: {
        orderId: 1,
        courierId: 'user-uuid',
        storeId: 'store-uuid',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso ao aceitar o pedido',
    schema: {
      example: {
        event: 'order:accept:success',
        data: {/* dados do order */},
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao aceitar o pedido',
    schema: {
      example: {
        event: 'order:accept:error',
        data: 'Mensagem de erro',
      },
    },
  })
  handleOrderAccepted(order: Order) {
    this.server.to(`store:${order.storeId}`).emit('order:accepted', order);

    this.server.to(`store:${order.storeId}:couriers`).emit('order:taken', {
      orderId: order.id,
    });

    this.logger.log(`Pedido ${order.id} aceito — loja e motoboys avisados`);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const verifiedToken = this.jwtService.verify(token);
      client.data.userId = verifiedToken.sub;
      client.data.role = verifiedToken.role;

      this.logger.log(verifiedToken);

      if (verifiedToken.role === 'courier') {
        await this.joinCourierRooms(client, verifiedToken.payload.sub);
      }

      if (verifiedToken.role === 'store') {
        client.join(`store:${verifiedToken.payload.sub}`);
        this.logger.log(
          `Loja ${verifiedToken.payload.store.name} entrou na própria room`,
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Falha na autenticação do socket: ${err.message}`);
        client.disconnect();
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Desconectado: ${client.id}`);
  }

  @SubscribeMessage('order:arrived')
  async handleOrderArrived(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'courier') {
      return {
        event: 'order:accept:error',
        data: 'Apenas motoboys podem aceitar pedidos',
      };
    }

    try {
      const dataParsed: {
        orderId: number;
        courierId: string;
        storeId: string;
      } = JSON.parse(data);

      if (!dataParsed)
        throw new UnprocessableEntityException('Invalid json format');

      const { courierId, orderId, storeId } = dataParsed;

      const order = await this.orderService.markArrived({
        courierId,
        orderId,
      });

      this.logger.log('Courier arrived at the order');

      return { event: 'order:arrived:success', data: order };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao marcar que chegou na loja';
      this.logger.warn(`Falha ao marcar que chegou: ${message}`);
      return { event: 'order:arrived:error', data: message };
    }
  }

  @SubscribeMessage('order:accept')
  async handleOrderAccept(
    @MessageBody()
    data: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'courier') {
      return {
        event: 'order:accept:error',
        data: 'Apenas motoboys podem aceitar pedidos',
      };
    }

    try {
      const dataParsed: {
        orderId: number;
        courierId: string;
        storeId: string;
      } = JSON.parse(data);

      if (!dataParsed)
        throw new UnprocessableEntityException('Invalid json format');

      console.log(dataParsed);

      const { courierId, orderId, storeId } = dataParsed;

      const order = await this.orderService.acceptOrder({
        courierId,
        orderId,
        storeId,
      });

      this.logger.log('Order accepted successfully');

      return { event: 'order:accept:success', data: order };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao aceitar pedido';
      this.logger.warn(`Falha ao aceitar pedido: ${message}`);
      return { event: 'order:accept:error', data: message };
    }
  }

  @SubscribeMessage('order:in_route')
  async handleOrderInRoute(
    @MessageBody()
    data: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'courier') {
      return {
        event: 'order:in_route:error',
        data: 'Apenas motoboys podem aceitar pedidos',
      };
    }

    try {
      const dataParsed: {
        orderId: number;
        courierId: string;
        storeId: string;
      } = JSON.parse(data);

      if (!dataParsed)
        throw new UnprocessableEntityException('Invalid json format');

      const { courierId, orderId, storeId } = dataParsed;

      const order = await this.orderService.inRoute({
        courierId,
        orderId,
        storeId,
      });

      this.logger.log(`Order ${orderId} in route`);

      return { event: 'order:in_route:success', data: order };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao aceitar pedido';
      this.logger.warn(`Falha ao aceitar pedido: ${message}`);
      return { event: 'order:in_route:error', data: message };
    }
  }

  @SubscribeMessage('order:delivered')
  async handleOrderDelivered(
    @MessageBody()
    data: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'courier') {
      return {
        event: 'order:delivered:error',
        data: 'Apenas motoboys podem finalizar pedidos',
      };
    }

    try {
      const dataParsed: {
        orderId: number;
        courierId: string;
        storeId: string;
      } = JSON.parse(data);

      if (!dataParsed)
        throw new UnprocessableEntityException('Invalid json format');

      const { courierId, orderId, storeId } = dataParsed;

      const order = await this.orderService.delivered({
        courierId,
        orderId,
        storeId,
      });

      this.logger.log(`Order ${orderId} delivered`);

      return { event: 'order:delivered:success', data: order };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao aceitar pedido';
      this.logger.warn(`Falha ao aceitar pedido: ${message}`);
      return { event: 'order:delivered:error', data: message };
    }
  }

  @SubscribeMessage('courier:location')
  async handleCourierLocation(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (client.data.role !== 'courier') return;

    try {
      const dataParsed: {
        latitude: number;
        courierId: string;
        longitude: number;
      } = JSON.parse(data);

      if (!dataParsed)
        throw new UnprocessableEntityException('Invalid json format');

      const { courierId, latitude, longitude } = dataParsed;

      const location = await this.courierService.updateLocation({
        courierId,
        latitude,
        longitude,
      });

      this.logger.log('Location Updated Successfully');

      return { event: 'courier:location:success', data: location };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar localização';
      this.logger.warn(`Falha ao atualizar localização: ${message}`);
      return { event: 'courier:location:error', data: message };
    }
  }

  private async joinCourierRooms(client: Socket, courierId: string) {
    try {
      const activeLinks = await this.prisma.storeCourier.findMany({
        where: {
          courierId,
          status: 'ACTIVE',
        },
        select: { storeId: true },
      });

      if (!activeLinks.length)
        throw new NotFoundException('No active links found');

      this.logger.log(activeLinks);

      activeLinks.forEach(({ storeId }) => {
        client.join(`store:${storeId}:couriers`);
      });

      this.logger.log(
        `Motoboy ${courierId} entrou em ${activeLinks.length} rooms de lojas ativas`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
