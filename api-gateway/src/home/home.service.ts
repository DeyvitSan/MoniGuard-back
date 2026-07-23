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

export interface AnalisisCombinado {
  veredicto: string; 
  porcentaje: number;
  recomendacion: string;
  fuentes: {
    clima: { nivel: string; peso: number };
    campo: { etiquetaPredominante: string | null; peso: number; bitacorasAnalizadas: number };
  };
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

    // Análisis combinado: clima + evidencia de campo reciente.
    const analisisCombinado = this.combinarAnalisis(riesgo, bitacoras ?? []);

    return {
      parcela: {
        id: parcela.id,
        nombre: parcela.nombre,
        ubicacion: parcela.ubicacion,
      },
      clima,
      riesgo,
      analisisCombinado,
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

  private combinarAnalisis(
    riesgo: PrediccionRiesgo,
    bitacoras: any[],
  ): AnalisisCombinado {
    const NIVEL_A_SCORE: Record<string, number> = { bajo: 1, medio: 2, alto: 3 };
    const SCORE_A_NIVEL = ['BAJO', 'BAJO', 'MEDIO', 'ALTO']; // índice 1,2,3

    const scoreClima = NIVEL_A_SCORE[riesgo.nivel] ?? 1;

    // Toma las últimas 5 bitácoras que sí tengan análisis de texto.
    const ETIQUETA_A_SCORE: Record<string, number> = {
      'sin síntomas': 1,
      'síntomas leves': 2,
      'síntomas graves': 3,
    };

    const recientes = bitacoras
      .filter((b) => b.analisisTextoEtiqueta)
      .slice(0, 5);

    let scoreCampo: number | null = null;
    let etiquetaPredominante: string | null = null;

    if (recientes.length > 0) {
      let sumaPonderada = 0;
      let sumaPesos = 0;
      const conteo: Record<string, number> = {};

      for (const b of recientes) {
        const score = ETIQUETA_A_SCORE[b.analisisTextoEtiqueta] ?? 1;
        const confianza = b.analisisTextoConfianza ?? 0.5;
        sumaPonderada += score * confianza;
        sumaPesos += confianza;
        conteo[b.analisisTextoEtiqueta] = (conteo[b.analisisTextoEtiqueta] ?? 0) + 1;
      }

      scoreCampo = sumaPesos > 0 ? sumaPonderada / sumaPesos : 1;
      etiquetaPredominante = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Si no hay bitácoras con análisis, el veredicto se basa 100% en clima.
    const pesoClima = scoreCampo !== null ? 0.6 : 1.0;
    const pesoCampo = scoreCampo !== null ? 0.4 : 0.0;

    const scoreFinal =
      scoreClima * pesoClima + (scoreCampo ?? 0) * pesoCampo;

    const veredicto = SCORE_A_NIVEL[Math.round(scoreFinal)] ?? 'MEDIO';
    const porcentaje = Math.round((scoreFinal / 3) * 100);

    const recomendaciones: Record<string, string> = {
      BAJO: 'Las condiciones actuales, tanto climáticas como de campo, son poco favorables para el avance de moniliasis. Mantén el monitoreo regular.',
      MEDIO: 'Se detectan señales moderadas de riesgo. Se recomienda aumentar la frecuencia de revisión de las mazorcas en los próximos días.',
      ALTO: 'Las condiciones climáticas y/o las observaciones de campo recientes indican riesgo elevado. Se recomienda revisar mazorcas de inmediato y considerar medidas preventivas.',
    };

    return {
      veredicto,
      porcentaje,
      recomendacion: recomendaciones[veredicto],
      fuentes: {
        clima: { nivel: riesgo.nivel.toUpperCase(), peso: pesoClima },
        campo: {
          etiquetaPredominante,
          peso: pesoCampo,
          bitacorasAnalizadas: recientes.length,
        },
      },
    };
  }
}