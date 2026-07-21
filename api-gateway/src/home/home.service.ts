import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface ClimaActual {
  temperatura: number;
  humedad: number;
  precipitacion: number;
  probPrecipitacion: number;
  nubosidad: number;
  viento: number;
  actualizadoEn: string;
}

export interface PrediccionRiesgo {
  nivel: string;
  porcentaje: number;
  descripcion: string;
  probabilidades: Record<string, number>;
}

@Injectable()
export class HomeService {
  private readonly mlServiceUrl =
    process.env.ML_SERVICE_URL || 'http://localhost:8001';

  constructor(
    @Inject('BITACORA_SERVICE') private readonly bitacoraClient: ClientProxy,
  ) {}

  async getDashboardSummary(userId: string) {
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

    const bitacoras = await firstValueFrom(
      this.bitacoraClient.send('bitacora.list', { userId }),
    );
    const ultimaBitacora = bitacoras?.[0]?.creadaEn ?? null;

    if (parcela.destinoLat == null || parcela.destinoLng == null) {
      throw new RpcException({
        statusCode: 422,
        message:
          'Esta parcela no tiene coordenadas registradas. Créala de nuevo desde la app.',
      });
    }

    const clima: ClimaActual = await firstValueFrom(
      this.bitacoraClient.send('parcela.getClima', {
        lat: parcela.destinoLat,
        lng: parcela.destinoLng,
      }),
    );

    const riesgo = await this.predecirRiesgo(clima);

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

  private async predecirRiesgo(
    clima: ClimaActual,
  ): Promise<PrediccionRiesgo> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperatura: clima.temperatura,
          humedad_relativa: clima.humedad,
          precipitacion: clima.precipitacion,
          prob_precipitacion: clima.probPrecipitacion,
          nubosidad: clima.nubosidad,
          viento: clima.viento,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Servicio ML respondió ${response.status}`);
      }

      return (await response.json()) as PrediccionRiesgo;
    } catch (error) {
      throw new RpcException({
        statusCode: 502,
        message: 'No se pudo calcular el riesgo en este momento.',
      });
    }
  }
}