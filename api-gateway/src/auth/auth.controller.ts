import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayLoginDto, GatewayRegisterDto, GatewayUpdateNameDto, GatewayUpdatePasswordDto } from './dto/gateway-auth.dto';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';
import { AuthGuard } from '../common/guards/auth.guard';

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

  @Put('profile/name')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateName(@Req() req: any, @Body() dto: GatewayUpdateNameDto) {
    return await firstValueFrom(
      this.authClient.send('auth.update-name', {
        userId: req.user.userId,
        nombre: dto.nombre,
      }),
    );
  }

  @Put('profile/password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Req() req: any, @Body() dto: GatewayUpdatePasswordDto) {
    return await firstValueFrom(
      this.authClient.send('auth.update-password', {
        userId: req.user.userId,
        currentPassword: dto.currentPassword,
        newPassword: dto.newPassword,
      }),
    );
  }
}