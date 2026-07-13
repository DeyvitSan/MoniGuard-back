import { Module } from '@nestjs/common';
import { ParcelaController } from './parcela.controller';
import { ParcelaService } from './parcela.service';

@Module({
  controllers: [ParcelaController],
  providers: [ParcelaService],
})
export class ParcelaModule {}