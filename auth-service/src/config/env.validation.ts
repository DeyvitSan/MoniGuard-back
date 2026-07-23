// auth-service/src/config/env.validation.ts
//
// Falla el arranque del servicio si faltan variables de entorno críticas,
// en vez de caer silenciosamente a un secreto por defecto conocido.
// Llamar validateEnv() al inicio de main.ts, ANTES de crear la app.

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'] as const;

const MIN_SECRET_LENGTH = 32;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
        `Revisa tu archivo .env (ver .env.example). El servicio no arrancará sin ellas.`,
    );
  }

  const secretVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;
  for (const key of secretVars) {
    const value = process.env[key] as string;
    if (value.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `❌ ${key} es demasiado corto (${value.length} caracteres). ` +
          `Usa al menos ${MIN_SECRET_LENGTH} caracteres aleatorios. ` +
          `Genera uno con: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
      );
    }
  }

  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      '❌ JWT_SECRET y JWT_REFRESH_SECRET no pueden ser iguales. Genera dos valores distintos.',
    );
  }
}
