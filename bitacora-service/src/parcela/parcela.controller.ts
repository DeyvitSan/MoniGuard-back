import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ParcelaService } from './parcela.service';

interface CreateParcelaPayload {
  userId: string;
  nombre: string;
  ubicacion: string;
  hectareas: number;
  cultivo?: string;
}

@Controller()
export class ParcelaController {
  constructor(private readonly parcelaService: ParcelaService) {}

  @MessagePattern('parcela.create')
  async create(@Payload() data: CreateParcelaPayload) {
    try {
      return await this.parcelaService.create(data);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  @MessagePattern('parcela.list')
  async list(@Payload() data: { userId: string }) {
    try {
      return await this.parcelaService.listByUser(data.userId);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  @MessagePattern('parcela.hasParcela')
  async hasParcela(@Payload() data: { userId: string }) {
    try {
      const tiene = await this.parcelaService.hasParcela(data.userId);
      return { hasParcela: tiene };
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}