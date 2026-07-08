import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

interface CreateBitacoraInput {
  userId: string;
  destino: string;
  destinoLat: number;
  destinoLng: number;
  texto: string;
  temperatura?: number;
  humedad?: number;
  precipitacion?: number;
}

@Injectable()
export class BitacoraService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBitacoraInput) {
    return this.prisma.bitacora.create({
      data: {
        ...data,
        sincronizada: true,
        sincronizadaEn: new Date(),
      },
    });
  }

  async list(userId: string) {
    return this.prisma.bitacora.findMany({
      where: { userId },
      orderBy: { creadaEn: 'desc' },
    });
  }
}