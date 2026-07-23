import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ParcelaModule } from './parcela/parcela.module';
import { ProfileModule } from './profile/profile.module';
import { PrismaService } from './prisma/prisma.service';

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const BITACORA_SERVICE = 'BITACORA_SERVICE';

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
    ParcelaModule,
    ProfileModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}