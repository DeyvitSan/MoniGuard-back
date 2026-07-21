import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { BitacoraService } from './bitacora.service';

interface CreateBitacoraPayload {
  userId: string;
  destino: string;
  destinoLat: number;
  destinoLng: number;
  texto?: string;
  temperatura?: number;
  humedad?: number;
  precipitacion?: number;
  fechaObservacion?: string;
  estadoMazorca?: string;
}

@Controller()
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @MessagePattern('bitacora.create')
  async create(@Payload() data: CreateBitacoraPayload) {
    try {
      return await this.bitacoraService.create(data);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  @MessagePattern('bitacora.list')
  async list(@Payload() data: { userId: string }) {
    try {
      return await this.bitacoraService.list(data.userId);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}