import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { GatewayPatchProfileDto } from './dto/gateway-profile.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('api/v1/profile')
@UseFilters(RpcExceptionFilter)
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('BITACORA_SERVICE') private readonly bitacoraClient: ClientProxy,
  ) {}

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.buildProfileResponse(req.user.userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @Body() dto: GatewayPatchProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (dto.nombre) {
      await firstValueFrom(
        this.authClient.send('auth.update-name', {
          userId: req.user.userId,
          nombre: dto.nombre,
        }),
      );
    }
    return this.buildProfileResponse(req.user.userId);
  }

  private async buildProfileResponse(userId: string) {
    const [usuario, parcelas] = await Promise.all([
      firstValueFrom(this.authClient.send('auth.me', { userId })),
      firstValueFrom(
        this.bitacoraClient.send('parcela.list', { userId }),
      ).catch(() => []),
    ]);

    const parcelaNombre =
      Array.isArray(parcelas) && parcelas.length > 0
        ? parcelas[0].nombre
        : null;

    return {
      nombre: usuario.nombre,
      email: usuario.email,
      passwordHash: usuario.passwordHash,
      parcelaNombre,
    };
  }
}
