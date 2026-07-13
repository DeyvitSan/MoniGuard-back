import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ParcelaModule } from './parcela/parcela.module';

@Module({
  imports: [
    PrismaModule,
    BitacoraModule,
    ParcelaModule,
  ],
})
export class AppModule {}