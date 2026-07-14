import { Injectable, Logger } from '@nestjs/common';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
}

export interface ClimaActual {
  temperatura: number;
  humedad: number;
  precipitacion: number;
  actualizadoEn: string;
}

@Injectable()
export class ClimaService {
  private readonly logger = new Logger(ClimaService.name);

  // Fase 3: solo Open-Meteo. El SMN (CONAGUA) queda pendiente como Fase 3b.
  async getClimaActual(lat: number, lng: number): Promise<ClimaActual> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation',
    );
    url.searchParams.set('timezone', 'America/Mexico_City');

    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo respondió ${response.status}`);
      }

      const data = (await response.json()) as OpenMeteoResponse;

      return {
        temperatura: data.current.temperature_2m,
        humedad: data.current.relative_humidity_2m,
        precipitacion: data.current.precipitation,
        actualizadoEn: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `No se pudo obtener clima de Open-Meteo para (${lat}, ${lng})`,
        error,
      );
      throw error;
    }
  }
}