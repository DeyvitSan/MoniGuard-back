import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { PrismaService } from './prisma/prisma.service';

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const BITACORA_SERVICE = 'BITACORA_SERVICE';

@Module({
  imports: [
    // Rate limiting global: máx 20 requests / 60s por IP por defecto.
    // Los endpoints de auth tienen un límite más estricto propio (ver auth.controller.ts).
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'localhost',
          port: Number(process.env.AUTH_SERVICE_PORT) || 4001,
        },
      },
      {
        name: BITACORA_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.BITACORA_SERVICE_HOST || 'localhost',
          port: Number(process.env.BITACORA_SERVICE_PORT) || 4002,
        },
      },
    ]),
    AuthModule,
    HomeModule,
    BitacoraModule,
  ],
  providers: [
    PrismaService,
    // Aplica el rate limiting a TODAS las rutas automáticamente.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}