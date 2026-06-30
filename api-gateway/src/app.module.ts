import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';

// Token global para inyectar el ClientProxy en cualquier módulo
export const AUTH_SERVICE = 'AUTH_SERVICE';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: Number(process.env.AUTH_SERVICE_PORT) || 4001,
        },
      },
    ]),
    AuthModule,
    HomeModule,
  ],
})
export class AppModule {}