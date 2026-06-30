import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await firstValueFrom(
        this.authClient.send('auth.verify', { token }),
      );
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}