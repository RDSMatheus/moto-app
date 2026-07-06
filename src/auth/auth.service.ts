import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash/hash.service';
import { StoreService } from 'src/store/store.service';
import { LoginDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly storeService: StoreService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async signInStore(
    data: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = data;
    const store = await this.storeService.findByEmail(email);

    if (!store) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await this.hashService.compare({
      hashedString: store.password,
      string: password,
    });

    console.log(passwordMatch);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: store.id,
      tenant: store.tenantId,
      store,
    };

    const refreshToken = await this.jwtService.signAsync(
      { type: 'refresh', storeId: store.id },
      { expiresIn: '1h', secret: process.env.JWT_SECRET || 'secret' },
    );

    const accessToken = await this.jwtService.signAsync(
      { payload },
      { expiresIn: '15m', secret: process.env.JWT_SECRET || 'secret' },
    );

    const hashToken = await this.hashService.hash(refreshToken);

    await this.storeService.update({ id: store.id, refreshToken: hashToken });

    return {
      refreshToken,
      accessToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = this.jwtService.decode(refreshToken);

      if (!decoded?.storeId) {
        throw new UnauthorizedException('Invalid token structure');
      }

      const store = await this.storeService.findOne(decoded.storeId);

      if (!store) {
        throw new NotFoundException('Store not found');
      }

      if (!store.refreshToken) {
        throw new UnauthorizedException('No refresh token found');
      }

      const isTokenValid = await this.hashService.compare({
        string: refreshToken,
        hashedString: store.refreshToken,
      });

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const payload = {
        sub: store.id,
        tenant: store.tenantId,
        store,
      };

      const newAccessToken = await this.jwtService.signAsync(
        { payload },
        { expiresIn: '15m', secret: process.env.JWT_SECRET || 'secret' },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        { type: 'refresh', storeId: store.id },
        { expiresIn: '1h', secret: process.env.JWT_SECRET || 'secret' },
      );

      const hashNewToken = await this.hashService.hash(newRefreshToken);

      await this.storeService.update({
        id: store.id,
        refreshToken: hashNewToken,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.log(error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(refreshToken) as {
        storeId: string;
      };
      if (!decoded?.storeId) return;

      const store = await this.storeService.findOne(decoded.storeId);
      if (!store) return;

      await this.storeService.update({ id: store.id, refreshToken: '' });
    } catch (error) {
      console.error('Error during logout', error);
    }
  }
}
