import { Module } from '@nestjs/common';
import { ParcelaController } from './parcela.controller';
import { ParcelaService } from './parcela.service';
import { ClimaService } from './clima.service';

@Module({
  controllers: [ParcelaController],
  providers: [ParcelaService, ClimaService],
  exports: [ClimaService],
})
export class ParcelaModule {}