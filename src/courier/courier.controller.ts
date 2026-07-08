import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CourierService } from './courier.service';
import type { CreateCourierDto } from './dtos/create-courier.dto';
import { ApiTags } from '@nestjs/swagger';
import type { UpdateCourierDto } from './dtos/update-courier.dto';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { Courier } from '@prisma/client';

@ApiTags('Courier')
@Controller('courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo entregador.',
    description: 'Registra um novo courier no sistema.',
  })
  @ApiResponse({ status: 201, description: 'Entregador criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'CPF ou Email já cadastrado.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João da Silva' },
        email: { type: 'string', format: 'email', example: 'joao@email.com' },
        password: { type: 'string', example: '123456' },
        confirmPassword: { type: 'string', example: '123456' },
        cpf: { type: 'string', example: '12345678900' },
        phone: { type: 'string', example: '27999999999' },
      },
    },
  })
  async createCourier(@Body() data: CreateCourierDto) {
    return this.courierService.createCourier(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Listar todos os entregadores.' })
  @ApiResponse({ status: 200, description: 'Lista de entregadores retornada.' })
  async findAll() {
    return this.courierService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar entregador por ID.' })
  @ApiParam({
    name: 'id',
    description: 'UUID do entregador',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Entregador encontrado.' })
  @ApiResponse({ status: 404, description: 'Entregador não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.courierService.findOne(id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar entregador.' })
  @ApiResponse({
    status: 200,
    description: 'Entregador atualizado com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Entregador não encontrado.' })
  @ApiResponse({ status: 409, description: 'Novo email ou CPF já em uso.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        name: { type: 'string', example: 'João Silva Atualizado' },
        email: {
          type: 'string',
          format: 'email',
          example: 'joao.novo@email.com',
        },
        phone: { type: 'string', example: '27988888888' },
        password: { type: 'string', example: 'novaSenha123' },
        cpf: { type: 'string', example: '98765432100' },
      },
    },
  })
  async update(@Body() data: Courier) {
    return this.courierService.update(data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Deletar entregador.' })
  @ApiParam({
    name: 'id',
    description: 'UUID do entregador',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Entregador deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Entregador não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.courierService.remove(id);
  }
}
