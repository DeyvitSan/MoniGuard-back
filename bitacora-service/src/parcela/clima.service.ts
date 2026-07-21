import { Injectable, Logger } from '@nestjs/common';

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    cloud_cover: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
  };
}

export interface ClimaActual {
  temperatura: number;
  humedad: number;
  precipitacion: number;
  probPrecipitacion: number;
  nubosidad: number;
  viento: number;
  actualizadoEn: string;
}

@Injectable()
export class ClimaService {
  private readonly logger = new Logger(ClimaService.name);

  async getClimaActual(lat: number, lng: number): Promise<ClimaActual> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m',
    );
    url.searchParams.set('hourly', 'precipitation_probability');
    url.searchParams.set('forecast_days', '1');
    url.searchParams.set('timezone', 'America/Mexico_City');

    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo respondió ${response.status}`);
      }

      const data = (await response.json()) as OpenMeteoResponse;

      const horaIndex = data.hourly.time.indexOf(data.current.time);
      const probPrecipitacion =
        horaIndex >= 0 ? data.hourly.precipitation_probability[horaIndex] : 0;

      return {
        temperatura: data.current.temperature_2m,
        humedad: data.current.relative_humidity_2m,
        precipitacion: data.current.precipitation,
        probPrecipitacion,
        nubosidad: data.current.cloud_cover,
        viento: data.current.wind_speed_10m,
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