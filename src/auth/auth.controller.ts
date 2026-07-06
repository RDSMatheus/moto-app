import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { LoginDto } from './dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/store')
  @ApiOperation({
    summary: 'Login da Loja',
    description: 'Gera tokens de acesso para o tenant da loja',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'loja@exemplo.com' },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async loginStore(@Body() body: LoginDto) {
    return await this.authService.signInStore(body);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar Token',
    description:
      'Utiliza o refresh_token enviado no header para obter um novo access_token',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token armazenado no banco de dados',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou revogado',
  })
  async refresh(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Invalida o refresh_token atual',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token atual a ser invalidado',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  async logout(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    await this.authService.logout(refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }
}
