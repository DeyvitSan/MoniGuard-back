import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayLoginDto, GatewayRegisterDto } from './dto/gateway-auth.dto';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';

@Controller('api/v1/auth')
@UseFilters(RpcExceptionFilter)
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: GatewayLoginDto) {
    return await firstValueFrom(
      this.authClient.send('auth.login', {
        email: loginDto.email,
        password: loginDto.password,
      }),
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: GatewayRegisterDto) {
    return await firstValueFrom(
      this.authClient.send('auth.register', {
        nombre: registerDto.nombre,
        email: registerDto.email,
        password: registerDto.password,
      }),
    );
  }
}