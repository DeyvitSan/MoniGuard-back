import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HomeService {
  constructor(
    @Inject('BITACORA_SERVICE') private readonly bitacoraClient: ClientProxy,
  ) {}

  async getDashboardSummary(userId: string) {
    // Parcela real del usuario (el usuario puede tener varias; usamos la primera).
    const parcelas = await firstValueFrom(
      this.bitacoraClient.send('parcela.list', { userId }),
    );

    if (!parcelas || parcelas.length === 0) {
      throw new RpcException({
        statusCode: 404,
        message: 'No tienes parcelas registradas.',
      });
    }
    const parcela = parcelas[0];

    // Última bitácora real, para el card "Registro de campo".
    const bitacoras = await firstValueFrom(
      this.bitacoraClient.send('bitacora.list', { userId }),
    );
    const ultimaBitacora = bitacoras?.[0]?.creadaEn ?? null;

    // Fase 3: clima real vía Open-Meteo. Sin fallback a propósito, para que
    // cualquier falla (parcela sin coordenadas, Open-Meteo caído, timeout)
    // se vea explícita en vez de esconderse detrás de datos falsos.
    if (parcela.destinoLat == null || parcela.destinoLng == null) {
      throw new RpcException({
        statusCode: 422,
        message:
          'Esta parcela no tiene coordenadas registradas. Créala de nuevo desde la app.',
      });
    }

    const clima = await firstValueFrom(
      this.bitacoraClient.send('parcela.getClima', {
        lat: parcela.destinoLat,
        lng: parcela.destinoLng,
      }),
    );

    // TODO(Fase 3b - K-Means + clasificador supervisado): reemplazar por
    // la predicción real del microservicio FastAPI. Por ahora placeholder
    // explícito, NO inventamos un nivel alto/medio falso.
    const riesgo = {
      nivel: 'bajo',
      porcentaje: 20,
      descripcion:
        'Pipeline de predicción de riesgo aún no conectado (pendiente Minería de Datos).',
    };

    return {
      parcela: {
        id: parcela.id,
        nombre: parcela.nombre,
        ubicacion: parcela.ubicacion,
      },
      clima,
      riesgo,
      alertasActivas: 0,
      ultimaBitacora,
    };
  }
}