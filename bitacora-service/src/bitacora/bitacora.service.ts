import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TextoAnalisisService } from './texto-analisis.service';

interface CreateBitacoraInput {
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

@Injectable()
export class BitacoraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly textoAnalisis: TextoAnalisisService,
  ) {}

  async create(data: CreateBitacoraInput) {
    // Analiza el texto libre (si hay) ANTES de guardar, para incluir
    // el resultado en el mismo registro.
    const analisis = await this.textoAnalisis.analizar(data.texto);

    return this.prisma.bitacora.create({
      data: {
        userId: data.userId,
        destino: data.destino,
        destinoLat: data.destinoLat,
        destinoLng: data.destinoLng,
        texto: data.texto,
        temperatura: data.temperatura,
        humedad: data.humedad,
        precipitacion: data.precipitacion,
        estadoMazorca: data.estadoMazorca,
        analisisTextoEtiqueta: analisis.etiqueta,
        analisisTextoConfianza: analisis.confianza,
        fechaObservacion: data.fechaObservacion
          ? new Date(data.fechaObservacion)
          : new Date(),
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