import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
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
  @HttpCode(HttpStatus.OK)
  async loginStore(@Body() body: LoginDto) {
    return await this.authService.signInStore(body);
  }

  @Post('login/courier')
  @ApiOperation({
    summary: 'Login do Courier',
    description: 'Gera tokens de acesso para o courier',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'courier@exemplo.com',
        },
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
  @HttpCode(HttpStatus.OK)
  async loginCourier(@Body() loginCourier: LoginDto) {
    return await this.authService.signInCourier(loginCourier);
  }

  @Post('refresh/store')
  @ApiOperation({
    summary: 'Renovar Token',
    description:
      'Utiliza o refresh_token enviado no header para obter um novo access_token',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token enviado no header x-refresh-token',
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
  @HttpCode(HttpStatus.OK)
  async refreshStore(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    return this.authService.refreshAccessTokenStore(refreshToken);
  }

  @Post('refresh/courier')
  @ApiOperation({
    summary: 'Renovar Token do Courier',
    description:
      'Utiliza o refresh_token enviado no header para obter um novo access_token do courier',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token enviado no header x-refresh-token',
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
  @HttpCode(HttpStatus.OK)
  async refreshCourier(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    return this.authService.refreshAccessTokenCourier(refreshToken);
  }

  @Post('logout/store')
  @ApiOperation({
    summary: 'Logout do Store',
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
  async logoutStore(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    await this.authService.logoutStore(refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }

  @Post('logout/courier')
  @ApiOperation({
    summary: 'Logout do Courier',
    description: 'Invalida o refresh_token atual do courier',
  })
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'Refresh token atual a ser invalidado do courier',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  async logoutCourier(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required in header');
    }
    await this.authService.logoutCourier(refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }
}
