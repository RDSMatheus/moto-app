import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    console.log(token);

    if (!token) {
      throw new UnauthorizedException(
        'Você precisa estar logado para acessar essa rota',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secret',
      });

      request['user'] = payload;
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'Você precisa estar logado para acessar essa rota',
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(request);

    return type === 'Bearer' ? token : undefined;
  }
}
