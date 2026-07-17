// auth-service/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_fallback',
      expiresIn: refreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  private formatUser(user: { id: string; nombre: string; email: string; createdAt: Date }) {
    return { id: user.id, nombre: user.nombre, email: user.email, createdAt: user.createdAt };
  }

  async register(nombre: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('Ya existe una cuenta con ese email');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { nombre, email, password: hashedPassword },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { ...tokens, user: this.formatUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales incorrectas');

    const tokens = await this.generateTokens(user.id, user.email);
    return { ...tokens, user: this.formatUser(user) };
  }

  async updateName(userId: string, nombre: string) {
    if (!nombre || nombre.trim().length < 2) {
      throw new BadRequestException('El nombre debe tener al menos 2 caracteres');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { nombre: nombre.trim() },
    });

    return { user: this.formatUser(user), message: 'Nombre actualizado correctamente' };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('La contraseña actual y la nueva son obligatorias');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('La contraseña actual es incorrecta');

    if (newPassword.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async verifyToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return { userId: payload.sub, email: payload.email };
  }
}