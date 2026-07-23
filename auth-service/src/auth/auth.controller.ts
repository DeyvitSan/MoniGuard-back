// auth-service/src/auth/auth.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';

/**
 * En microservicios NestJS, no usamos @Get/@Post como en REST.
 * Usamos @MessagePattern — el Gateway llama a este microservicio
 * enviando un "mensaje" con un nombre de comando (ej: 'auth.login').
 * El microservicio lo recibe aquí y responde.
 */
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Escucha el comando 'auth.login' enviado por el API Gateway.
   * @Payload es el objeto que viene del Gateway: { email, password }
   */
  @MessagePattern('auth.login')
  async login(@Payload() data: { email: string; password: string }) {
    try {
      return await this.authService.login(data.email, data.password);
    } catch (error:any) {
      // RpcException convierte los errores para que el Gateway los reciba bien
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * Escucha el comando 'auth.register' enviado por el API Gateway.
   * @Payload: { nombre, email, password }
   */
  @MessagePattern('auth.register')
  async register(@Payload() data: { nombre: string; email: string; password: string }) {
    try {
      return await this.authService.register(data.nombre, data.email, data.password);
    } catch (error:any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * Escucha 'auth.verify' — el Gateway lo usa para validar el Bearer Token
   * antes de dar acceso al dashboard.
   */
  @MessagePattern('auth.verify')
  async verifyToken(@Payload() data: { token: string }) {
    try {
      return await this.authService.verifyToken(data.token);
    } catch (error) {
      throw new RpcException({
        statusCode: 401,
        message: 'Token inválido o expirado',
      });
    }
  }

  @MessagePattern('auth.me')
  async getMe(@Payload() data: { userId: string }) {
    try {
      return await this.authService.getMe(data.userId);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'No se pudo obtener el usuario',
      });
    }
  }

  @MessagePattern('auth.update-name')
  async updateName(@Payload() data: { userId: string; nombre: string }) {
    try {
      return await this.authService.updateName(data.userId, data.nombre);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error al actualizar el nombre',
      });
    }
  }

  @MessagePattern('auth.update-password')
  async updatePassword(@Payload() data: { userId: string; currentPassword: string; newPassword: string }) {
    try {
      return await this.authService.updatePassword(data.userId, data.currentPassword, data.newPassword);
    } catch (error: any) {
      throw new RpcException({
        statusCode: error.status || 500,
        message: error.message || 'Error al actualizar la contraseña',
      });
    }
  }
}