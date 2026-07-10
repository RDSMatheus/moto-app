import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { StoreCourierService } from './store-courier.service';
import type { CreateLinkDto } from './dtos/create-link.dto';
import { StoreCourierStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Store Courier')
@Controller('store-courier')
export class StoreCourierController {
  constructor(private readonly storeCourierService: StoreCourierService) {}

  @Post()
  @ApiOperation({ summary: 'Criar link entre loja e motoboy.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        storeId: { type: 'string', example: 'uuid-string' },
        courierId: { type: 'string', example: 'uuid-string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Link criado com sucesso.' })
  async create(@Body() data: CreateLinkDto) {
    return await this.storeCourierService.createLink(data);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Listar todos os links entre lojas e motobays.' })
  @ApiResponse({ status: 200, description: 'Lista de links retornada.' })
  async findAll() {
    return await this.storeCourierService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Buscar link por ID.' })
  @ApiParam({ name: 'id', description: 'ID do link', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Link encontrado.' })
  @ApiResponse({ status: 404, description: 'Link não encontrado.' })
  async findOne(@Param('id') id: string) {
    return await this.storeCourierService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Atualizar link entre loja e motoboy.' })
  @ApiParam({ name: 'id', description: 'ID do link', example: 'uuid-string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'ACTIVE', 'BLOCKED', 'KICKED'],
          example: 'ACTIVE',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Link atualizado.' })
  @ApiResponse({ status: 404, description: 'Link não encontrado.' })
  async update(
    @Param('id') id: string,
    @Body()
    data: Partial<Omit<CreateLinkDto, 'storeId' | 'courierId'>> & {
      status?: StoreCourierStatus;
    },
  ) {
    return await this.storeCourierService.updateLink(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Deletar link entre loja e motoboy.' })
  @ApiParam({ name: 'id', description: 'ID do link', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Link deletado.' })
  @ApiResponse({ status: 404, description: 'Link não encontrado.' })
  async remove(@Param('id') id: string) {
    return await this.storeCourierService.removeLink(id);
  }
}
