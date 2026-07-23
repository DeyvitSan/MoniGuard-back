import { Module } from '@nestjs/common';
import { BitacoraController } from './bitacora.controller';
import { BitacoraService } from './bitacora.service';
import { TextoAnalisisService } from './texto-analisis.service';

@Module({
  controllers: [BitacoraController],
  providers: [BitacoraService, TextoAnalisisService],
})
export class BitacoraModule {}