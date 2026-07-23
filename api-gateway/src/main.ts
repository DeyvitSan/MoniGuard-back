import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from './common/filters/rpc-exception.filter';
import { validateEnv, getAllowedOrigins } from './config/env.validation';

async function bootstrap() {
  // Falla rápido si falta config crítica (CORS_ORIGINS, DATABASE_URL) en vez
  // de arrancar con defaults inseguros como CORS abierto a cualquier origen.
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Helmet: headers de seguridad HTTP (X-Content-Type-Options, HSTS,
  // X-Frame-Options/CSP frame-ancestors contra clickjacking, etc.)
  app.use(helmet());

  // CORS restringido a los orígenes explícitamente permitidos por env var.
  // Nunca origin: '*' — eso permitiría a cualquier sitio web llamar la API
  // usando el token de un usuario si logra obtenerlo (ej. vía XSS en otro sitio).
  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Registra el filtro globalmente
  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`🌐 API Gateway corriendo en http://localhost:${port}`);
}

bootstrap();