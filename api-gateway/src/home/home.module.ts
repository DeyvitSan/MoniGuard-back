import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
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
      {
        name: 'BITACORA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.BITACORA_SERVICE_HOST || 'localhost',
          port: Number(process.env.BITACORA_SERVICE_PORT) || 4002,
        },
      },
    ]),
  ],
  controllers: [HomeController],
  providers: [AuthGuard, HomeService],
})
export class HomeModule {}