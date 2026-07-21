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
import type { CreateStoreDto } from './dtos/create-store.dto';
import { StoreService } from './store.service';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UpdateStoreDto } from './dtos/update-store.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar loja.',
    description: 'Cria loja e tenant associados.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Loja Centro',
        },
        phone: {
          type: 'string',
          example: '27999999999',
        },
        number: {
          type: 'string',
          example: '40',
        },
        complement: {
          type: 'string',
          example: 'Apto 1',
        },
        neighborhood: {
          type: 'string',
          example: 'Centro',
        },
        street: {
          type: 'string',
          example: 'Avenida Expedito Garcia',
        },
        city: {
          type: 'string',
          example: 'Cariacica',
        },
        state: {
          type: 'string',
          example: 'ES',
        },
        zipCode: {
          type: 'string',
          example: '29146-200',
        },
        country: {
          type: 'string',
          example: 'Brasil',
        },
        cpfCnpj: {
          type: 'string',
          example: '12.345.678/0001-99',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'loja@centro.com',
        },
        password: {
          type: 'string',
          example: '123456',
        },
        confirmPassword: {
          type: 'string',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso.' })
  async createStore(@Body() data: CreateStoreDto) {
    const store = await this.storeService.createStore(data);
    return store;
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Listar todas as lojas.' })
  @ApiResponse({ status: 200, description: 'Lista de lojas retornada.' })
  async findAll() {
    return this.storeService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Buscar loja por ID.' })
  @ApiParam({ name: 'id', description: 'ID da loja', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Loja encontrada.' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Atualizar loja.' })
  @ApiParam({ name: 'id', description: 'ID da loja', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Loja atualizada.' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Loja Atualizada',
        },
        phone: {
          type: 'string',
          example: '27988888888',
        },
        address: {
          type: 'string',
          example: 'Rua Atualizada, 456',
        },
        cpfCnpj: {
          type: 'string',
          example: '12.345.678/0001-99',
        },
      },
    },
  })
  async update(@Param('id') id: string, @Body() data: UpdateStoreDto) {
    return this.storeService.update({ ...data, id });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiHeader({
    name: 'authorization',
    description: 'Refresh token enviado no header authorization',
    required: true,
    example: 'Bearer 123456789',
  })
  @ApiOperation({ summary: 'Deletar loja.' })
  @ApiParam({ name: 'id', description: 'ID da loja', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Loja deletada.' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }
}
