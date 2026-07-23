import { Injectable, Logger } from '@nestjs/common';

export interface AnalisisTexto {
  etiqueta: string | null;
  confianza: number | null;
}

@Injectable()
export class TextoAnalisisService {
  private readonly logger = new Logger(TextoAnalisisService.name);
  private readonly mlServiceUrl =
    process.env.ML_SERVICE_URL || 'http://localhost:8001';

  async analizar(texto: string | undefined): Promise<AnalisisTexto> {
    // Sin texto suficiente, no hay nada que analizar — no truena, regresa null.
    if (!texto || texto.trim().length < 5) {
      return { etiqueta: null, confianza: null };
    }

    try {
      const response = await fetch(`${this.mlServiceUrl}/analizar-texto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
        signal: AbortSignal.timeout(15000), // el modelo puede tardar la 1a vez
      });

      if (!response.ok) {
        throw new Error(`Servicio de texto respondió ${response.status}`);
      }

      const data = (await response.json()) as {
        etiqueta: string | null;
        confianza: number | null;
      };

      return { etiqueta: data.etiqueta, confianza: data.confianza };
    } catch (error) {
      // Si el análisis de texto falla, NO debe impedir que se guarde la
      // bitácora — es una señal complementaria, no crítica.
      this.logger.warn(
        `No se pudo analizar el texto de la bitácora: ${error}`,
      );
      return { etiqueta: null, confianza: null };
    }
  }
}