import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateParcelaInput {
  userId: string;
  nombre: string;
  ubicacion: string;
  hectareas: number;
  cultivo?: string;
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
      },
    });
  }

  // El usuario puede tener varias parcelas; el front usa la primera
  // por ahora, pero el modelo ya soporta más de una.
  async listByUser(userId: string) {
    return this.prisma.parcela.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Útil para el flujo "¿ya tiene parcela?" en Flutter tras login.
  async hasParcela(userId: string): Promise<boolean> {
    const count = await this.prisma.parcela.count({ where: { userId } });
    return count > 0;
  }
}