// auth-service/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
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

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_fallback',
      expiresIn: '7d',
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

  async verifyToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return { userId: payload.sub, email: payload.email };
  }
}