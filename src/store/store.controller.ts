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
        address: {
          type: 'string',
          example: 'Rua A, 123',
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
  @ApiOperation({ summary: 'Listar todas as lojas.' })
  @ApiResponse({ status: 200, description: 'Lista de lojas retornada.' })
  async findAll() {
    return this.storeService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar loja por ID.' })
  @ApiParam({ name: 'id', description: 'ID da loja', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Loja encontrada.' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
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
  @ApiOperation({ summary: 'Deletar loja.' })
  @ApiParam({ name: 'id', description: 'ID da loja', example: 'uuid-string' })
  @ApiResponse({ status: 200, description: 'Loja deletada.' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }
}
