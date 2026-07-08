import { Module } from '@nestjs/common';
import { PrismaModule } from './bitacora/prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';

@Module({
  imports: [
    PrismaModule,
    BitacoraModule,
  ],
})
export class AppModule {}