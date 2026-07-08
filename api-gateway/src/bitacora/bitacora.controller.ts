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
import { CreateBitacoraDto } from './dto/gateway-bitacora.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('api/v1/bitacoras')
@UseFilters(RpcExceptionFilter)
@UseGuards(AuthGuard)
export class BitacoraController {
  constructor(
    @Inject('BITACORA_SERVICE') private readonly bitacoraClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateBitacoraDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await firstValueFrom(
      this.bitacoraClient.send('bitacora.create', {
        userId: req.user.userId,
        ...dto,
      }),
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return await firstValueFrom(
      this.bitacoraClient.send('bitacora.list', {
        userId: req.user.userId,
      }),
    );
  }
}