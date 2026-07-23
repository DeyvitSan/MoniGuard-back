// api-gateway/src/config/env.validation.ts
//
// Falla el arranque del gateway si falta configuración crítica,
// en vez de caer silenciosamente a defaults inseguros (ej. CORS abierto a *).
// Llamar validateEnv() al inicio de main.ts, ANTES de crear la app.

export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      '❌ Falta la variable de entorno DATABASE_URL. Revisa tu archivo .env (ver .env.example).',
    );
  }

  if (!process.env.CORS_ORIGINS) {
    throw new Error(
      '❌ Falta la variable de entorno CORS_ORIGINS. Debe listar los orígenes permitidos ' +
        'separados por coma (ej: "http://localhost:8080,https://app.moniguard.com"). ' +
        'Nunca uses "*" en producción.',
    );
  }
}

export function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
