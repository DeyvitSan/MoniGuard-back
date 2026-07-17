import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: Number(process.env.AUTH_SERVICE_PORT) || 4001,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthGuard],
})
export class AuthModule {}