import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('api/v1/home')
export class HomeController {
  @Get('dashboard')
  @UseGuards(AuthGuard)
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const { userId, email } = req.user;

    return {
      user: { id: userId, email },
      parcela: {
        id: 'parcela-uuid-001',
        nombre: 'Parcela Norte',
        ubicacion: 'Soconusco, Chiapas',
        hectareas: 3.5,
        cultivo: 'cacao',
      },
      clima: {
        temperatura: 28.4,
        humedad: 78.2,
        precipitacion: 12.5,
        actualizadoEn: new Date().toISOString(),
      },
      riesgo: {
        nivel: 'MEDIO',
        probabilidad: 0.54,
        descripcion: 'Condiciones favorables para desarrollo de moniliasis. Revisar frutos.',
      },
      alertas: [
        {
          id: 'alerta-001',
          tipo: 'CLIMA',
          mensaje: 'Humedad elevada detectada en los últimos 3 días',
          severidad: 'MEDIA',
          fecha: new Date().toISOString(),
        },
      ],
    };
  }
}