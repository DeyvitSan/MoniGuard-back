import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error = exception.getError() as
      | { statusCode?: number; message?: string }
      | string;

    const statusCode =
      typeof error === 'object' && error.statusCode
        ? error.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      typeof error === 'object' && error.message
        ? error.message
        : 'Error interno del servidor';

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}