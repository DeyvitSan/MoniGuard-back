import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateParcelaInput {
  userId: string;
  nombre: string;
  ubicacion: string;
  hectareas: number;
  cultivo?: string;
  destinoLat?: number;
  destinoLng?: number;
}

@Injectable()
export class ParcelaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateParcelaInput) {
    return this.prisma.parcela.create({
      data: {
        userId: data.userId,
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        hectareas: data.hectareas,
        cultivo: data.cultivo ?? 'cacao',
        destinoLat: data.destinoLat,
        destinoLng: data.destinoLng,
      },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.parcela.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasParcela(userId: string): Promise<boolean> {
    const count = await this.prisma.parcela.count({ where: { userId } });
    return count > 0;
  }
}