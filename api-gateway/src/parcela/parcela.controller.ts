import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { CreateParcelaDto } from './dto/gateway-parcela.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('api/v1/parcelas')
@UseFilters(RpcExceptionFilter)
@UseGuards(AuthGuard)
export class ParcelaController {
  constructor(
    @Inject('BITACORA_SERVICE') private readonly bitacoraClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateParcelaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await firstValueFrom(
      this.bitacoraClient.send('parcela.create', {
        userId: req.user.userId,
        ...dto,
      }),
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return await firstValueFrom(
      this.bitacoraClient.send('parcela.list', {
        userId: req.user.userId,
      }),
    );
  }

  @Get('tiene')
  async tiene(@Req() req: AuthenticatedRequest) {
    return await firstValueFrom(
      this.bitacoraClient.send('parcela.hasParcela', {
        userId: req.user.userId,
      }),
    );
  }
}